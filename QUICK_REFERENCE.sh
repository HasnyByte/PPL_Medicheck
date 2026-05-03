#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════════════════════
# QUICK REFERENCE - Memory Optimization Commands
# ═════════════════════════════════════════════════════════════════════════════

# 🚀 INSTALL & RUN (One-liner)
# ─────────────────────────────────────────────────────────────────────────────
# cd /home/azani/Kuliah/semester_6/PPL/mk/PPL_Medicheck && bash setup-optimization.sh


# 🎯 NORMAL OPERATION (After setup)
# ─────────────────────────────────────────────────────────────────────────────

# Terminal 1 - Run application
./start-optimized-memory.sh

# Terminal 2 - Monitor memory (while app running)
python monitor_memory.py

# Terminal 3 - Test API
curl http://localhost:8000/docs

# Access frontend
# Browser: http://localhost:3000


# 📊 MONITORING & DEBUGGING
# ─────────────────────────────────────────────────────────────────────────────

# Real-time system memory
free -h

# Detailed process memory
ps aux | grep -E "python|node|next"

# Watch continuously
watch -n 1 'free -h && echo "---" && ps aux | grep -E "python|node|next"'

# Python memory (if attached to session)
python3 << 'EOF'
import psutil
ps = psutil.Process()
print(f"Python Memory: {ps.memory_info().rss / 1024 / 1024:.1f} MB")
EOF


# 🔧 COMMON ADJUSTMENTS
# ─────────────────────────────────────────────────────────────────────────────

# If still OOM: Reduce TOP_K
# Edit: backend-ai/rag_engine.py
sed -i 's/TOP_K.*=.*/TOP_K = 3/' backend-ai/rag_engine.py

# If still OOM: Reduce MAX_HISTORY_TURNS
sed -i 's/MAX_HISTORY_TURNS.*=.*/MAX_HISTORY_TURNS = 4/' backend-ai/rag_engine.py

# If Next.js slow: Reduce Node heap
export NODE_OPTIONS="--max-old-space-size=384"

# Production build (much lighter than dev)
npm run build
npm start


# 🔄 REVERT CHANGES (if needed)
# ─────────────────────────────────────────────────────────────────────────────

# Restore original rag_engine
cp backend-ai/rag_engine_backup_*.py backend-ai/rag_engine.py

# Restore original next.config.ts (if backed up)
git checkout next.config.ts 2>/dev/null || echo "Not in git"


# 📈 PERFORMANCE TESTING
# ─────────────────────────────────────────────────────────────────────────────

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test",
    "message": "apa gejala flu?"
  }'

# Test screening endpoint
curl -X POST http://localhost:8000/screening \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "pilek dan demam",
    "severity": "Ringan (1-3)",
    "duration": "1-3 hari",
    "additional_symptoms": ""
  }'


# 📋 FILE REFERENCE
# ─────────────────────────────────────────────────────────────────────────────

# Documentation
# MEMORY_OPTIMIZATION.md        - Detailed explanation
# IMPLEMENTATION_CHECKLIST.md   - Step-by-step instructions
# COMPARISON.md                 - Before/after analysis

# Executable Scripts
# setup-optimization.sh         - Auto setup (run this first!)
# start-optimized-memory.sh     - Run app with memory optimization
# monitor_memory.py             - Live memory monitoring

# Config Files
# next.config.ts                - Next.js optimized config
# backend-ai/rag_engine.py      - Optimized RAG engine
# .env.example.memory           - Example environment variables


# ✅ VERIFICATION CHECKLIST
# ─────────────────────────────────────────────────────────────────────────────

# Before running:
# [ ] Run setup-optimization.sh
# [ ] Check backend-ai/rag_engine.py is optimized version
# [ ] Check next.config.ts has memory optimizations
# [ ] Have 2 terminals ready (app + monitor)

# During running:
# [ ] Monitor shows Python memory ~300-500MB
# [ ] Monitor shows Node.js memory ~300-500MB
# [ ] Chat requests complete in <2s
# [ ] No "OutOfMemory" errors

# After running:
# [ ] Total memory < 1GB on idle
# [ ] Memory peaks < 1.2GB during query
# [ ] No memory growth over time


# 🆘 TROUBLESHOOTING QUICK LINKS
# ─────────────────────────────────────────────────────────────────────────────

# Problem: Still OOM
# Solution: Check TROUBLESHOOTING section in IMPLEMENTATION_CHECKLIST.md

# Problem: Slow queries
# Solution: Check next.config.ts and consider npm run build

# Problem: Model not loading
# Solution: Check dependencies in backend-ai/requirements.txt

# Problem: API not responding
# Solution: Check if both services started in start-optimized-memory.sh

# For detailed help: See MEMORY_OPTIMIZATION.md
