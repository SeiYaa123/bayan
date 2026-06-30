"""Tests unitaires pour le cache Redis de recherche."""

import json
import pytest
from services.cache import get_cached_search, set_cached_search, _cache_key, SEARCH_CACHE_TTL


# ── Tests de la clé de cache ──────────────────────────────────────────────────

def test_cache_key_is_deterministic():
    k1 = _cache_key("رحمة", ["quran", "hadith"], 20, 0)
    k2 = _cache_key("رحمة", ["quran", "hadith"], 20, 0)
    assert k1 == k2


def test_cache_key_ignores_types_order():
    k1 = _cache_key("علم", ["quran", "hadith"], 20, 0)
    k2 = _cache_key("علم", ["hadith", "quran"], 20, 0)
    assert k1 == k2


def test_cache_key_different_for_different_queries():
    k1 = _cache_key("رحمة", [], 20, 0)
    k2 = _cache_key("علم", [], 20, 0)
    assert k1 != k2


def test_cache_key_different_for_different_offsets():
    k1 = _cache_key("رحمة", [], 20, 0)
    k2 = _cache_key("رحمة", [], 20, 20)
    assert k1 != k2


def test_cache_key_starts_with_prefix():
    k = _cache_key("test", [], 20, 0)
    assert k.startswith("search:")


def test_search_cache_ttl_value():
    assert SEARCH_CACHE_TTL == 300


# ── Tests get/set avec FakeRedis ──────────────────────────────────────────────

class FakeRedis:
    def __init__(self):
        self._store: dict = {}

    async def get(self, key: str):
        v = self._store.get(key)
        return v.encode() if isinstance(v, str) else v

    async def set(self, key: str, value, ex: int | None = None):
        self._store[key] = value


@pytest.mark.asyncio
async def test_get_cached_search_miss():
    redis = FakeRedis()
    result = await get_cached_search(redis, "رحمة", [], 20, 0)
    assert result is None


@pytest.mark.asyncio
async def test_set_and_get_cached_search():
    redis = FakeRedis()
    payload = {"results": [], "total": 0, "query": "رحمة"}
    await set_cached_search(redis, "رحمة", [], 20, 0, payload)
    result = await get_cached_search(redis, "رحمة", [], 20, 0)
    assert result == payload


@pytest.mark.asyncio
async def test_cache_stores_valid_json():
    redis = FakeRedis()
    payload = {"results": [{"id": "abc", "arabic": "بسم الله"}], "total": 1, "query": "الله"}
    await set_cached_search(redis, "الله", ["quran"], 10, 0, payload)

    key = _cache_key("الله", ["quran"], 10, 0)
    raw = redis._store.get(key)
    assert raw is not None
    parsed = json.loads(raw)
    assert parsed["total"] == 1


@pytest.mark.asyncio
async def test_different_queries_dont_collide():
    redis = FakeRedis()
    payload1 = {"results": [], "total": 0, "query": "رحمة"}
    payload2 = {"results": [], "total": 5, "query": "علم"}

    await set_cached_search(redis, "رحمة", [], 20, 0, payload1)
    await set_cached_search(redis, "علم", [], 20, 0, payload2)

    r1 = await get_cached_search(redis, "رحمة", [], 20, 0)
    r2 = await get_cached_search(redis, "علم", [], 20, 0)

    assert r1["query"] == "رحمة"
    assert r2["query"] == "علم"
    assert r2["total"] == 5
