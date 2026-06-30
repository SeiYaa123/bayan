# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Bayān** — moteur de recherche sémantique sur le corpus islamique (Coran, Hadith, Tafsir, Fiqh). Recherche cross-corpus via embeddings Arabic NLP, visualisation des connexions entre textes, comparaison inter-madhhabs. Accès libre, sans compte, sans paiement.

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| Base de données | PostgreSQL 16 + pgvector + pg_trgm |
| Cache | Redis 7 |
| Embeddings | `intfloat/multilingual-e5-large` (dim 1024) |

## Commandes

```bash
# Setup initial (première fois)
bash scripts/setup.sh

# Infrastructure
docker compose up -d          # Démarre PostgreSQL + Redis (+ api + web en prod)
docker compose down           # Arrête tout
docker compose logs -f api    # Logs du backend

# Backend (apps/api)
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
pytest -q                              # Tous les tests
pytest --cov=. --cov-report=term-missing  # Avec couverture

# Frontend (apps/web)
cd apps/web
npm install
npm run dev                   # http://localhost:3000
npm run build && npm run start # Production locale
npm run lint                  # ESLint
npx tsc --noEmit              # Type-check

# Ingestion du corpus (packages/corpus)
cd packages/corpus
pip install -r requirements.txt
python ingest_quran.py               # Coran (6 236 ayats, ~2 min)
python ingest_hadith.py bukhari      # Bukhari (~7 563 hadiths)
python ingest_hadith.py all          # Toutes les 6 collections
python generate_cross_refs.py        # Connexions inter-textes (après ingestion)
python ingest_isnad.py               # Chaînes de transmission Bukhari
```

## Architecture

```
projetMaker/
├── apps/
│   ├── web/              # Next.js App Router
│   │   └── src/
│   │       ├── app/      # Pages : landing, search, pricing, corpus, fiqh, evolution, apprentissage, text/[id]
│   │       │              #         sitemap.ts, robots.ts
│   │       ├── components/ # SearchBar (debounce, historique), ResultCard, NavBar, ConnectionGraph, IsnadChain
│   │       └── lib/      # api.ts (fetch + pagination), searchHistory.ts (localStorage)
│   └── api/              # FastAPI Python 3.12
│       ├── main.py        # App + CORS (ALLOWED_ORIGINS env) + lifespan
│       ├── models.py      # ORM : Source, TextUnit (Vector 1024), Narrator, IsnadLink, CrossReference
│       ├── config.py      # Settings pydantic + validate_production()
│       ├── services/      # search (RRF hybride), morphology (CAMeL + table statique), fiqh, cache Redis
│       ├── middleware/    # rate_limit (Redis, reset minuit UTC), request_logging
│       ├── routers/       # search, texts, roots, fiqh, isnad, semantic_evolution, admin, corpus
│       └── tests/         # pytest : conftest (FakeRedis), test_cache, test_hybrid_search…
├── packages/corpus/       # Scripts d'ingestion
├── infra/migrations/      # 001_init.sql, 002_revelation_period.sql, 003_users_api_key.sql
├── scripts/setup.sh       # Installation automatisée
├── .github/workflows/ci.yml  # CI : pytest + tsc + docker build
└── docker-compose.yml     # postgres, redis, api, web
```

## Modèle de données

- `sources` — catalogue des collections (quran, bukhari, ibn_kathir, etc.)
- `texts` — unité textuelle avec embedding vector(1024), référence, arabe + traductions
- `cross_references` — connexions sémantiques entre textes (Coran ↔ Hadith ↔ Tafsir)
- `isnad_links` — chaîne de transmission des hadiths (lien hadith ↔ narrator)
- `narrators` — transmetteurs avec grade de fiabilité (thiqah / sadouq / da_if)

## Recherche sémantique

Requête → `embed_query()` (préfixe `query:`) → Reciprocal Rank Fusion (k=60) :
- **Leg sémantique** : pgvector cosine similarity (`<=>`) sur `texts.embedding`
- **Leg keyword** : pg_trgm similarity sur `texts.arabic`
- Résultats fusionnés avec `match_type: semantic | keyword | hybrid`
- Cache Redis TTL 300 s (clé SHA-256 de la requête normalisée)

## Routers backend

- `GET /api/search?q=&types[]=&limit=&offset=` — recherche hybride avec cache
- `GET /api/search/{id}/connections` — graphe de connexions
- `GET /api/roots/analyze?token=` — morphologie arabe
- `GET /api/fiqh/compare?topic=` — comparaison madhhabs
- `GET /api/isnad/{hadith_id}` — chaîne de transmission
- `GET /api/semantic-evolution?concept=` — évolution mecquoise/médinoise
- `GET /api/admin/stats` — métriques (header `X-Admin-Key`)

## Variables d'environnement

Copier `.env.example` → `.env` et remplir avant de démarrer.
Variables critiques : `DATABASE_URL`, `REDIS_URL`, `EMBEDDING_MODEL`.

## Sensibilité du domaine

Ce produit opère sur des textes religieux. Ton neutre obligatoire — aucune interprétation automatique, aucune fatwa. Afficher systématiquement la source primaire complète avec sa référence.
