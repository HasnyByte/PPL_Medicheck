# 🏥 MediCheck v3 — Panduan Setup Lengkap

## Prasyarat
- Node.js v18+ 
- Python 3.10+
- PostgreSQL 14+ (atau TiDB Cloud)
- npm / yarn

---

## ⚡ Setup Cepat (3 Langkah)

### Langkah 1 — Konfigurasi Environment

```bash
# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medicheck_db"
JWT_SECRET="ganti-dengan-secret-yang-kuat"
PORT=4000
```

```bash
# Backend AI
cp backend-ai/.env.example backend-ai/.env
```

Edit `backend-ai/.env`:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxx   ← dari https://console.groq.com
GROQ_MODEL=llama3-8b-8192
PORT=8000
```

```bash
# Frontend
cp frontend/.env.example frontend/.env.local
```

### Langkah 2 — Install & Setup Database

```bash
# Backend dependencies
cd backend
npm install
npx prisma db push          # buat tabel di database
node src/seed.js            # isi data awal (admin, dokter, pasien)
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

# Backend AI dependencies
cd backend-ai
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Langkah 3 — Jalankan

```bash
./start.sh
# Atau jalankan manual (3 terminal):
# Terminal 1: cd backend && npm start
# Terminal 2: cd backend-ai && ./venv/bin/python main.py
# Terminal 3: cd frontend && npm run dev
```

---

## 🔑 Akun Default (setelah seed)

| Role   | Email                          | Password   |
|--------|--------------------------------|------------|
| Admin  | admin@medicheck.id             | admin123   |
| Dokter | rizky.jantung@medicheck.id     | dokter123  |
| Dokter | siti.paru@medicheck.id         | dokter123  |
| Dokter | budi.saraf@medicheck.id        | dokter123  |
| Dokter | lestari.pd@medicheck.id        | dokter123  |
| Dokter | ahmad.kulit@medicheck.id       | dokter123  |
| Dokter | nuraini.anak@medicheck.id      | dokter123  |
| Dokter | hendra.umum@medicheck.id       | dokter123  |
| Dokter | maya.tht@medicheck.id          | dokter123  |
| Pasien | pasien@medicheck.id            | pasien123  |

---

## 🔧 Troubleshooting Login

### "Email atau password salah" untuk admin/dokter
```bash
# Reset semua password ke default
cd backend
node src/reset-passwords.js
```

### Database tidak konek
```bash
cd backend
npx prisma db push    # ulang push schema
node src/seed.js      # ulang seed
```

### Backend AI tidak bisa diakses
- Cek `GROQ_API_KEY` di `backend-ai/.env`
- Tanpa Groq key, AI tetap bisa jalan dengan mode fallback lokal
- Cek port 8000 tidak dipakai: `lsof -i :8000`

### Port sudah terpakai
```bash
# Cek port
lsof -i :3000   # frontend
lsof -i :4000   # backend  
lsof -i :8000   # backend-ai
```

---

## 🐳 Docker (Opsional)

```bash
# Buat file .env di root dengan GROQ_API_KEY
echo "GROQ_API_KEY=gsk_xxx" > .env

# Jalankan semua dengan Docker
docker-compose up --build

# Seed database (sekali saja)
docker-compose exec backend node src/seed.js
```

---

## 📁 Struktur Project

```
medicheck_v3/
├── frontend/              # Next.js 14 + TypeScript
│   ├── app/              # Pages & layout
│   ├── components/       # React components
│   └── lib/api.ts        # API client terpusat
├── backend/               # Express.js + Prisma
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth middleware
│   │   ├── prisma.js     # Database client
│   │   ├── seed.js       # Data awal
│   │   └── reset-passwords.js
│   └── prisma/
│       └── schema.prisma # Database schema
├── backend-ai/            # FastAPI + Groq AI
│   └── main.py           # AI screening & chatbot
├── docker-compose.yml
├── start.sh
└── SETUP.md
```
