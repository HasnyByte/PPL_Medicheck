#!/bin/bash
# MediCheck v3.0.0 — Start All Services
set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║     MediCheck v3.0.0 — Startup           ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${RESET}"

# Check Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${RESET}"; exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${RESET}"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo -e "${YELLOW}⚠️  Python3 not found — backend-ai will be skipped${RESET}"
  SKIP_AI=true
fi

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── BACKEND ──────────────────────────────────────────
echo -e "\n${CYAN}📦 Setting up Backend...${RESET}"
cd "$ROOT_DIR/backend"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠️  .env created from .env.example — please configure DATABASE_URL${RESET}"
fi
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."; npm install --silent
fi
echo "Generating Prisma client..."; npx prisma generate --silent 2>/dev/null || true
echo "Pushing DB schema..."; npx prisma db push --skip-generate 2>/dev/null || echo -e "${YELLOW}⚠️  DB push failed — check DATABASE_URL in backend/.env${RESET}"

# ── BACKEND-AI ────────────────────────────────────────
if [ -z "$SKIP_AI" ]; then
  echo -e "\n${CYAN}🤖 Setting up Backend AI...${RESET}"
  cd "$ROOT_DIR/backend-ai"
  if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  backend-ai/.env created — add GROQ_API_KEY for full AI features${RESET}"
  fi
  if [ ! -d "venv" ]; then
    echo "Creating Python venv..."; python3 -m venv venv
    echo "Installing Python dependencies..."; ./venv/bin/pip install -q -r requirements.txt
  fi
fi

# ── FRONTEND ─────────────────────────────────────────
echo -e "\n${CYAN}🌐 Setting up Frontend...${RESET}"
cd "$ROOT_DIR/frontend"
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
fi
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."; npm install --silent
fi

# ── START SERVICES ────────────────────────────────────
echo -e "\n${BOLD}${GREEN}🚀 Starting all services...${RESET}"

cd "$ROOT_DIR/backend"
PORT=4000 npm start &
BACKEND_PID=$!

if [ -z "$SKIP_AI" ]; then
  cd "$ROOT_DIR/backend-ai"
  ./venv/bin/python main.py &
  AI_PID=$!
fi

cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════${RESET}"
echo -e "${GREEN}  ✅ Frontend  →  http://localhost:3000${RESET}"
echo -e "${GREEN}  ✅ Backend   →  http://localhost:4000${RESET}"
echo -e "${GREEN}  ✅ AI API    →  http://localhost:8000${RESET}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════${RESET}"
echo -e "\n${YELLOW}Default accounts (after seeding):${RESET}"
echo "  Admin:   admin@medicheck.id / admin123"
echo "  Doctor:  rizky.jantung@medicheck.id / dokter123"
echo "  Patient: pasien@medicheck.id / pasien123"
echo -e "\n${CYAN}Press Ctrl+C to stop all services${RESET}"

trap "kill $BACKEND_PID $FRONTEND_PID ${AI_PID:-} 2>/dev/null; echo -e '\n${RED}All services stopped.${RESET}'" EXIT
wait
