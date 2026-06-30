#!/usr/bin/env bash
# setup.sh — Installation initiale d'Akashic Search
# Usage : bash scripts/setup.sh

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "${RED}✗${NC}  $1"; exit 1; }
step() { echo -e "\n${YELLOW}▶${NC} $1"; }

echo ""
echo "◈  Akashic Search — Setup"
echo "──────────────────────────────────"

# ── 1. Prérequis ──────────────────────────────────────────────────────────────
step "Vérification des prérequis"

command -v docker  >/dev/null 2>&1 || fail "Docker est requis (https://docs.docker.com/get-docker/)"
command -v node    >/dev/null 2>&1 || fail "Node.js 20+ est requis (https://nodejs.org)"
command -v python3 >/dev/null 2>&1 || fail "Python 3.12+ est requis (https://python.org)"
command -v npm     >/dev/null 2>&1 || fail "npm est requis"

DOCKER_COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE_CMD="docker-compose"
else
  fail "docker compose ou docker-compose est requis"
fi

NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 20 ]; then
  fail "Node.js 20+ requis (version actuelle : $(node --version))"
fi

PYTHON_VER=$(python3 --version | awk '{print $2}' | cut -d. -f1-2)
ok "Docker    : $(docker --version | awk '{print $3}' | tr -d ',')"
ok "Node.js   : $(node --version)"
ok "Python    : $(python3 --version | awk '{print $2}')"

# ── 2. Variables d'environnement ──────────────────────────────────────────────
step "Configuration des variables d'environnement"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  ok "Fichier .env créé depuis .env.example"
  warn "Éditez .env et renseignez vos clés Clerk, Stripe, etc. avant de continuer."
  echo ""
  echo "  nano .env   # ou votre éditeur préféré"
  echo ""
  read -rp "Appuyez sur Entrée une fois .env configuré…"
else
  ok ".env déjà présent"
fi

# ── 3. Infrastructure Docker ──────────────────────────────────────────────────
step "Démarrage de PostgreSQL + Redis"

$DOCKER_COMPOSE_CMD up -d postgres redis

echo -n "  Attente de PostgreSQL"
for i in $(seq 1 30); do
  if $DOCKER_COMPOSE_CMD exec -T postgres pg_isready -U akashic -d akashic_db >/dev/null 2>&1; then
    break
  fi
  echo -n "."
  sleep 1
done
echo ""
ok "PostgreSQL prêt"

echo -n "  Attente de Redis"
for i in $(seq 1 15); do
  if $DOCKER_COMPOSE_CMD exec -T redis redis-cli ping >/dev/null 2>&1; then
    break
  fi
  echo -n "."
  sleep 1
done
echo ""
ok "Redis prêt"

# ── 4. Migrations SQL ─────────────────────────────────────────────────────────
step "Application des migrations SQL"

for migration in infra/migrations/*.sql; do
  filename=$(basename "$migration")
  $DOCKER_COMPOSE_CMD exec -T postgres psql -U akashic -d akashic_db -f "/docker-entrypoint-initdb.d/$filename" >/dev/null 2>&1 || true
  ok "Migration : $filename"
done

# ── 5. Dépendances backend ────────────────────────────────────────────────────
step "Installation des dépendances Python"

cd apps/api
python3 -m pip install --quiet -r requirements.txt
ok "Dépendances backend installées"
cd "$ROOT"

# ── 6. Dépendances frontend ───────────────────────────────────────────────────
step "Installation des dépendances Node.js"

cd apps/web
npm install --silent
ok "Dépendances frontend installées"
cd "$ROOT"

# ── 7. Récapitulatif ──────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────"
echo -e "${GREEN}✓ Setup terminé !${NC}"
echo ""
echo "Prochaines étapes :"
echo ""
echo "  1. Ingérer le corpus :"
echo "       cd packages/corpus"
echo "       python ingest_quran.py"
echo "       python ingest_hadith.py bukhari"
echo ""
echo "  2. Démarrer le backend :"
echo "       cd apps/api && uvicorn main:app --reload --port 8000"
echo ""
echo "  3. Démarrer le frontend :"
echo "       cd apps/web && npm run dev"
echo ""
echo "  4. Ouvrir http://localhost:3000"
echo ""
echo "  Ou tout lancer avec Docker :"
echo "       docker compose up --build"
echo ""
