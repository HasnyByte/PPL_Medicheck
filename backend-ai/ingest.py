"""
Document Ingestion Script
==========================
Gunakan script ini untuk memasukkan dokumen penyakit ke TiDB dengan embedding.

Cara pakai:
  python ingest.py --file data/penyakit.json
  python ingest.py --folder data/documents/

Format JSON yang didukung:
[
  {
    "doc_id": "diabetes-001",
    "title": "Diabetes Mellitus",
    "content": "Diabetes mellitus adalah penyakit kronis...",
    "category": "metabolik"
  },
  ...
]
"""

import os
import json
import asyncio
import argparse
import time
from pathlib import Path

from openai import AsyncOpenAI
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = "text-embedding-3-small"
BATCH_SIZE = 20  # Proses N dokumen sekaligus untuk hemat API call


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
    )


def create_table_if_not_exists(cursor):
    """Buat tabel jika belum ada."""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disease_documents (
            id          BIGINT PRIMARY KEY AUTO_INCREMENT,
            doc_id      VARCHAR(100) UNIQUE NOT NULL,
            title       VARCHAR(500)        NOT NULL,
            content     TEXT                NOT NULL,
            category    VARCHAR(100)        DEFAULT 'umum',
            embedding   VECTOR(1536),
            metadata    JSON,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_doc_id (doc_id)
        )
    """)
    print("✅ Tabel disease_documents siap")


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Buat embedding untuk batch teks sekaligus (lebih efisien)."""
    cleaned = [t.replace("\n", " ").strip() for t in texts]
    response = await client.embeddings.create(
        input=cleaned,
        model=EMBEDDING_MODEL,
    )
    return [item.embedding for item in response.data]


def upsert_documents(cursor, docs_with_embeddings: list[dict]):
    """Insert atau update dokumen di TiDB."""
    sql = """
        INSERT INTO disease_documents (doc_id, title, content, category, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            title     = VALUES(title),
            content   = VALUES(content),
            category  = VALUES(category),
            embedding = VALUES(embedding),
            metadata  = VALUES(metadata),
            updated_at = CURRENT_TIMESTAMP
    """
    for doc in docs_with_embeddings:
        cursor.execute(sql, (
            doc["doc_id"],
            doc["title"],
            doc["content"],
            doc.get("category", "umum"),
            json.dumps(doc["embedding"]),   # TiDB menerima JSON array untuk VECTOR
            json.dumps(doc.get("metadata", {})),
        ))


async def ingest_file(filepath: str):
    """Proses satu file JSON."""
    print(f"\n📄 Memproses file: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        documents = json.load(f)

    if not isinstance(documents, list):
        documents = [documents]

    print(f"   Ditemukan {len(documents)} dokumen")

    conn = get_tidb_connection()
    cursor = conn.cursor()
    create_table_if_not_exists(cursor)
    conn.commit()

    # Proses per batch
    total_inserted = 0
    for i in range(0, len(documents), BATCH_SIZE):
        batch = documents[i:i + BATCH_SIZE]
        texts = [
            f"{doc['title']}\n\n{doc['content']}"  # Gabungkan title+content untuk embedding lebih kaya
            for doc in batch
        ]

        print(f"   Embedding batch {i//BATCH_SIZE + 1}/{(len(documents)-1)//BATCH_SIZE + 1}...")
        embeddings = await embed_texts(texts)

        docs_with_emb = []
        for doc, emb in zip(batch, embeddings):
            docs_with_emb.append({**doc, "embedding": emb})

        upsert_documents(cursor, docs_with_emb)
        conn.commit()
        total_inserted += len(batch)
        print(f"   ✅ {total_inserted}/{len(documents)} dokumen berhasil dimasukkan")

        # Rate limiting sederhana
        if i + BATCH_SIZE < len(documents):
            await asyncio.sleep(0.5)

    cursor.close()
    conn.close()
    print(f"\n🎉 Selesai! Total {total_inserted} dokumen dimasukkan ke TiDB")


async def main():
    parser = argparse.ArgumentParser(description="Ingest dokumen penyakit ke TiDB")
    parser.add_argument("--file",   help="Path ke file JSON")
    parser.add_argument("--folder", help="Path ke folder berisi file JSON")
    args = parser.parse_args()

    if args.file:
        await ingest_file(args.file)
    elif args.folder:
        folder = Path(args.folder)
        json_files = list(folder.glob("*.json"))
        print(f"Ditemukan {len(json_files)} file JSON di {folder}")
        for f in json_files:
            await ingest_file(str(f))
    else:
        # Contoh data dummy untuk testing
        print("Tidak ada file yang diberikan. Membuat contoh data...")
        sample_data = [
            {
                "doc_id": "diabetes-001",
                "title": "Diabetes Mellitus Tipe 2",
                "content": """Diabetes mellitus tipe 2 adalah kondisi kronis yang memengaruhi cara tubuh 
                memproses gula darah (glukosa). Pada diabetes tipe 2, tubuh tidak memproduksi cukup insulin 
                atau tidak menggunakan insulin dengan efektif.
                
                Gejala utama:
                - Sering buang air kecil (poliuria)
                - Rasa haus yang berlebihan (polidipsia)  
                - Mudah lapar (polifagia)
                - Kelelahan yang tidak biasa
                - Penglihatan kabur
                - Luka yang sulit sembuh
                
                Faktor risiko: obesitas, kurang aktivitas fisik, riwayat keluarga, usia di atas 45 tahun.
                
                Pengobatan meliputi perubahan gaya hidup, obat-obatan oral (metformin), dan insulin jika diperlukan.""",
                "category": "metabolik",
                "metadata": {"source": "WHO Guidelines 2024", "icd10": "E11"}
            },
            {
                "doc_id": "hipertensi-001",
                "title": "Hipertensi (Tekanan Darah Tinggi)",
                "content": """Hipertensi adalah kondisi di mana tekanan darah secara konsisten berada 
                di atas 130/80 mmHg. Sering disebut 'silent killer' karena sering tidak menunjukkan gejala.
                
                Klasifikasi:
                - Normal: < 120/80 mmHg
                - Elevated: 120-129 / < 80 mmHg
                - Hipertensi Stage 1: 130-139 / 80-89 mmHg
                - Hipertensi Stage 2: ≥ 140 / ≥ 90 mmHg
                
                Gejala (jika ada): sakit kepala, sesak napas, mimisan, kelelahan.
                
                Penanganan: diet rendah garam (DASH diet), olahraga teratur, 
                obat antihipertensi (ACE inhibitor, ARB, beta-blocker, diuretik).""",
                "category": "kardiovaskular",
                "metadata": {"source": "JNC 8 Guidelines", "icd10": "I10"}
            }
        ]
        
        # Simpan ke file sementara
        with open("/tmp/sample_diseases.json", "w") as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        await ingest_file("/tmp/sample_diseases.json")


if __name__ == "__main__":
    asyncio.run(main())
