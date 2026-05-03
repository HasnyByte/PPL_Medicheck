"""
RAG Engine — ULTRA LIGHTWEIGHT VERSION
=======================================
Memory target: ~200-250MB

Optimization strategies:
1. fastembed instead of sentence_transformers+torch (73MB vs 725MB on import)
2. Lazy loading with aggressive cleanup
3. Reduced context window
4. Minimal history retention
5. Direct connections for TiDB
"""

import os
import asyncio
import json
import gc
from typing import Optional

from groq import AsyncGroq
import mysql.connector

from dotenv import load_dotenv
load_dotenv()

# ── Global state (lazy loaded) ────────────────────────────────────────────────

_embed_model = None
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


def _load_embedding_model():
    """Lazy load embedding model dengan fastembed (no PyTorch)"""
    global _embed_model

    if _embed_model is not None:
        return _embed_model

    from fastembed import TextEmbedding  # import di sini, bukan top-level

    print("⏳ Loading embedding model (fastembed)...")
    _embed_model = TextEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    print("✅ Embedding model loaded (~165MB)")
    return _embed_model


def _cleanup_memory():
    """Garbage collection"""
    gc.collect()


def _unload_model():
    """Force unload model untuk free memory (extreme case)"""
    global _embed_model
    if _embed_model is not None:
        del _embed_model
        _embed_model = None
        _cleanup_memory()
        print("🗑️  Embedding model unloaded")


# ── Konfigurasi ────────────────────────────────────────────────────────────────

LLM_MODEL            = "llama-3.3-70b-versatile"
TOP_K                = 3
MAX_HISTORY_TURNS    = 3
SIMILARITY_THRESHOLD = 0.70
MAX_CONTEXT_CHARS    = 1500

SYSTEM_PROMPT = """Kamu adalah asisten medis virtual yang berpengetahuan luas tentang penyakit.
Tugasmu adalah menjawab pertanyaan kesehatan berdasarkan dokumen referensi yang diberikan.

Aturan penting:
1. Jawab HANYA berdasarkan konteks dokumen yang diberikan. Jika tidak ada informasi yang relevan, katakan dengan jujur.
2. Gunakan Bahasa Indonesia yang mudah dipahami masyarakat umum, hindari jargon medis berlebihan.
3. Selalu ingatkan pengguna untuk berkonsultasi dengan dokter untuk diagnosis dan pengobatan resmi.
4. Jaga konteks percakapan — jika pengguna bertanya "gejalanya apa?" tanpa menyebut penyakit,
   rujuk ke penyakit yang dibahas sebelumnya dalam percakapan.
5. Jangan membuat informasi medis yang tidak ada di dokumen referensi.
6. Jika pertanyaan di luar topik medis/kesehatan, arahkan kembali ke topik tersebut dengan sopan.

Format jawaban: Singkat, padat, dan jelas. Maksimal 3-4 paragraf.
"""


# ── TiDB Connection ────────────────────────────────────────────────────────────

def get_tidb_connection():
    return mysql.connector.connect(
        host=os.getenv("TIDB_HOST", "localhost"),
        port=int(os.getenv("TIDB_PORT", 4000)),
        user=os.getenv("TIDB_USER", "root"),
        password=os.getenv("TIDB_PASSWORD", ""),
        database=os.getenv("TIDB_DATABASE", "medical_db"),
        ssl_ca=os.getenv("TIDB_SSL_CA"),
        ssl_verify_cert=True if os.getenv("TIDB_SSL_CA") else False,
        ssl_verify_identity=True if os.getenv("TIDB_SSL_CA") else False,
        autocommit=True,
        connection_timeout=10,
    )


# ── RAG Engine ────────────────────────────────────────────────────────────────

class RAGEngine:
    def __init__(self):
        print("✅ RAGEngine initialized (ULTRA-LIGHTWEIGHT mode)")
        print(f"   Embedding : fastembed all-MiniLM-L6-v2 (~165MB) - lazy load")
        print(f"   LLM       : {LLM_MODEL} via Groq")
        print(f"   Top-K     : {TOP_K}")
        print(f"   History   : {MAX_HISTORY_TURNS} turns")
        print(f"   Context   : {MAX_CONTEXT_CHARS} chars max")
        self._request_count = 0

    # ── Step 1: Embedding ─────────────────────────────────────────────────────

    async def get_embedding(self, text: str) -> list[float]:
        text = text.replace("\n", " ").strip()
        model = _load_embedding_model()

        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            None,
            lambda: list(model.embed([text]))[0].tolist()
        )
        return embedding

    # ── Step 2: Retrieve dari TiDB ────────────────────────────────────────────

    async def retrieve_documents(self, query_embedding: list[float]) -> list[dict]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_retrieve, query_embedding)

    def _sync_retrieve(self, query_embedding: list[float]) -> list[dict]:
        conn = None
        cursor = None
        try:
            conn = get_tidb_connection()
            cursor = conn.cursor(dictionary=True)

            sql = """
                SELECT
                    doc_id,
                    title,
                    content,
                    category,
                    VEC_COSINE_DISTANCE(embedding, %s) AS distance
                FROM disease_documents
                ORDER BY distance ASC
                LIMIT %s
            """
            cursor.execute(sql, (json.dumps(query_embedding), TOP_K))
            rows = cursor.fetchall()

            min_distance = 1 - SIMILARITY_THRESHOLD
            results = []
            for row in rows:
                dist = float(row["distance"])
                if dist <= min_distance:
                    results.append({
                        "doc_id":   row["doc_id"],
                        "title":    row["title"],
                        "content":  row["content"][:800],
                        "category": row["category"],
                        "score":    round(1 - dist, 4),
                    })
            return results

        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    # ── Step 3: Build context ─────────────────────────────────────────────────

    def _build_context(self, documents: list[dict]) -> str:
        if not documents:
            return "Tidak ada dokumen relevan ditemukan."

        parts = []
        total_chars = 0

        for i, doc in enumerate(documents, 1):
            content = doc["content"]
            if len(content) > 500:
                content = content[:500] + "..."

            part = f"[Dok {i}] {doc['title']}\n{content}"
            if total_chars + len(part) > MAX_CONTEXT_CHARS:
                break

            parts.append(part)
            total_chars += len(part)

        return "\n\n".join(parts)

    # ── Step 4: Build messages ────────────────────────────────────────────────

    def _build_messages(self, question: str, context: str, chat_history: list[dict]) -> list[dict]:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        recent = chat_history[-(MAX_HISTORY_TURNS * 2):]
        messages.extend(recent)
        user_content = (
            f"Referensi:\n{context}\n\n"
            f"Pertanyaan: {question}\n\n"
            f"Jawab singkat berdasarkan referensi di atas."
        )
        messages.append({"role": "user", "content": user_content})
        return messages

    # ── Step 5: Generate via Groq ─────────────────────────────────────────────

    async def _generate(self, messages: list[dict]) -> str:
        response = await groq_client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=512,
            top_p=0.9,
            stream=False,
        )
        return response.choices[0].message.content

    # ── Pipeline utama ────────────────────────────────────────────────────────

    async def query(self, question: str, chat_history: list[dict], session_id: str) -> dict:
        try:
            self._request_count += 1

            enriched_query = question
            if chat_history and len(question) < 20:
                last_msg = next(
                    (m["content"][:100] for m in reversed(chat_history)
                     if m["role"] == "assistant"),
                    ""
                )
                if last_msg:
                    enriched_query = f"{last_msg} {question}"

            query_embedding = await self.get_embedding(enriched_query)
            documents = await self.retrieve_documents(query_embedding)
            context = self._build_context(documents)
            messages = self._build_messages(question, context, chat_history)
            answer = await self._generate(messages)

            return {
                "answer": answer,
                "sources": [
                    {
                        "title": doc["title"],
                        "score": doc["score"],
                        "category": doc["category"]
                    }
                    for doc in documents
                ]
            }

        finally:
            _cleanup_memory()


# ── Helper functions untuk screening ─────────────────────────────────────────

EMERGENCY_KEYWORDS = [
    "nyeri dada", "sesak napas berat", "pingsan", "lumpuh",
    "tidak sadar", "stroke", "serangan jantung",
]

DISEASE_MAP = {
    "flu": {
        "name": "Influenza (Flu)",
        "specialist": "Dokter Umum",
        "specialistCode": "umum",
        "tips": [
            "Istirahat cukup minimal 7–8 jam per malam",
            "Perbanyak konsumsi cairan hangat",
            "Konsumsi makanan bergizi untuk memperkuat imunitas",
            "Hindari kontak dekat untuk mencegah penularan",
        ],
        "keywords": ["flu", "pilek", "bersin", "hidung tersumbat", "ingusan", "meriang", "badan pegal", "rinorea"],
    },
    "demam": {
        "name": "Demam (Febris)",
        "specialist": "Dokter Umum",
        "specialistCode": "umum",
        "tips": [
            "Kompres hangat pada dahi dan ketiak",
            "Perbanyak minum untuk mencegah dehidrasi",
            "Gunakan pakaian tipis dan nyaman",
            "Pantau suhu tubuh secara berkala — bila >39°C segera ke dokter",
        ],
        "keywords": ["demam", "panas", "suhu tinggi", "menggigil", "keringat dingin", "badan panas", "febris"],
    },
    "batuk": {
        "name": "Batuk (Bronkitis)",
        "specialist": "Spesialis Paru",
        "specialistCode": "paru",
        "tips": [
            "Minum air hangat dengan madu dan lemon",
            "Hindari paparan asap rokok dan debu",
            "Istirahat suara — kurangi berbicara keras",
            "Hindari makanan berminyak dan terlalu dingin",
        ],
        "keywords": ["batuk", "dahak", "berdahak", "tenggorokan gatal", "radang tenggorokan"],
    },
    "maag": {
        "name": "Gastritis (Maag)",
        "specialist": "Spesialis Gastroenterologi",
        "specialistCode": "gastro",
        "tips": [
            "Makan dalam porsi kecil namun lebih sering (5–6x sehari)",
            "Hindari makanan pedas, asam, dan berminyak",
            "Hindari minuman berkafein dan bersoda",
            "Jangan berbaring segera setelah makan",
        ],
        "keywords": ["maag", "lambung", "mual", "kembung", "nyeri ulu hati", "asam lambung", "perut perih", "mulas"],
    },
    "kepala": {
        "name": "Sakit Kepala (Cephalgia)",
        "specialist": "Spesialis Saraf",
        "specialistCode": "saraf",
        "tips": [
            "Beristirahat di ruangan yang tenang dan redup",
            "Kompres dingin atau hangat di dahi",
            "Cukupi kebutuhan cairan — dehidrasi sering memicu sakit kepala",
            "Atur posisi duduk dan tidur yang ergonomis",
        ],
        "keywords": ["sakit kepala", "pusing", "migrain", "kepala berdenyut", "kepala berat", "vertigo"],
    },
}

def detectDisease(text: str):
    norm = text.lower()
    results = [
        {
            "key": key,
            "score": sum(1 for kw in disease_data["keywords"] if kw in norm),
        }
        for key, disease_data in DISEASE_MAP.items()
    ]
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[0] if results else {"key": "demam", "score": 0}

def calcConfidence(base_score: int, severity: str, duration: str) -> float:
    confidence = 62 + base_score * 8 if base_score > 0 else 55
    if severity in ["Berat (7–9)", "Sangat Berat (10)"]:
        confidence += 6
    if duration in ["4–7 hari", "Lebih dari seminggu"]:
        confidence += 4
    return min(94, max(58, confidence))