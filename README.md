# MediCheck v3.0.0 — Platform Kesehatan Digital AI

## 🏗️ Arsitektur

```
medicheck_v3/
├── frontend/          # Next.js 14 + TypeScript
├── backend/           # Express.js + Prisma + PostgreSQL
├── backend-ai/        # FastAPI + Groq AI
├── start.sh           # Script untuk menjalankan semua service
└── README.md
```

## ⚡ Quick Start

```bash
# 1. Konfigurasi backend
cp backend/.env.example backend/.env
# Edit DATABASE_URL dengan PostgreSQL Anda

# 2. Konfigurasi backend-ai  
cp backend-ai/.env.example backend-ai/.env
# Edit GROQ_API_KEY dengan API key dari https://console.groq.com

# 3. Konfigurasi frontend
cp frontend/.env.example frontend/.env.local

# 4. Jalankan semua service
./start.sh
```

## 🔐 Akun Default (setelah seed)

| Role   | Email                        | Password    |
|--------|------------------------------|-------------|
| Admin  | admin@medicheck.id           | admin123    |
| Dokter | rizky.jantung@medicheck.id   | dokter123   |
| Pasien | pasien@medicheck.id          | pasien123   |

## 🧑‍⚕️ Fitur Sistem Role Dokter

- ✅ Registrasi & login akun individu per dokter
- ✅ Dashboard dinamis per dokter (bukan shared)
- ✅ Data pasien terpisah — dokter A tidak bisa lihat pasien dokter B
- ✅ Jadwal praktik per dokter (bisa diedit langsung)
- ✅ Rekam medis hanya untuk pasien dokter sendiri
- ✅ Statistik dashboard berdasarkan data akun dokter yang login
- ✅ Profil dokter lengkap (foto, STR, spesialis, biaya, dll)

## 🤖 Fitur AI

- ✅ Screening penyakit via AI (Groq llama3-8b-8192)
- ✅ Fallback lokal jika Groq tidak tersedia
- ✅ Rekomendasi dokter spesialis sesuai indikasi
- ✅ Chatbot medis interaktif
- ✅ Penyimpanan hasil screening ke database
- ✅ Riwayat screening per pasien

## 📡 API Endpoints

### Backend (Port 4000)
- `POST /api/auth/register` — Daftar pasien
- `POST /api/auth/register-doctor` — Daftar dokter
- `POST /api/auth/login` — Login
- `GET  /api/auth/me` — Profil user (authenticated)
- `GET  /api/doctors` — Daftar dokter (+ filter spesialis)
- `GET  /api/doctors/me/appointments` — Janji temu dokter yang login
- `GET  /api/doctors/me/patients` — Pasien dokter yang login
- `PUT  /api/doctors/me/schedule` — Update jadwal
- `GET  /api/bookings` — Booking user yang login
- `POST /api/bookings` — Buat booking
- `PATCH /api/bookings/:id/status` — Update status (dokter)
- `GET  /api/medical-records` — Rekam medis (sesuai role)
- `POST /api/medical-records` — Buat rekam medis (dokter)
- `GET  /api/stats/doctor` — Statistik dokter yang login
- `GET  /api/notifications` — Notifikasi user yang login
- `GET  /api/screenings/my` — Riwayat screening pasien

### Backend AI (Port 8000)
- `POST /api/screening/analyze` — Analisis gejala dengan Groq AI
- `POST /chat` — Chatbot medis
- `GET  /health` — Status AI service

## 🔧 Environment Variables

### backend/.env
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/medicheck"
JWT_SECRET="your-secret-key"
PORT=4000
```

### backend-ai/.env
```env
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama3-8b-8192
PORT=8000
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AI_URL=http://localhost:8000
```
