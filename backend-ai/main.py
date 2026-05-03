from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import json
import re

USE_RAG = os.getenv("USE_RAG", "true").lower() == "true"

if USE_RAG:
    print("🚀 Starting in RAG mode (optimized)")
    from rag_engine import RAGEngine, EMERGENCY_KEYWORDS, LLM_MODEL
    from chat_memory import ChatMemory
    rag_engine = RAGEngine()
    memory_store = ChatMemory()
    from groq import AsyncGroq
    groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
else:
    print("🚀 Starting in LIGHTWEIGHT mode (no RAG)")
    rag_engine = None
    memory_store = None
    groq_client = None

# ── FastAPI Setup ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Medical RAG Chatbot",
    version="2.0.0-optimized",
    description="Ultra-lightweight medical chatbot with optional RAG"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request/Response Models ───────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    session_id: str

class ClearRequest(BaseModel):
    session_id: str

class ScreeningAnalysisRequest(BaseModel):
    complaint: str
    severity: str
    duration: str
    additional_symptoms: str

class ScreeningResult(BaseModel):
    disease: str
    confidence: float
    specialist: str
    specialistCode: str
    tips: list[str]
    symptoms: str

# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong")

    if USE_RAG:
        history = memory_store.get_history(req.session_id)
        result = await rag_engine.query(
            question=req.message,
            chat_history=history,
            session_id=req.session_id,
        )
        memory_store.add_turn(
            session_id=req.session_id,
            user_msg=req.message,
            assistant_msg=result["answer"],
        )
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            session_id=req.session_id,
        )
    else:
        from rag_engine import detectDisease, DISEASE_MAP
        detected = detectDisease(req.message)
        disease_info = DISEASE_MAP.get(detected["key"], DISEASE_MAP["demam"])
        answer = f"""Berdasarkan gejala yang Anda sebutkan, kemungkinan Anda mengalami **{disease_info['name']}**.\n\n**Saran:**\n"""
        for tip in disease_info["tips"]:
            answer += f"\n• {tip}"
        answer += "\n\n⚠️ **Penting:** Konsultasikan dengan dokter untuk diagnosis yang akurat."
        return ChatResponse(
            answer=answer,
            sources=[{"title": disease_info["name"], "score": detected["score"] / 10, "category": "screening"}],
            session_id=req.session_id,
        )


@app.post("/clear")
async def clear_session(req: ClearRequest):
    if USE_RAG:
        memory_store.clear(req.session_id)
    return {"status": "ok", "message": f"History sesi {req.session_id} dihapus"}


@app.get("/history/{session_id}")
async def get_history(session_id: str):
    if USE_RAG:
        return {"history": memory_store.get_history(session_id)}
    return {"history": []}


@app.post("/api/screening/analyze", response_model=ScreeningResult)
async def analyze_symptoms(req: ScreeningAnalysisRequest):
    # 1. Emergency check
    full_text = f"{req.complaint} {req.additional_symptoms}".lower()
    if any(kw in full_text for kw in EMERGENCY_KEYWORDS):
        raise HTTPException(
            status_code=400,
            detail="Kondisi darurat terdeteksi — Segera hubungi layanan gawat darurat"
        )

    if not USE_RAG:
        raise HTTPException(status_code=503, detail="RAG mode tidak aktif")

    # 2. Buat query lengkap
    full_query = (
        f"Keluhan: {req.complaint}. "
        f"Tingkat keparahan: {req.severity}. "
        f"Durasi: {req.duration}. "
        f"Gejala tambahan: {req.additional_symptoms}."
    )

    # 3. Retrieve dokumen via RAG
    query_embedding = await rag_engine.get_embedding(full_query)
    documents = await rag_engine.retrieve_documents(query_embedding)
    context = rag_engine._build_context(documents)

    # 4. Prompt structured JSON output
    screening_prompt = f"""Kamu adalah asisten medis. Analisis gejala pasien berdasarkan dokumen referensi dan kembalikan HANYA JSON valid tanpa teks lain.

Dokumen referensi:
{context}

Data pasien:
- Keluhan utama: {req.complaint}
- Tingkat keparahan: {req.severity}
- Durasi: {req.duration}
- Gejala tambahan: {req.additional_symptoms}

Kembalikan JSON dengan format PERSIS seperti ini (tanpa markdown, tanpa komentar):
{{
  "disease": "nama penyakit lengkap beserta nama latin dalam kurung",
  "confidence": angka_bulat_antara_55_dan_94,
  "specialist": "nama spesialis yang sesuai",
  "specialistCode": "satu kata kode spesialis: umum/paru/saraf/gastro/jantung/kulit/mata/thp",
  "tips": [
    "tip pertama",
    "tip kedua",
    "tip ketiga",
    "tip keempat"
  ],
  "symptoms": "ringkasan singkat gejala dalam satu kalimat"
}}"""

    messages = [
        {"role": "system", "content": "Kamu adalah asisten medis yang hanya membalas dengan JSON valid."},
        {"role": "user", "content": screening_prompt}
    ]

    # 5. Generate via Groq
    response = await groq_client.chat.completions.create(
        model=LLM_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=512,
        stream=False,
    )

    raw = response.choices[0].message.content.strip()

    # 6. Parse JSON
    raw = re.sub(r"```json\s*|\s*```", "", raw).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            raise HTTPException(status_code=500, detail="LLM tidak mengembalikan JSON valid")

    return ScreeningResult(
        disease=data.get("disease", "Tidak terdeteksi"),
        confidence=float(data.get("confidence", 60)),
        specialist=data.get("specialist", "Dokter Umum"),
        specialistCode=data.get("specialistCode", "umum"),
        tips=data.get("tips", ["Konsultasikan dengan dokter untuk diagnosis lebih lanjut."]),
        symptoms=data.get("symptoms", req.complaint),
    )


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mode": "rag-optimized" if USE_RAG else "lightweight",
    }


@app.get("/")
async def root():
    return {
        "service": "Medical RAG Chatbot",
        "version": "2.0.0-optimized",
        "mode": "rag" if USE_RAG else "lightweight",
        "endpoints": {
            "chat": "/chat",
            "screening": "/api/screening/analyze",
            "health": "/health",
        }
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print("\n" + "="*60)
    print(f"🩺 Medical Chatbot - {'RAG Mode (Optimized)' if USE_RAG else 'Lightweight Mode'}")
    print("="*60 + "\n")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
    )