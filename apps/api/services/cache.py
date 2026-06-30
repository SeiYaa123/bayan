"""
Cache Redis pour les résultats de recherche.

Clé : sha256(query + sorted_types + limit + offset) → JSON
TTL  : 5 minutes (300 s) — cohérent avec la latence d'ingestion.
"""

import hashlib
import json
from redis.asyncio import Redis


SEARCH_CACHE_TTL = 300  # secondes


def _cache_key(query: str, types: list[str], limit: int, offset: int) -> str:
    raw = f"{query}|{','.join(sorted(types))}|{limit}|{offset}"
    return "search:" + hashlib.sha256(raw.encode()).hexdigest()


async def get_cached_search(
    redis: Redis,
    query: str,
    types: list[str],
    limit: int,
    offset: int,
) -> dict | None:
    key = _cache_key(query, types, limit, offset)
    value = await redis.get(key)
    if value is None:
        return None
    return json.loads(value)


async def set_cached_search(
    redis: Redis,
    query: str,
    types: list[str],
    limit: int,
    offset: int,
    payload: dict,
) -> None:
    key = _cache_key(query, types, limit, offset)
    await redis.set(key, json.dumps(payload, ensure_ascii=False), ex=SEARCH_CACHE_TTL)
