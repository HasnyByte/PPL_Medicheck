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

Berikut step-by-step lengkap cara menjalankan backend Medicheck kamu dari awal sampai berhasil jalan 🚀

STEP 1 — Buka folder backend

Masuk ke terminal VS Code atau PowerShell:

cd C:\Users\USER DK\Downloads\medicheck_v3_final\medicheck_v3\backend
STEP 2 — Pastikan PostgreSQL hidup

Sebelum backend dijalankan, database PostgreSQL harus aktif.

Cara cek:

Tekan Windows
Cari:
Services
Cari:
postgresql
Pastikan status:
Running

Kalau belum:

klik kanan
Start
STEP 3 — Pastikan file .env benar

Buka file:

backend/.env

Isi contoh:

DATABASE_URL="postgresql://postgres:123456@localhost:5432/medicheck"

JWT_SECRET="medicheck_secret"

PORT=4000

Ganti:

123456 → password PostgreSQL kamu
STEP 4 — Install dependency backend

Jalankan:

npm install

Tunggu sampai selesai.

STEP 5 — Generate Prisma Client

Jalankan:

npx prisma generate

Kalau berhasil muncul:

✔ Generated Prisma Client
STEP 6 — Jalankan migrate database

Jalankan:

npx prisma migrate dev

Kalau berhasil muncul:

Your database is now in sync with your schema.
STEP 7 — Jalankan backend

Jalankan:

npm run dev

Kalau berhasil:

✅ Backend listening on http://localhost:4000
STEP 8 — Test backend

Buka browser:

http://localhost:4000

atau endpoint lain seperti:

http://localhost:4000/api/doctors

Kalau muncul JSON/data berarti backend sukses.

STEP 9 — Jalankan frontend

Buka terminal baru:

cd C:\Users\USER DK\Downloads\medicheck_v3_final\medicheck_v3\frontend

Lalu:

npm install
npm run dev

Frontend biasanya jalan di:

http://localhost:3000
Urutan setiap kali mau menjalankan project

Kalau project sudah pernah setup, cukup:

Terminal 1 (backend)
cd backend
npm run dev
Terminal 2 (frontend)
cd frontend
npm run dev
Kalau muncul error lagi

Biasanya:

PostgreSQL mati
.env salah
port bentrok
dependency belum install

Dan untuk PowerShell Windows:
❌ jangan pakai:

rm -rf

✅ pakai:

Remove-Item -Recurse -Force node_modules

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

