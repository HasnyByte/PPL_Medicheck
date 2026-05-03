# 🚀 MEDICHECK QUICK START GUIDE

## ⚡ Ultra-Quick (3 Steps)

### Step 1: Check Your Memory

```bash
python check-memory.py
```

### Step 2: Choose and Run

```bash
# LIGHTWEIGHT (for 512MB-1GB RAM) - RECOMMENDED for low-memory devices
bash start-lightweight.sh

# OR OPTIMIZED (for 2GB+ RAM)
bash start-optimized-memory.sh

# OR FULL (for 4GB+ RAM)
bash start.sh  # Then choose option 3
```

### Step 3: Access in Browser

```
http://localhost:3000
```

---

## 📊 Mode Comparison

| Feature               | Lightweight | Optimized | Full   |
| --------------------- | ----------- | --------- | ------ |
| **Memory**            | ~300MB      | ~800MB    | ~1.7GB |
| **Startup**           | 5s          | 8s        | 15s    |
| **Disease Detection** | ✅ Yes      | ✅ Yes    | ✅ Yes |
| **Chat/RAG**          | ❌ No       | ✅ Yes    | ✅ Yes |
| **Embeddings**        | ❌ No       | ✅ Yes    | ✅ Yes |
| **Min RAM**           | 512MB       | 2GB       | 4GB    |

---

## 🎯 Recommended Setup by Device

### For 512MB - 1GB RAM

```bash
bash start-lightweight.sh
```

✅ **Best for:** Old laptops, embedded systems, VPS with low RAM

### For 1GB - 2GB RAM

```bash
bash start-lightweight.sh  # or OPTIMIZED if you need RAG
```

### For 2GB+ RAM

```bash
bash start-optimized-memory.sh
```

✅ **Best for:** Most laptops, modern VPS, development

### For 4GB+ RAM

```bash
bash start.sh  # Choose mode 3 for FULL
```

✅ **Best for:** Desktop, high-spec development

---

## 🔍 What Each Mode Does

### LIGHTWEIGHT MODE

- **API Only:** No embedding models, no RAG
- **Keyword Matching:** Pure Python disease detection
- **Size:** ~20MB backend + ~240MB frontend = 260MB
- **Perfect for:** Memory-constrained devices

### OPTIMIZED MODE

- **Lazy Loading:** Models only load on first request
- **Lighter Model:** MiniLM instead of Base
- **Aggressive GC:** Memory cleanup after each query
- **Size:** ~400MB backend + ~400MB frontend = 800MB

### FULL MODE

- **All Features:** Full RAG pipeline enabled
- **Better Accuracy:** Full SentenceTransformer models
- **Slower:** ~15s startup, 1-2s per query
- **Size:** ~1GB backend + ~700MB frontend = 1.7GB+

---

## 🚨 Troubleshooting

### Problem: Still getting OOM

**Solution:** Use LIGHTWEIGHT mode and close other apps

```bash
killall -9 chrome firefox spotify  # Close heavy apps
bash start-lightweight.sh
```

### Problem: "next: command not found"

**Solution:** Make sure you're in the root directory, not backend-ai

```bash
cd /path/to/PPL_Medicheck
bash start-lightweight.sh
```

### Problem: Port 3000/8000 already in use

**Solution:** Kill previous instances

```bash
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Problem: Backend won't start

**Solution:** Check if virtual environment exists

```bash
cd backend-ai
python -m venv rag_env  # Create if missing
source rag_env/bin/activate
pip install -r requirements.txt
```

---

## 📈 Upgrade Path

As your device improves or you need more features:

```
LIGHTWEIGHT (1st time)
    ↓ (if more memory available)
OPTIMIZED (add RAG features)
    ↓ (if much more memory)
FULL (all features)
```

---

## 🔧 Advanced Configuration

### Reduce memory even more (LIGHTWEIGHT)

```bash
# Edit start-lightweight.sh
export NODE_OPTIONS="--max-old-space-size=192"  # 192MB instead of 256MB
```

### Use production build (saves ~100MB)

```bash
npm run build
NODE_ENV=production npm start
```

### Monitor memory in real-time

```bash
# In another terminal
watch -n 1 'free -h | grep -E "Mem|total"'
```

---

## ✅ Verification

After starting, verify everything works:

```bash
# Check health endpoint
curl http://localhost:8000/health

# Test disease detection
curl -X POST http://localhost:8000/api/screening/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "batuk dan demam",
    "severity": "Sedang (4–6)",
    "duration": "4–7 hari",
    "additional_symptoms": ""
  }'

# Access frontend
open http://localhost:3000
```

---

## 📚 Complete File Reference

| File                             | Purpose                        |
| -------------------------------- | ------------------------------ |
| `start-lightweight.sh`           | Ultra-light mode (~300MB)      |
| `start-optimized-memory.sh`      | Optimized mode (~800MB)        |
| `start.sh`                       | Interactive mode selector      |
| `check-memory.py`                | Check if system has enough RAM |
| `backend-ai/main_lightweight.py` | Lightweight API (no ML)        |
| `backend-ai/main.py`             | Full API (with RAG)            |

---

## 🎓 Learning More

- **API Details:** See `API_INTEGRATION.md`
- **Memory Optimization:** See `MEMORY_OPTIMIZATION.md`
- **Full Setup:** See `IMPLEMENTATION_CHECKLIST.md`

---

## 🎉 You're Ready!

```bash
# One command to get started:
bash start-lightweight.sh

# Then open:
# http://localhost:3000
```

Enjoy MediCheck! 🏥✨
