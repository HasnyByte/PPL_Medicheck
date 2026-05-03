# Frontend-Backend API Integration Guide

## Overview

The MediCheck application uses a **FastAPI backend** (Python) that communicates with a **Next.js frontend** (TypeScript/React) for symptom screening analysis.

## Architecture

```
Frontend (Next.js) ──HTTP POST──> Backend (FastAPI) ──Response──> Frontend
ChatSection.tsx                    main.py
                                   ├── rag_engine.py (disease detection)
                                   └── chat_memory.py (session management)
```

## API Endpoints

### 1. **POST** `/api/screening/analyze`

Analyzes symptoms and returns disease screening result.

**Request Body:**

```json
{
  "complaint": "batuk dan demam",
  "severity": "Sedang (4–6)",
  "duration": "4–7 hari",
  "additional_symptoms": "sakit kepala"
}
```

**Response (Success 200):**

```json
{
  "disease": "Batuk (Bronkitis)",
  "confidence": 75.5,
  "specialist": "Spesialis Paru",
  "specialistCode": "paru",
  "tips": [
    "Minum air hangat dengan madu dan lemon",
    "Hindari paparan asap rokok dan debu",
    "Istirahat suara — kurangi berbicara keras",
    "Hindari makanan berminyak dan terlalu dingin"
  ],
  "symptoms": "batuk dan demam"
}
```

**Response (Emergency 400):**

```json
{
  "detail": "Kondisi darurat terdeteksi — Segera hubungi layanan gawat darurat"
}
```

### 2. **GET** `/health`

Health check endpoint to verify the server is running.

**Response:**

```json
{
  "status": "healthy"
}
```

### 3. **POST** `/chat`

Main RAG chatbot endpoint (for future use).

### 4. **GET** `/history/{session_id}`

Retrieve conversation history for a session.

## Setup Instructions

### Backend Setup

1. **Install dependencies:**

   ```bash
   cd backend-ai
   source rag_env/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create `.env` in `backend-ai/`:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   TIDB_HOST=your_tidb_host
   TIDB_USER=root
   TIDB_PASSWORD=your_password
   TIDB_DATABASE=medical_db
   ```

3. **Start the server:**
   ```bash
   python main.py
   # Server runs on http://localhost:8000
   ```

### Frontend Setup

1. **Configure API endpoint:**
   Create `.env.local` in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

## How It Works

### 1. **User submits symptoms**

- User types complaint in ChatSection.tsx
- Emergency keywords are checked locally first

### 2. **Frontend sends request**

- `analyzeWithBackend()` function in ChatSection.tsx
- Sends POST to `/api/screening/analyze`
- Includes: complaint, severity, duration, additional symptoms

### 3. **Backend analyzes**

- `analyze_symptoms()` endpoint in main.py
- Imports disease detection functions from rag_engine.py
- `detectDisease()` - matches keywords
- `calcConfidence()` - calculates confidence score
- Returns ScreeningResult

### 4. **Frontend receives response**

- Displays disease name and confidence
- Shows specialist recommendation
- Displays health tips
- Routes to ResultSection component

## File Structure

```
PPL_Medicheck/
├── backend-ai/
│   ├── main.py                 # FastAPI app & endpoints
│   ├── rag_engine.py          # Disease detection & RAG
│   ├── chat_memory.py         # Session memory store
│   ├── requirements.txt
│   └── rag_env/               # Python virtual environment
├── components/
│   └── ChatSection.tsx        # Chat UI & API calls
├── .env.local                 # Frontend env vars
└── package.json
```

## Disease Detection Logic

### Available Diseases

- **Flu** (Influenza)
- **Demam** (Fever)
- **Batuk** (Cough/Bronkitis)
- **Maag** (Gastritis)
- **Kepala** (Headache)

### Confidence Calculation

```
Base: 62 + (keyword_matches × 8) or 55
+ 6 if severity is "Berat" or "Sangat Berat"
+ 4 if duration is "4–7 hari" or longer
= Final confidence (min 58, max 94)
```

## Testing

### Test the API with cURL:

```bash
# Health check
curl http://localhost:8000/health

# Screening analysis
curl -X POST http://localhost:8000/api/screening/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "batuk dan demam",
    "severity": "Sedang (4–6)",
    "duration": "4–7 hari",
    "additional_symptoms": "sakit kepala"
  }'

# Emergency detection
curl -X POST http://localhost:8000/api/screening/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "nyeri dada dan sesak napas berat",
    "severity": "Sangat Berat (10)",
    "duration": "Baru hari ini",
    "additional_symptoms": ""
  }'
```

## CORS Configuration

The backend allows requests from any origin (development configuration):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **Note:** Change `allow_origins` to specific domain in production!

## Error Handling

### Frontend Error Handling

```typescript
try {
  const result = await analyzeWithBackend(
    complaint,
    severity,
    duration,
    additional,
  );
  // Handle success
} catch (error) {
  if (error.message === "EMERGENCY_DETECTED") {
    // Show emergency banner
  } else {
    // Show error message
  }
}
```

### Backend Error Handling

- Emergency keywords detected → 400 status
- Invalid request → 400 status
- Server error → 500 status

## Environment Variables

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL` - Backend API base URL

### Backend (.env)

- `GROQ_API_KEY` - Groq LLM API key
- `TIDB_HOST` - TiDB database host
- `TIDB_PORT` - TiDB database port (default: 4000)
- `TIDB_USER` - TiDB username
- `TIDB_PASSWORD` - TiDB password
- `TIDB_DATABASE` - Database name
- `TIDB_SSL_CA` - SSL certificate path (optional)

## Development Workflow

1. Start backend: `cd backend-ai && python main.py`
2. Start frontend: `npm run dev`
3. Frontend auto-reloads on changes
4. Backend auto-reloads if `reload=True` (default)
5. Access app at http://localhost:3000

## Production Deployment

### Backend

- Change `reload=False` in main.py
- Use production ASGI server (Gunicorn + Uvicorn):
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
  ```

### Frontend

- Build: `npm run build`
- Deploy to Vercel, Netlify, or your hosting

### CORS

- Update `allow_origins` to specific domain
- Example: `allow_origins=["https://yourdomain.com"]`

## Troubleshooting

### Backend won't start

- Check Python 3.11+ is installed
- Verify virtual environment is activated
- Check `.env` variables are set
- Ensure port 8000 is available

### API calls fail

- Verify backend is running: `curl http://localhost:8000/health`
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for CORS errors
- Verify network tab in browser DevTools

### Disease not detected correctly

- Check keywords in `DISEASE_MAP` in rag_engine.py
- Verify complaint text matches keywords
- Adjust `SIMILARITY_THRESHOLD` if needed

## Future Enhancements

- [ ] Add vector database integration with TiDB
- [ ] Implement RAG-based Q&A chatbot
- [ ] Add user authentication
- [ ] Store screening results in database
- [ ] Add analytics dashboard
- [ ] Implement multi-language support
