"""
Fixtures partagées pour tous les tests.

Architecture :
- app_client : AsyncClient ASGI avec Redis mocké en mémoire (fakeredis)
- db_session  : session SQLAlchemy sur SQLite in-memory (pas de Postgres requis)

fakeredis et aiosqlite doivent être installés :
  pip install fakeredis aiosqlite
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock


# ── Redis mock ────────────────────────────────────────────────────────────────

class FakeRedisPipeline:
    def __init__(self, store: dict, zsets: dict, hashes: dict):
        self._store = store
        self._zsets = zsets
        self._hashes = hashes
        self._ops: list = []

    def incr(self, key: str):
        self._ops.append(("incr", key))
        return self

    def expire(self, key: str, ttl: int):
        self._ops.append(("expire", key, ttl))
        return self

    def zincrby(self, key: str, amount: float, member: str):
        self._ops.append(("zincrby", key, amount, member))
        return self

    def hincrby(self, key: str, field: str, amount: int):
        self._ops.append(("hincrby", key, field, amount))
        return self

    async def execute(self):
        results = []
        for op in self._ops:
            if op[0] == "incr":
                self._store[op[1]] = self._store.get(op[1], 0) + 1
                results.append(self._store[op[1]])
            elif op[0] == "expire":
                results.append(True)
            elif op[0] == "zincrby":
                _, key, amount, member = op
                zset = self._zsets.setdefault(key, {})
                zset[member] = zset.get(member, 0.0) + amount
                results.append(zset[member])
            elif op[0] == "hincrby":
                _, key, field, amount = op
                h = self._hashes.setdefault(key, {})
                h[field] = h.get(field, 0) + amount
                results.append(h[field])
        return results


class FakeRedis:
    """Implémentation Redis minimale en mémoire pour les tests."""

    def __init__(self):
        self._store: dict = {}
        self._zsets: dict[str, dict[str, float]] = {}
        self._hashes: dict[str, dict[str, int]] = {}

    async def get(self, key: str):
        val = self._store.get(key)
        return str(val).encode() if val is not None else None

    async def set(self, key: str, value, ex: int | None = None):
        self._store[key] = value

    async def incr(self, key: str):
        self._store[key] = self._store.get(key, 0) + 1
        return self._store[key]

    async def expire(self, key: str, ttl: int):
        return True

    async def zincrby(self, key: str, amount: float, member: str):
        zset = self._zsets.setdefault(key, {})
        zset[member] = zset.get(member, 0.0) + amount
        return zset[member]

    async def zrevrange(self, key: str, start: int, end: int, withscores: bool = False):
        zset = self._zsets.get(key, {})
        sorted_items = sorted(zset.items(), key=lambda x: x[1], reverse=True)
        sliced = sorted_items[start: None if end == -1 else end + 1]
        if withscores:
            return [(m, s) for m, s in sliced]
        return [m for m, _ in sliced]

    async def hincrby(self, key: str, field: str, amount: int):
        h = self._hashes.setdefault(key, {})
        h[field] = h.get(field, 0) + amount
        return h[field]

    async def hgetall(self, key: str):
        return {k: str(v) for k, v in self._hashes.get(key, {}).items()}

    async def ping(self):
        return True

    async def aclose(self):
        pass

    def pipeline(self):
        return FakeRedisPipeline(self._store, self._zsets, self._hashes)

    def flush(self):
        self._store.clear()
        self._zsets.clear()
        self._hashes.clear()


@pytest.fixture
def fake_redis():
    r = FakeRedis()
    yield r
    r.flush()


# ── App client ────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def app_client(fake_redis):
    """Client HTTP vers l'app FastAPI avec Redis remplacé par FakeRedis."""
    from main import app

    app.state.redis = fake_redis

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


# ── Embeddings mock ───────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def mock_embeddings(monkeypatch):
    """Remplace le modèle d'embedding par un vecteur fixe (évite de charger 1 Go)."""
    import embeddings as emb_module

    fake_vector = [0.0] * 1024
    monkeypatch.setattr(emb_module, "embed_query", lambda q: fake_vector)
    monkeypatch.setattr(emb_module, "embed_passage", lambda t: fake_vector)

    class FakeModel:
        def encode(self, texts, **kwargs):
            return [fake_vector] * len(texts)

    monkeypatch.setattr(emb_module, "get_model", lambda: FakeModel())
