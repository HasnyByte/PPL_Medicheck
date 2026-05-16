from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn, os, json, re, asyncio
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
LLM_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")
USE_GROQ = bool(GROQ_API_KEY)

groq_client = None
if USE_GROQ:
    try:
        from groq import AsyncGroq
        groq_client = AsyncGroq(api_key=GROQ_API_KEY)
        print(f"✅ Groq AI connected (model: {LLM_MODEL})")
    except Exception as e:
        print(f"⚠️ Groq init failed: {e}")
        USE_GROQ = False

app = FastAPI(title="MediCheck AI", version="3.0.0", description="AI Backend for MediCheck Medical App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory chat history ────────────────────────────────────────────────────
chat_sessions: dict[str, list] = {}

EMERGENCY_KEYWORDS = [
    "nyeri dada", "serangan jantung", "sesak napas berat", "pingsan", "tidak sadar",
    "stroke", "lumpuh mendadak", "kejang", "muntah darah", "perdarahan hebat",
    "kecelakaan", "overdosis", "tersedak", "reaksi alergi berat",
]

SPECIALIST_MAP = {
    "jantung": {"name": "Dokter Jantung (Sp.JP)", "code": "jantung", "keywords": ["jantung", "dada", "arteri", "hipertensi", "kolesterol", "pembuluh darah", "aritmia"]},
    "paru": {"name": "Dokter Paru (Sp.P)", "code": "paru", "keywords": ["paru", "batuk", "asma", "sesak", "bronkitis", "tbc", "pneumonia", "pernapasan"]},
    "saraf": {"name": "Dokter Saraf (Sp.N)", "code": "saraf", "keywords": ["saraf", "kepala", "migrain", "vertigo", "kejang", "lumpuh", "tremor", "parkinson"]},
    "gastro": {"name": "Dokter Penyakit Dalam (Sp.PD)", "code": "penyakit_dalam", "keywords": ["lambung", "perut", "mual", "diare", "maag", "gerd", "usus", "hepatitis", "pencernaan"]},
    "kulit": {"name": "Dokter Kulit (Sp.KK)", "code": "kulit", "keywords": ["kulit", "gatal", "ruam", "jerawat", "eksim", "psoriasis", "alergi kulit", "bintik"]},
    "anak": {"name": "Dokter Anak (Sp.A)", "code": "anak", "keywords": ["anak", "bayi", "balita", "demam anak", "tumbuh kembang", "imunisasi", "vaksin"]},
    "tht": {"name": "Dokter THT (Sp.THT)", "code": "tht", "keywords": ["telinga", "hidung", "tenggorokan", "sinusitis", "tonsil", "amandel", "pendengaran", "tht"]},
    "mata": {"name": "Dokter Mata (Sp.M)", "code": "mata", "keywords": ["mata", "penglihatan", "rabun", "katarak", "glaukoma", "iritasi mata"]},
    "umum": {"name": "Dokter Umum", "code": "umum", "keywords": ["demam", "flu", "pilek", "batuk ringan", "lelah", "pusing biasa"]},
}

DISEASE_MAP = {
    "flu": {"name": "Influenza (Flu)", "specialist": "Dokter Umum", "specialistCode": "umum", "tips": ["Istirahat cukup 7-8 jam per malam", "Perbanyak minum cairan hangat", "Konsumsi makanan bergizi", "Hindari kontak dekat untuk cegah penularan"]},
    "demam": {"name": "Demam (Febris)", "specialist": "Dokter Umum", "specialistCode": "umum", "tips": ["Kompres hangat di dahi dan ketiak", "Perbanyak minum untuk cegah dehidrasi", "Gunakan pakaian tipis", "Pantau suhu tiap 4 jam — jika >39°C segera ke dokter"]},
    "batuk": {"name": "Batuk (Bronkitis)", "specialist": "Spesialis Paru", "specialistCode": "paru", "tips": ["Minum air hangat dengan madu dan lemon", "Hindari paparan asap rokok dan debu", "Istirahat suara", "Hindari makanan berminyak"]},
    "maag": {"name": "Gastritis (Maag)", "specialist": "Dokter Penyakit Dalam", "specialistCode": "penyakit_dalam", "tips": ["Makan teratur setiap 4-5 jam", "Hindari makanan pedas dan asam", "Hindari minuman berkafein", "Konsultasikan dengan dokter untuk antasida yang tepat"]},
    "jantung": {"name": "Penyakit Jantung Koroner", "specialist": "Dokter Jantung", "specialistCode": "jantung", "tips": ["Segera hentikan aktivitas fisik berat", "Hindari makanan berlemak tinggi", "Pantau tekanan darah secara rutin", "Segera konsultasikan ke dokter spesialis jantung"]},
    "kulit": {"name": "Dermatitis (Radang Kulit)", "specialist": "Dokter Kulit", "specialistCode": "kulit", "tips": ["Jaga kebersihan kulit", "Hindari sabun dengan bahan kimia keras", "Gunakan pelembap yang cocok", "Konsultasikan ke dokter untuk krim yang tepat"]},
    "saraf": {"name": "Gangguan Saraf", "specialist": "Dokter Saraf", "specialistCode": "saraf", "tips": ["Istirahat cukup dan kelola stres", "Hindari kafein berlebihan", "Lakukan relaksasi atau meditasi", "Konsultasikan ke dokter spesialis saraf"]},
    "default": {"name": "Keluhan Umum", "specialist": "Dokter Umum", "specialistCode": "umum", "tips": ["Istirahat cukup dan jaga pola makan", "Perbanyak minum air putih", "Pantau perkembangan gejala", "Segera konsultasikan ke dokter jika memburuk"]},
}

def detect_disease_local(text: str) -> dict:
    text_lower = text.lower()
    # Check specialist keywords
    for spec_key, spec_data in SPECIALIST_MAP.items():
        for kw in spec_data["keywords"]:
            if kw in text_lower:
                # Map to disease
                for disease_key, disease_data in DISEASE_MAP.items():
                    if disease_key in text_lower or spec_key == disease_key:
                        return {"disease": disease_data["name"], "specialist": disease_data["specialist"],
                                "specialistCode": disease_data["specialistCode"], "confidence": 70,
                                "tips": disease_data["tips"], "specialistName": spec_data["name"]}
                return {"disease": f"Keluhan {spec_data['name']}", "specialist": spec_data["name"],
                        "specialistCode": spec_data["code"], "confidence": 65,
                        "tips": DISEASE_MAP["default"]["tips"], "specialistName": spec_data["name"]}
    return {"disease": DISEASE_MAP["default"]["name"], "specialist": DISEASE_MAP["default"]["specialist"],
            "specialistCode": DISEASE_MAP["default"]["specialistCode"], "confidence": 60,
            "tips": DISEASE_MAP["default"]["tips"], "specialistName": "Dokter Umum"}

# ── Models ─────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    answer: str
    session_id: str

class ScreeningRequest(BaseModel):
    complaint: str
    severity: str
    duration: str
    additional_symptoms: str = ""
    user_id: Optional[str] = None

class ScreeningResult(BaseModel):
    disease: str
    confidence: float
    specialist: str
    specialistCode: str
    tips: List[str]
    symptoms: str
    isEmergency: bool = False

# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong")

    history = chat_sessions.get(req.session_id, [])

    if USE_GROQ and groq_client:
        try:
            system_prompt = """Kamu adalah asisten medis AI MediCheck yang membantu pasien Indonesia. 
Jawab dalam Bahasa Indonesia dengan hangat dan profesional. 
Berikan informasi kesehatan yang berguna tapi SELALU sarankan konsultasi dokter untuk diagnosis.
Jangan memberikan diagnosis pasti, hanya saran umum dan edukasi kesehatan.
Jika ada gejala darurat (nyeri dada berat, sesak napas, stroke), segera sarankan ke IGD."""

            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-10:]:  # last 10 turns
                messages.append({"role": "user", "content": h["user"]})
                messages.append({"role": "assistant", "content": h["assistant"]})
            messages.append({"role": "user", "content": req.message})

            response = await groq_client.chat.completions.create(
                model=LLM_MODEL, messages=messages, temperature=0.7, max_tokens=800,
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq chat error: {e}")
            answer = _local_chat_response(req.message)
    else:
        answer = _local_chat_response(req.message)

    history.append({"user": req.message, "assistant": answer})
    chat_sessions[req.session_id] = history[-20:]

    return ChatResponse(answer=answer, session_id=req.session_id)


def _local_chat_response(message: str) -> str:
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in EMERGENCY_KEYWORDS):
        return "⚠️ **PERHATIAN DARURAT!** Gejala yang Anda sebutkan bisa berbahaya. Segera hubungi **IGD (119)** atau pergi ke rumah sakit terdekat. Jangan menunda pertolongan medis!"
    detected = detect_disease_local(message)
    return f"""Berdasarkan gejala yang Anda ceritakan, kemungkinan Anda mengalami **{detected['disease']}**.

**Saran awal:**
{chr(10).join(f'• {t}' for t in detected['tips'])}

⚕️ Saya rekomendasikan konsultasi dengan **{detected['specialist']}** untuk diagnosis yang lebih akurat.

⚠️ Informasi ini bukan pengganti diagnosis medis profesional."""


@app.post("/api/screening/analyze", response_model=ScreeningResult)
async def analyze_screening(req: ScreeningRequest):
    full_text = f"{req.complaint} {req.additional_symptoms}".lower()

    # Emergency check
    is_emergency = any(kw in full_text for kw in EMERGENCY_KEYWORDS)
    if is_emergency:
        return ScreeningResult(
            disease="Kondisi Darurat Medis",
            confidence=95,
            specialist="Unit Gawat Darurat (IGD)",
            specialistCode="umum",
            tips=["SEGERA hubungi 119 atau pergi ke IGD terdekat", "Jangan mengemudi sendiri jika kondisi parah", "Minta bantuan orang sekitar", "Tetap tenang dan berbaring jika pusing"],
            symptoms=req.complaint,
            isEmergency=True,
        )

    if USE_GROQ and groq_client:
        try:
            prompt = f"""Analisis gejala pasien dan kembalikan HANYA JSON valid tanpa teks lain.

Keluhan: {req.complaint}
Tingkat keparahan: {req.severity}
Durasi: {req.duration}
Gejala tambahan: {req.additional_symptoms}

Kembalikan JSON PERSIS seperti ini:
{{
  "disease": "nama penyakit lengkap dengan nama latin dalam kurung",
  "confidence": angka_bulat_55_sampai_92,
  "specialist": "nama lengkap spesialis yang sesuai",
  "specialistCode": "satu kata dari: umum/paru/saraf/penyakit_dalam/jantung/kulit/mata/tht/anak/kandungan/ortopedi/psikiatri",
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "symptoms": "ringkasan singkat gejala dalam satu kalimat"
}}"""

            response = await groq_client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": "Kamu adalah asisten medis. Balas HANYA dengan JSON valid, tanpa penjelasan, tanpa markdown."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=600,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"```json\s*|\s*```", "", raw).strip()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                match = re.search(r"\{.*\}", raw, re.DOTALL)
                data = json.loads(match.group()) if match else {}

            return ScreeningResult(
                disease=data.get("disease", "Tidak teridentifikasi"),
                confidence=float(data.get("confidence", 65)),
                specialist=data.get("specialist", "Dokter Umum"),
                specialistCode=data.get("specialistCode", "umum"),
                tips=data.get("tips", ["Konsultasikan dengan dokter untuk diagnosis lebih lanjut."]),
                symptoms=data.get("symptoms", req.complaint),
                isEmergency=False,
            )
        except Exception as e:
            print(f"Groq screening error: {e}")

    # Fallback local
    detected = detect_disease_local(f"{req.complaint} {req.additional_symptoms}")
    return ScreeningResult(
        disease=detected["disease"],
        confidence=detected["confidence"],
        specialist=detected["specialist"],
        specialistCode=detected["specialistCode"],
        tips=detected["tips"],
        symptoms=req.complaint,
        isEmergency=False,
    )


@app.delete("/chat/{session_id}")
async def clear_session(session_id: str):
    chat_sessions.pop(session_id, None)
    return {"status": "ok", "message": f"Sesi {session_id} dihapus"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "groq_connected": USE_GROQ,
        "model": LLM_MODEL if USE_GROQ else "local-fallback",
        "version": "3.0.0",
    }


@app.get("/")
async def root():
    return {
        "service": "MediCheck AI Backend",
        "version": "3.0.0",
        "groq_enabled": USE_GROQ,
        "endpoints": {
            "chat": "POST /chat",
            "screening": "POST /api/screening/analyze",
            "health": "GET /health",
        }
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"\n{'='*50}")
    print(f"🩺 MediCheck AI Backend v3.0.0")
    print(f"   Groq AI: {'✅ Connected' if USE_GROQ else '⚠️ Local fallback'}")
    print(f"   Port: {port}")
    print(f"{'='*50}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
