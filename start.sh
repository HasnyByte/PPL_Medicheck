#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Master launcher - Choose between modes
# ──────────────────────────────────────────────────────────────────────────────

set -e

echo "=================================================="
echo "       MediCheck - Choose Startup Mode"
echo "=================================================="
echo ""
echo "1️⃣  LIGHTWEIGHT MODE (Recommended for low RAM)"
echo "   • Memory: ~300MB total"
echo "   • Features: Disease screening only"
echo "   • Speed: Fast"
echo ""
echo "2️⃣  OPTIMIZED MODE (For 2GB+ RAM)"
echo "   • Memory: ~800MB total"
echo "   • Features: + Chat + RAG"
echo "   • Speed: Normal"
echo ""
echo "3️⃣  FULL MODE (For 4GB+ RAM)"
echo "   • Memory: ~1.7GB+"
echo "   • Features: Full RAG + Embeddings"
echo "   • Speed: Slower startup"
echo ""

read -p "Choose mode (1/2/3) [default: 1]: " MODE
MODE=${MODE:-1}

case $MODE in
    1)
        echo ""
        echo "🚀 Launching LIGHTWEIGHT MODE..."
        bash start-lightweight.sh
        ;;
    2)
        echo ""
        echo "🚀 Launching OPTIMIZED MODE..."
        bash start-optimized-memory.sh
        ;;
    3)
        echo ""
        echo "🚀 Launching FULL MODE..."
        cd backend-ai
        source rag_env/bin/activate
        cd ..
        npm run dev &
        cd backend-ai
        python main.py
        ;;
    *)
        echo "❌ Invalid choice. Please run again."
        exit 1
        ;;
esac
