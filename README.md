# 🩺 MediCheck - Smart Healthcare Web (AI + RAG)

MediCheck adalah aplikasi web berbasis Artificial Intelligence yang membantu pengguna melakukan analisis awal terhadap gejala kesehatan serta menyediakan sistem konsultasi digital antara pasien dan dokter.

Aplikasi ini mengintegrasikan:

* 🤖 AI Chatbot (LLM - Groq)
* 🧠 Retrieval-Augmented Generation (RAG)
* 👥 Multi-user system (Admin, Dokter, Pasien)
* 📅 Sistem janji temu (appointment)
* 📂 Manajemen rekam medis

---

## 🚀 Fitur Utama

### 🤖 AI Medical Chatbot

* Analisis gejala secara interaktif
* Penilaian tingkat keparahan
* Rekomendasi tindakan awal

### 🧠 RAG System

* Menggunakan Retrieval-Augmented Generation
* Menghasilkan jawaban lebih akurat dan kontekstual

---

## 👤 Multi-User Dashboard

### 🧑‍💻 Admin

* Mengelola data pengguna (pasien & dokter)
* Monitoring sistem
* Manajemen data aplikasi

### 🧑‍⚕️ Pasien

* Input gejala melalui chatbot AI
* Melihat hasil analisis
* Membuat janji temu dengan dokter
* Melihat riwayat pemeriksaan

### 👨‍⚕️ Dokter

* Melihat daftar pasien
* Menerima / menolak janji temu
* Mengelola konsultasi
* 📂 Melihat rekam medis pasien (riwayat gejala & hasil AI)

---

## 📅 Sistem Janji Temu (Appointment)

1. Pasien memasukkan gejala ke sistem
2. AI melakukan analisis
3. Jika diperlukan, pasien diarahkan untuk konsultasi
4. Pasien membuat janji temu
5. Dokter mengkonfirmasi permintaan
6. Konsultasi dilakukan

---

## 📂 Rekam Medis

* Menyimpan riwayat gejala pasien
* Menyimpan hasil analisis AI
* Dapat diakses oleh dokter untuk membantu diagnosis

---

## 🏗️ Arsitektur Sistem

Frontend (Next.js)
⬇️
Backend API (FastAPI)
⬇️
RAG Engine + LLM (Groq)
⬇️
Database (TiDB / Lokal)

---

## ⚙️ Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <repository-url>
cd PPL_Medicheck
```

---

## 🔧 Setup Backend AI

```bash
cd backend-ai
python -m venv rag_env
```

Aktifkan virtual environment:

**Windows:**

```bash
rag_env\Scripts\activate
```

**Mac/Linux:**

```bash
source rag_env/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

Jika belum tersedia:

```bash
pip install fastapi uvicorn groq python-dotenv fastembed
```

---

### Setup Environment Variables

Buat file `.env` di folder `backend-ai`:

### Jalankan Backend

```bash
python main.py
```

Backend berjalan di:

```
http://localhost:8000
```

---

## 💻 Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend berjalan di:

```
http://localhost:3000
```

---

## 🔄 Alur Sistem

1. Pasien memasukkan gejala
2. Sistem AI menganalisis menggunakan RAG + LLM
3. Hasil analisis ditampilkan ke pengguna
4. Jika diperlukan, pasien membuat janji temu
5. Dokter mengkonfirmasi
6. Dokter dapat melihat rekam medis sebelum konsultasi

---

## ⚠️ Troubleshooting

### ❌ Module tidak ditemukan

```bash
pip install fastembed
```

---

### ❌ API Key error

Pastikan file `.env` sudah benar dan terbaca

---

### ❌ Frontend tidak terhubung ke backend

Tambahkan di frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### ❌ Error Next.js

```bash
npm install --legacy-peer-deps
```

---

## 👨‍💻 Teknologi yang Digunakan

* FastAPI
* Next.js
* Groq LLM
* RAG (Retrieval-Augmented Generation)
* FastEmbed
* TiDB (opsional)

---

