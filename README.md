# ◈ Akashic Search

Moteur de recherche sémantique sur le corpus islamique classique — Coran, Hadith, Tafsir, Fiqh.

Recherche en arabe, français et anglais. Graphe de connexions inter-textes, comparaison inter-madhhabs, navigation isnad, évolution sémantique mecquoise / médinoise.

---

## Stack

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python 3.12 · SQLAlchemy async |
| Base de données | PostgreSQL 16 · pgvector · pg_trgm |
| Cache | Redis 7 (rate limit + cache résultats 5 min) |
| Embeddings | `intfloat/multilingual-e5-large` (dim 1024) |
| Auth | Clerk |
| Paiements | Stripe (Premium 12 €/mo · API 29 €/mo) |
| CI | GitHub Actions (pytest + tsc + docker build) |

## Corpus

| Source | Contenu |
|--------|---------|
| Coran | 6 236 ayats (arabe + traductions FR/EN) |
| Hadith | ~60 000 hadiths (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah) |
| Tafsir | Ibn Kathir, Tabari |
| Fiqh | Hanafi, Maliki, Shafi'i, Hanbali |

---

## Démarrage rapide

### Prérequis

- Docker 24+ (`docker compose` v2)
- Node.js 20+
- Python 3.12+

### Installation en 3 commandes

```bash
git clone https://github.com/votre-org/akashic-search.git
cd akashic-search
bash scripts/setup.sh
```

Le script :
1. Vérifie les prérequis
2. Copie `.env.example` → `.env`
3. Lance PostgreSQL + Redis via Docker
4. Applique les migrations SQL
5. Installe les dépendances Python et Node

### Démarrage manuel

```bash
# Infrastructure
docker compose up -d postgres redis

# Backend (port 8000)
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (port 3000)
cd apps/web
npm install
npm run dev
```

### Ingestion du corpus

```bash
cd packages/corpus
pip install -r requirements.txt

python ingest_quran.py          # 6 236 ayats (~2 min)
python ingest_hadith.py bukhari # ~7 563 hadiths
python ingest_hadith.py muslim  # ~7 470 hadiths
python ingest_hadith.py all     # toutes les 6 collections

# Générer les connexions inter-textes (après ingestion)
python generate_cross_refs.py --threshold 0.72

# Charger les isnads Bukhari (chaînes de transmission)
python ingest_isnad.py
```

---

## Variables d'environnement

Copiez `.env.example` → `.env` et renseignez :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL async (`postgresql+asyncpg://...`) |
| `REDIS_URL` | Redis (`redis://...`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `CLERK_SECRET_KEY` | Clé secrète Clerk |
| `CLERK_WEBHOOK_SECRET` | Secret du webhook Clerk (`user.created`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` | Price ID Stripe plan Premium |
| `NEXT_PUBLIC_STRIPE_PRICE_API` | Price ID Stripe plan API |
| `ADMIN_SECRET_KEY` | Protège `/api/admin/stats` |
| `ALLOWED_ORIGINS` | CORS (virgule-séparées) |

---

## Architecture

```
projetMaker/
├── apps/
│   ├── web/                    # Next.js App Router
│   │   └── src/
│   │       ├── app/            # Pages (landing, search, pricing, dashboard…)
│   │       ├── components/     # SearchBar, ResultCard, NavBar, ConnectionGraph…
│   │       └── lib/            # api.ts, stripe.ts, searchHistory.ts
│   └── api/                    # FastAPI
│       ├── routers/            # search, texts, roots, fiqh, isnad, semantic_evolution, users, admin
│       ├── services/           # search (RRF), morphology (racines), fiqh, cache
│       ├── middleware/         # auth (Clerk JWT), rate_limit (Redis)
│       └── tests/              # pytest (conftest, users, cache, hybrid_search, morphology…)
├── packages/corpus/            # Scripts d'ingestion
│   ├── ingest_quran.py
│   ├── ingest_hadith.py
│   ├── generate_cross_refs.py
│   └── ingest_isnad.py
├── infra/migrations/           # SQL (001_init → 003_users_api_key)
├── scripts/
│   └── setup.sh               # Installation automatisée
├── .github/workflows/ci.yml    # CI GitHub Actions
└── docker-compose.yml
```

## Recherche sémantique

```
Requête → embed_query() (préfixe "query:")
        → pgvector cosine similarity (leg sémantique)
        + pg_trgm trigram (leg keyword)
        → Reciprocal Rank Fusion k=60
        → Cache Redis 5 min
        → Résultats avec match_type: semantic | keyword | hybrid
```

---

## Commandes utiles

```bash
# Tests backend
cd apps/api && pytest -q

# Tests avec couverture
cd apps/api && pytest --cov=. --cov-report=term-missing

# Type-check frontend
cd apps/web && npx tsc --noEmit

# Lint frontend
cd apps/web && npm run lint

# Build production
cd apps/web && npm run build

# Logs API en temps réel
docker compose logs -f api

# Stats admin (remplacer YOUR_KEY)
curl -H "X-Admin-Key: YOUR_KEY" http://localhost:8000/api/admin/stats

# Analyse d'une racine arabe
curl "http://localhost:8000/api/roots/analyze?token=رَحْمَة"
```

---

## Endpoints API principaux

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=رحمة` | Recherche hybride (sémantique + keyword) |
| `GET /api/texts/{id}` | Texte complet + métadonnées |
| `GET /api/search/{id}/connections` | Connexions inter-textes (graphe) |
| `GET /api/roots/analyze?token=` | Analyse morphologique d'un token arabe |
| `GET /api/fiqh/compare?topic=` | Comparaison inter-madhhabs |
| `GET /api/isnad/{hadith_id}` | Chaîne de transmission isnad |
| `GET /api/semantic-evolution?concept=` | Évolution mecquoise / médinoise |
| `POST /api/users/sync` | Sync plan utilisateur (webhook Stripe) |
| `GET /api/users/me` | Profil + quota (auth requise) |
| `GET /api/admin/stats` | Métriques d'usage (admin) |

---

## Sensibilité du domaine

Ce produit opère sur des textes religieux.

- **Ton neutre obligatoire** — aucune interprétation automatique, aucune fatwa
- **Source primaire systématique** — chaque résultat affiche sa référence complète
- Les résultats sont des pointeurs vers des textes classiques, pas des avis juridiques

---

## Roadmap

- [ ] Ingest Tafsir al-Tabari complet
- [ ] Recherche en langue naturelle (question → textes)
- [ ] Graphe d'isnad complet avec données réelles
- [ ] Application mobile (React Native)
- [ ] Support multilingue (EN, AR, TR, ID)
- [ ] Export PDF des recherches

---

## Licence

Le corpus islamique (Coran, Hadiths, Tafsirs) est du domaine public.  
Le code source est sous licence MIT.
