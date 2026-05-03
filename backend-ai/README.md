# 🩺 MediChat — RAG Chatbot Penyakit

Chatbot berbasis **Retrieval-Augmented Generation (RAG)** menggunakan FastAPI + TiDB Vector + OpenAI.

## Stack yang Digunakan

| Komponen | Pilihan | Alasan |
|---|---|---|
| **Embedding** | `text-embedding-3-small` (OpenAI) | Murah ($0.02/1M token), akurat untuk Bahasa Indonesia |
| **LLM** | `gpt-4o-mini` (OpenAI) | Cepat, hemat biaya, context window 128k token |
| **Vector DB** | TiDB (sudah ada) | Native VECTOR support, SQL familiar |
| **Backend** | FastAPI + Python | Async, performan, mudah dikembangkan |

## Struktur File

```
rag-chatbot/
├── main.py          # FastAPI app & routes
├── rag_engine.py    # Core RAG pipeline (embed → retrieve → generate)
├── chat_memory.py   # Manajemen history percakapan
├── ingest.py        # Script memasukkan dokumen ke TiDB
├── static/
│   └── index.html   # Frontend chatbot
├── .env.example     # Template konfigurasi
└── requirements.txt
```

## Setup & Instalasi

```bash
# 1. Clone / salin folder ini
cd rag-chatbot

# 2. Install dependencies
pip install -r requirements.txt

# 3. Salin dan isi konfigurasi
cp .env.example .env
# Edit .env dengan API key dan koneksi TiDB kamu

# 4. (Opsional) Ingest dokumen penyakit ke TiDB
python ingest.py --file data/penyakit.json
# Atau tanpa argumen untuk contoh data:
python ingest.py

# 5. Jalankan server
python main.py
# Buka: http://localhost:8000
```

## Schema TiDB yang Dibutuhkan

```sql
CREATE TABLE IF NOT EXISTS disease_documents (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    doc_id      VARCHAR(100) UNIQUE NOT NULL,
    title       VARCHAR(500)        NOT NULL,
    content     TEXT                NOT NULL,
    category    VARCHAR(100)        DEFAULT 'umum',
    embedding   VECTOR(1536),                     -- Harus 1536 untuk text-embedding-3-small
    metadata    JSON,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);
```

---

## 🔑 Hal Penting agar Respons Bagus & Mengingat Konteks

### 1. Kualitas Embedding
- **Embed title + content** bersama, bukan hanya content saja
- Bersihkan teks: hilangkan karakter spesial, newline berlebihan
- Untuk query pendek ("gejalanya?"), enrichment otomatis sudah ada di `_enrich_query()`

### 2. Retrieval yang Tepat
- **TOP_K = 5** — jangan terlalu banyak (noise) atau terlalu sedikit (kurang konteks)
- **SIMILARITY_THRESHOLD = 0.70** — sesuaikan: lebih tinggi = lebih ketat, lebih rendah = lebih banyak hasil
- Gunakan `VEC_COSINE_DISTANCE` bukan dot product untuk teks

### 3. Mengingat Konteks Percakapan
- History dikirim sebagai **messages array** ke LLM (bukan dirangkum di system prompt)
- **MAX_HISTORY_TURNS = 6** — batasi agar tidak overflow context window
- **Sliding window**: pesan lama otomatis dibuang, yang terbaru selalu disertakan
- Session ID unik per pengguna/tab — pisahkan percakapan antar user

### 4. Kualitas Prompt (System Prompt)
- Instruksikan LLM untuk selalu **rujuk ke konteks dokumen**
- Minta LLM untuk **memperhatikan penyakit yang dibahas sebelumnya** dalam history
- Set `temperature = 0.3` untuk jawaban yang konsisten dan faktual
- Ingatkan untuk **tidak mengarang** informasi di luar dokumen

### 5. Ingest Dokumen yang Baik
- Pecah dokumen panjang menjadi **chunk 500-800 kata** dengan overlap ~100 kata
- Pastikan setiap chunk punya konteks yang cukup (jangan potong di tengah kalimat)
- Embed ulang jika ada pembaruan dokumen (gunakan ON DUPLICATE KEY UPDATE)

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/chat` | Kirim pesan, terima jawaban + sumber |
| `POST` | `/clear` | Reset history percakapan |
| `GET`  | `/history/{session_id}` | Lihat history sesi |
| `GET`  | `/health` | Cek status server |

### Contoh Request `/chat`
```json
{
  "session_id": "user_abc123",
  "message": "Apa itu diabetes?"
}
```

### Contoh Response
```json
{
  "answer": "Diabetes mellitus adalah kondisi kronis...",
  "sources": [
    {"doc_id": "diabetes-001", "title": "Diabetes Mellitus Tipe 2", "score": 0.92}
  ],
  "session_id": "user_abc123"
}
```

---

## Upgrade Path (Production)

1. **Memory**: Ganti `InMemoryStore` → `RedisMemory` (kode sudah ada di `chat_memory.py`)
2. **Chunking**: Tambah `langchain.text_splitter.RecursiveCharacterTextSplitter` untuk dokumen panjang
3. **Reranking**: Tambah `cross-encoder/ms-marco-MiniLM-L-6-v2` untuk re-rank hasil retrieval
4. **Observability**: Integrasi LangSmith atau Langfuse untuk monitor query & response quality
