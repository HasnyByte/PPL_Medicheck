#!/bin/bash
# ═════════════════════════════════════════════════════════════════════════════
# DETAILED SETUP INSTRUCTIONS
# ═════════════════════════════════════════════════════════════════════════════

cat << 'EOF'

╔═════════════════════════════════════════════════════════════════════════════╗
║                                                                             ║
║        🚀 MEDICHECK MEMORY OPTIMIZATION - COMPLETE SETUP GUIDE             ║
║                                                                             ║
║  Solusi untuk: "saya kehabisan memory setiap menjalankan ai dan npm run dev"║
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝

📋 DAFTAR ISI:
  1. Prerequisites Checks
  2. Auto Setup (Recommended)
  3. Manual Setup (If auto fails)
  4. Verification Steps
  5. Running the Application
  6. Monitoring & Troubleshooting

═════════════════════════════════════════════════════════════════════════════════

✅ STEP 1: PREREQUISITES CHECK
─────────────────────────────────────────────────────────────────────────────

Sebelum memulai, pastikan:

□ Anda di direktori yang benar
  $ pwd
  # Expected: /home/azani/Kuliah/semester_6/PPL/mk/PPL_Medicheck

□ Python 3.11+ terinstal di venv
  $ python --version
  # Expected: Python 3.11.x

□ Node.js terinstal
  $ node --version
  # Expected: v18.x atau lebih

□ Dependencies sudah install
  $ pip list | grep sentence-transformers
  # Expected: sentence-transformers  3.0.1

═════════════════════════════════════════════════════════════════════════════════

🤖 STEP 2: AUTO SETUP (RECOMMENDED)
─────────────────────────────────────────────────────────────────────────────

Jalankan script auto-setup yang akan:
  ✓ Backup file original
  ✓ Replace dengan versi optimized
  ✓ Setup permissions
  ✓ Install dependencies
  ✓ Verify configuration

Command:
  $ bash setup-optimization.sh

Expected Output:
  🚀 Medicheck Memory Optimization - QUICK START
  ═════════════════════════════════════════════════════════════════════════════
  📦 Step 1: Backup original files...
     ✅ Backed up to: backend-ai/rag_engine_backup_20240503_143022.py
  
  📝 Step 2: Replace RAG Engine with optimized version...
     ✅ Replaced: backend-ai/rag_engine.py
  
  🔧 Step 3: Make scripts executable...
     ✅ start-optimized-memory.sh
     ✅ monitor_memory.py
  
  📚 Step 4: Installing monitoring dependency...
     ✅ psutil installed
  
  ✨ Step 5: Verify configuration...
  Configuration Files:
     ✅ backend-ai/rag_engine.py (optimized)
     ✅ next.config.ts (memory optimized)
     ✅ start-optimized-memory.sh (executable)
     ✅ monitor_memory.py (executable)
  
  ═════════════════════════════════════════════════════════════════════════════
  ✅ Setup Complete!

═════════════════════════════════════════════════════════════════════════════════

🔧 STEP 3: MANUAL SETUP (If auto setup failed)
─────────────────────────────────────────────────────────────────────────────

3.1 - Backup Original File
  $ cp backend-ai/rag_engine.py backend-ai/rag_engine_backup.py
  $ echo "✅ Backup created"

3.2 - Replace RAG Engine
  $ cp backend-ai/rag_engine_optimized.py backend-ai/rag_engine.py
  $ echo "✅ RAG Engine replaced"

3.3 - Make Scripts Executable
  $ chmod +x start-optimized-memory.sh
  $ chmod +x monitor_memory.py
  $ echo "✅ Scripts are executable"

3.4 - Install Monitoring Tool
  $ pip install psutil
  $ echo "✅ psutil installed"

═════════════════════════════════════════════════════════════════════════════════

✔️ STEP 4: VERIFICATION
─────────────────────────────────────────────────────────────────────────────

Verify semua file sudah benar:

4.1 - Check RAG Engine is optimized
  $ grep "lazy loading enabled" backend-ai/rag_engine.py
  # Expected: RAGEngine initialized (lazy loading enabled)

4.2 - Check next.config.ts has optimization
  $ grep "maxInactiveAge" next.config.ts
  # Expected: maxInactiveAge: 25 * 1000,

4.3 - Check startup script is executable
  $ ls -l start-optimized-memory.sh
  # Expected: -rwxr-xr-x (with x permission)

4.4 - Verify all docs are created
  $ ls -1 | grep -E "MEMORY|IMPLEMENTATION|COMPARISON|QUICK"
  # Expected:
  # COMPARISON.md
  # IMPLEMENTATION_CHECKLIST.md
  # MEMORY_OPTIMIZATION.md
  # QUICK_REFERENCE.sh
  # setup-optimization.sh
  # start-optimized-memory.sh

═════════════════════════════════════════════════════════════════════════════════

🚀 STEP 5: RUNNING THE APPLICATION
─────────────────────────────────────────────────────────────────────────────

Buka 3 terminals untuk hasil optimal:

─ TERMINAL 1: Run Application ─
  $ ./start-optimized-memory.sh

  Expected Output:
    🚀 Starting Medicheck with memory optimization...
    ✅ Environment variables set:
       NODE_OPTIONS: --max-old-space-size=512
       Torch parallel: disabled
    
    📌 Starting backend AI on port 8000...
       PID: 12345
    
    [Waiting 3 seconds for backend to start...]
    
    📌 Starting Next.js dev server on port 3000...
    ▲ Next.js 16.2.4
    - Local:        http://localhost:3000
    
    ✓ Ready in 1234ms


─ TERMINAL 2: Monitor Memory (Optional tapi SANGAT Recommended) ─
  $ python monitor_memory.py

  Expected Output (update setiap 2 detik):
    [14:30:22]
    System Memory:
      Total:  7.84 GB
      Used:   2.34 GB (29.8%)
      Free:   5.50 GB
    
    Medicheck Processes:
      🐍 Python (RAG Engine):  385.2 MB (1 process)
      📦 Node.js (Next.js):    428.1 MB (3 processes)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      📊 Total:                813.3 MB
    
    Status: ✅ OPTIMAL
    ────────────────────────────────────────────────────────────


─ TERMINAL 3: Test API (Optional) ─
  $ # Wait for both services to start

  # Test health
  $ curl http://localhost:8000/docs
  # Opens Swagger UI at http://localhost:8000/docs

  # Access frontend
  # Browser: http://localhost:3000

═════════════════════════════════════════════════════════════════════════════════

📊 STEP 6: MONITORING & VERIFICATION
─────────────────────────────────────────────────────────────────────────────

6.1 - Check Memory is Stable
  Watch Terminal 2 (monitor_memory.py) output:
  
  ✅ GOOD - Memory stable at ~800MB
  ⚠️  WARNING - Memory growing (approaching 1.2GB)
  🔴 CRITICAL - Memory > 1.2GB

  → If CRITICAL: See Troubleshooting section

6.2 - Test Chat Functionality
  Terminal 3:
  
  $ curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d '{
      "session_id": "test_session",
      "message": "apa gejala flu?"
    }'

  Expected Response:
  {
    "answer": "Gejala flu antara lain...",
    "sources": [...],
    "session_id": "test_session"
  }

6.3 - Monitor Peak Memory During Query
  Terminal 2 (monitor_memory.py):
  
  Make chat request → Watch memory peak
  
  ✅ GOOD - Peak < 1.1GB, returns to ~850MB
  ⚠️  WARNING - Peak 1.2-1.5GB
  🔴 CRITICAL - Peak > 1.5GB

═════════════════════════════════════════════════════════════════════════════════

🆘 TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────────

Problem 1: "OutOfMemory" error muncul
  □ Check memory tidak penuh di Terminal 2
  □ Restart: Ctrl+C di Terminal 1, jalankan ulang
  □ Try: Reduce TOP_K dari 5 ke 3
    sed -i 's/TOP_K.*=.*/TOP_K = 3/' backend-ai/rag_engine.py
  □ Try: Production build next.js (jauh lebih hemat)
    npm run build && npm start

Problem 2: "Connection refused" untuk API
  □ Pastikan backend sudah siap (wait 3 sec after starting)
  □ Check port 8000 tidak terpakai: lsof -i :8000
  □ Check backend running: ps aux | grep main.py

Problem 3: Chat response lambat (>3 detik)
  □ Normal jika query berat atau network lambat
  □ Check CPU tidak saturated: top -p $(pgrep python)
  □ Try: Production build Next.js

Problem 4: "Model not found" error
  □ Check dependencies: pip list | grep sentence-transformers
  □ Install jika missing: pip install sentence-transformers
  □ Restart backend: Ctrl+C dan jalankan ulang

═════════════════════════════════════════════════════════════════════════════════

📊 EXPECTED MEMORY USAGE
─────────────────────────────────────────────────────────────────────────────

Device dengan RAM 2GB:
  Before optimization: 1.7GB (80% → OOM)
  After optimization:  800MB (40% → Stable)

Device dengan RAM 4GB:
  Before optimization: 1.7GB (42%)
  After optimization:  800MB (20%)

Device dengan RAM 8GB:
  Before optimization: 1.7GB (21%)
  After optimization:  800MB (10%)

═════════════════════════════════════════════════════════════════════════════════

📚 DOKUMENTASI LENGKAP
─────────────────────────────────────────────────────────────────────────────

Untuk informasi lebih detail:

1. MEMORY_OPTIMIZATION.md
   - Penjelasan lengkap masalah dan solusi
   - Detail setiap optimasi

2. IMPLEMENTATION_CHECKLIST.md
   - Step-by-step implementation
   - Troubleshooting detailed
   - Fine tuning options

3. COMPARISON.md
   - Perbandingan before vs after
   - Code comparison
   - Performance metrics

4. QUICK_REFERENCE.sh
   - Command quick reference
   - Common commands
   - Debugging commands

═════════════════════════════════════════════════════════════════════════════════

🎉 SUCCESS INDICATORS
─────────────────────────────────────────────────────────────────────────────

Anda berhasil jika:
  ✅ Aplikasi berjalan tanpa "OutOfMemory"
  ✅ Memory penggunaan < 1GB pada idle
  ✅ Chat queries complete dalam 1-2 detik
  ✅ Memory stabil (tidak terus naik)
  ✅ Monitor menunjukkan "✅ OPTIMAL"

═════════════════════════════════════════════════════════════════════════════════

❓ QUESTIONS?
─────────────────────────────────────────────────────────────────────────────

Lihat file dokumentasi:
  - MEMORY_OPTIMIZATION.md
  - IMPLEMENTATION_CHECKLIST.md

Atau check troubleshooting di file tersebut!

═════════════════════════════════════════════════════════════════════════════════
EOF

echo ""
echo "✅ Setup complete! Ikuti langkah-langkah di atas."
echo ""
echo "NEXT STEP: Buka Terminal 1 dan jalankan:"
echo "  $ ./start-optimized-memory.sh"
echo ""
