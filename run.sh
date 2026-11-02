#!/usr/bin/env bash

# ==============================================================================
# EcoTrack – Avtomatik Ishga Tushirish Skripti (Single Run Script)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Ranglar
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${GREEN}   🌿 EcoTrack – Loyihani Ishga Tushirish 🚀${NC}"
echo -e "${CYAN}======================================================${NC}\n"

# 1. Tekshiruvlar: Python va Node.js
PYTHON_BIN=""
for py in python3.12 python3.11 python3.10 python3; do
    if command -v "$py" &> /dev/null; then
        # Check if python version is < 3.14 (3.14 is currently incompatible with pydantic-core / asyncpg wheels)
        PY_VER=$("$py" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || true)
        if [[ "$PY_VER" =~ ^3\.(10|11|12|13)$ ]]; then
            PYTHON_BIN="$py"
            break
        elif [ -z "$PYTHON_BIN" ]; then
            PYTHON_BIN="$py"
        fi
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}[XATO] Python 3 o'rnatilmagan! Iltimos, Python 3 ni o'rnating.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[XATO] Node.js / npm o'rnatilmagan! Iltimos, Node.js ni o'rnating.${NC}"
    exit 1
fi

# To'xtatish funksiyasi (Ctrl+C bosilganda barcha jarayonlarni to'xtatish)
cleanup() {
    echo -e "\n${YELLOW}⚠️  Loyiha to'xtatilmoqda...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Barcha serverlar to'xtatildi.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 2. Backendni sozlash va ishga tushirish
echo -e "${BLUE}▶ 1. Backend sozlanmoqda... (Python: $PYTHON_BIN)${NC}"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}  Virtual muhit (venv) yaratilmoqda ($PYTHON_BIN)...${NC}"
    "$PYTHON_BIN" -m venv venv
fi

# venv ni faollashtirish
source venv/bin/activate

echo -e "${YELLOW}  Kutubxonalar tekshirilmoqda / o'rnatilmoqda...${NC}"
pip install -q -r requirements.txt

echo -e "${GREEN}  ✓ Backend (FastAPI) ishga tushirilmoqda (port 8080)...${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!

# 3. Frontendni sozlash va ishga tushirish
echo -e "\n${BLUE}▶ 2. Frontend sozlanmoqda...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  npm paketlari o'rnatilmoqda...${NC}"
    npm install
fi

echo -e "${GREEN}  ✓ Frontend (React / Vite) ishga tushirilmoqda (port 5173)...${NC}"
npm run dev &
FRONTEND_PID=$!

# 4. Ma'lumotlarni chiqarish
sleep 2
echo -e "\n${CYAN}======================================================${NC}"
echo -e "${GREEN}  🎉 Loyiha muvaffaqiyatli ishga tushdi!${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "  🌐 Frontend (Veb-sayt) : ${BLUE}http://localhost:5173${NC}"
echo -e "  📚 Backend Swagger API : ${BLUE}http://localhost:8080/docs${NC}"
echo -e "------------------------------------------------------"
echo -e "  🔑 ${YELLOW}Demo Login Ma'lumotlari:${NC}"
echo -e "     • Manager : ${CYAN}manager@mueller-tech.de${NC} / ${CYAN}Password123!${NC}"
echo -e "     • Auditor : ${CYAN}auditor@mueller-tech.de${NC} / ${CYAN}Password123!${NC}"
echo -e "     • Admin   : ${CYAN}admin@ecotrack.de${NC} / ${CYAN}AdminSecret123!${NC}"
echo -e "------------------------------------------------------"
echo -e "  To'xtatish uchun ${RED}Ctrl + C${NC} tugmalarini bosing."
echo -e "${CYAN}======================================================${NC}\n"

# Brauzerda avtomatik ochish (Mac yoki Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:5173" 2>/dev/null || true
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:5173" 2>/dev/null || true
fi

# Jarayonlar tugashini kutish
wait $BACKEND_PID $FRONTEND_PID
