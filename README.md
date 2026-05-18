# 🩺 MediCheck - Smart Healthcare Web (AI + RAG)

MediCheck adalah aplikasi web berbasis Artificial Intelligence yang membantu pengguna melakukan analisis awal terhadap gejala kesehatan serta menyediakan sistem konsultasi digital antara pasien dan dokter.

Aplikasi ini mengintegrasikan:

* 🤖 AI Chatbot (LLM - Groq)
* 🧠 Retrieval-Augmented Generation (RAG)
* 👥 Multi-user system (Admin, Dokter, Pasien)
* 📅 Sistem janji temu (Appointment)
* 📂 Manajemen rekam medis digital
* 🔐 Authentication & Authorization
* 🏥 Dashboard interaktif untuk setiap role

---

# 🚀 Fitur Utama

## 🤖 AI Medical Chatbot

* Analisis gejala secara interaktif
* Penilaian tingkat keparahan
* Rekomendasi tindakan awal
* Integrasi Large Language Model (LLM)
* Respon real-time berbasis AI

---

## 🧠 RAG System (Retrieval-Augmented Generation)

* Menggunakan sistem Retrieval-Augmented Generation
* Jawaban lebih akurat dan kontekstual
* Mengambil referensi medis sebelum menghasilkan jawaban AI
* Mengurangi halusinasi model AI

---

# 👤 Multi-User Dashboard

## 🧑‍💻 Admin

Fitur Admin:

* Mengelola data pasien
* Mengelola data dokter
* Monitoring sistem
* Mengelola appointment
* Mengelola data aplikasi
* Monitoring aktivitas pengguna
* Dashboard statistik sistem

---

## 🧑‍⚕️ Pasien

Fitur Pasien:

* Login & registrasi akun
* Input gejala melalui chatbot AI
* Melihat hasil analisis AI
* Membuat janji temu dengan dokter
* Melihat riwayat pemeriksaan
* Mengelola profil pribadi
* Melihat hasil konsultasi

---

## 👨‍⚕️ Dokter

Fitur Dokter:

* Login akun dokter
* Melihat daftar pasien
* Menerima / menolak appointment
* Mengelola konsultasi
* Melihat hasil analisis AI pasien
* 📂 Mengakses rekam medis pasien
* Mengelola jadwal konsultasi

---

# 📅 Sistem Appointment

Alur appointment:

1. Pasien memasukkan gejala
2. AI melakukan analisis awal
3. Sistem memberikan rekomendasi
4. Pasien membuat appointment
5. Dokter menerima / menolak permintaan
6. Konsultasi dilakukan

---

# 📂 Rekam Medis Digital

Fitur rekam medis:

* Menyimpan riwayat gejala pasien
* Menyimpan hasil analisis AI
* Menyimpan riwayat konsultasi
* Dapat diakses dokter
* Membantu proses diagnosis

---

# 🏗️ Arsitektur Sistem

Frontend (Next.js)
⬇️
Backend API (Express.js + Prisma)
⬇️
AI Backend (FastAPI + RAG + Groq)
⬇️
Database PostgreSQL

---

# 👨‍💻 Teknologi yang Digunakan

## Frontend

* Next.js
* React.js
* Tailwind CSS
* Axios

---

## Backend

* Node.js
* Express.js
* Prisma ORM
* JWT Authentication
* bcrypt

---

## AI Backend

* FastAPI
* Groq LLM
* FastEmbed
* Retrieval-Augmented Generation (RAG)

---

## Database

* PostgreSQL
* Prisma ORM

---

# 📁 Struktur Folder Project

```bash
medicheck_v3/
│
├── frontend/        # Frontend Next.js
├── backend/         # Backend Express + Prisma
├── backend-ai/      # AI Backend FastAPI + RAG
│
└── README.md
```

---

# ⚙️ Cara Menjalankan Project

# 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd medicheck_v3
```

---

# 🗄️ Setup PostgreSQL

Pastikan PostgreSQL sudah terinstall dan berjalan.

## Buat Database

Masuk terminal:

```bash
psql -U postgres
```

Buat database:

```sql
CREATE DATABASE medicheck;
```

Keluar:

```sql
\q
```

---

# 🔧 Setup Backend (Express + Prisma)

Masuk folder backend:

```bash
cd backend
```

---

## Install Dependencies Backend

```bash
npm install
```

---

# 🔐 Setup Environment Variables Backend

Buat file:

```bash
backend/.env
```

Isi:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_KAMU@localhost:5432/medicheck"

JWT_SECRET="medicheck_secret"

PORT=4000
```

Contoh:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/medicheck"

JWT_SECRET="medicheck_secret"

PORT=4000
```

---

# ⚙️ Generate Prisma Client

```bash
npx prisma generate
```

Jika berhasil:

```bash
✔ Generated Prisma Client
```

---

# 🛠️ Jalankan Migrasi Database

```bash
npx prisma migrate dev
```

Jika berhasil:

```bash
Your database is now in sync with your schema.
```

---

# 🌱 Seed Database

Masukkan data default:

```bash
node src/seed.js
```

Jika berhasil:

```bash
🌱 Seeding database...
🎉 Seeding complete!
```

---

# 👥 Akun Default Database

## 🧑‍💻 Admin

```text
Email    : admin@medicheck.id
Password : admin123
```

---

## 🧑‍⚕️ Pasien

```text
Email    : pasien@medicheck.id
Password : pasien123
```

---

## 👨‍⚕️ Dokter

```text
Email    : rizky.jantung@medicheck.id
Password : dokter123
```

Dokter lainnya:

* [siti.paru@medicheck.id](mailto:siti.paru@medicheck.id)
* [budi.saraf@medicheck.id](mailto:budi.saraf@medicheck.id)
* [lestari.pd@medicheck.id](mailto:lestari.pd@medicheck.id)
* [ahmad.kulit@medicheck.id](mailto:ahmad.kulit@medicheck.id)
* [nuraini.anak@medicheck.id](mailto:nuraini.anak@medicheck.id)
* [hendra.umum@medicheck.id](mailto:hendra.umum@medicheck.id)
* [maya.tht@medicheck.id](mailto:maya.tht@medicheck.id)

Password semua dokter:

```text
dokter123
```

---

# 🔑 Reset Password Default (Opsional)

Jika login gagal:

```bash
node src/reset-passwords.js
```

---

# ▶️ Jalankan Backend

```bash
npm run dev
```

atau:

```bash
node src/index.js
```

Jika berhasil:

```bash
✅ Backend listening on http://localhost:4000
```

Backend berjalan di:

```text
http://localhost:4000
```

---

# 🤖 Setup Backend AI (FastAPI + RAG)

Buka terminal baru:

```bash
cd backend-ai
```

---

## Buat Virtual Environment

```bash
python -m venv rag_env
```

---

## Aktivasi Virtual Environment

### Windows

```bash
rag_env\Scripts\activate
```

### Linux / Mac

```bash
source rag_env/bin/activate
```

---

# 📦 Install Dependency AI Backend

```bash
pip install -r requirements.txt
```

Jika ada module belum tersedia:

```bash
pip install fastapi uvicorn groq python-dotenv fastembed
```

---

# 🔐 Setup Environment Variables AI

Buat file:

```bash
backend-ai/.env
```

Isi:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

# ▶️ Jalankan Backend AI

```bash
python main.py
```

Jika berhasil:

```bash
🚀 Starting in RAG mode
```

AI Backend berjalan di:

```text
http://localhost:8000
```

---

# 💻 Setup Frontend (Next.js)

Buka terminal baru:

```bash
cd frontend
```

---

# 📦 Install Dependency Frontend

```bash
npm install --legacy-peer-deps
```

---

# 🔐 Setup Environment Variables Frontend

Buat file:

```bash
frontend/.env.local
```

Isi:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000

NEXT_PUBLIC_AI_API=http://localhost:8000
```

---

# ▶️ Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di:

```text
http://localhost:3000
```

---

# 🔄 Urutan Menjalankan Project

## Terminal 1 — Backend Express

```bash
cd backend
npm run dev
```

---

## Terminal 2 — Backend AI

```bash
cd backend-ai

rag_env\Scripts\activate

python main.py
```

---

## Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

---

# 🔄 Alur Sistem

1. Pasien memasukkan gejala
2. AI melakukan analisis menggunakan RAG + LLM
3. Hasil analisis ditampilkan
4. Jika diperlukan, pasien membuat appointment
5. Dokter mengkonfirmasi
6. Dokter melihat rekam medis sebelum konsultasi

---

# ⚠️ Troubleshooting

## ❌ Error DATABASE_URL

Pastikan file `.env` backend benar:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medicheck"
```

---

## ❌ Prisma Error

Jalankan:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## ❌ Login 401 Unauthorized

Cek:

* Backend berjalan
* Password benar
* Database sudah di-seed

Reset password:

```bash
node src/reset-passwords.js
```

---

## ❌ Error Next.js

Jika dependency bentrok:

```bash
npm install --legacy-peer-deps
```

---

## ❌ next.config.ts Error

Ubah:

```bash
next.config.ts
```

menjadi:

```bash
next.config.js
```

---

## ❌ Gambar Dokter 404

Tambahkan file gambar ke:

```bash
frontend/public/images
```

contoh:

```bash
dokter-1.jpg
dokter-2.jpg
dokter-3.jpg
dokter-4.jpg
```

---

## ❌ Frontend Tidak Terkoneksi ke Backend

Pastikan:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

dan backend aktif.

---

## ❌ PowerShell Windows

Jangan gunakan:

```bash
rm -rf
```

Gunakan:

```powershell
Remove-Item -Recurse -Force node_modules
```

---

# 📌 Catatan

* Backend utama menggunakan Express.js
* Backend AI menggunakan FastAPI
* Sistem AI menggunakan Groq + RAG
* Database menggunakan PostgreSQL
* Authentication menggunakan JWT
* ORM menggunakan Prisma

---

# 👨‍💻 Developer

MediCheck - Smart Healthcare AI Platform
