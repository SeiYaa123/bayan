"""
Analytics de recherche stockées dans Redis.

Structures :
- search:analytics:queries  — sorted set, score = nb recherches (ZINCRBY)
- search:analytics:types    — hash, field = type source, value = count
"""

from redis.asyncio import Redis

QUERIES_KEY = "search:analytics:queries"
TYPES_KEY = "search:analytics:types"
TOP_N = 10


async def record_search(redis: Redis, query: str, types: list[str]) -> None:
    pipe = redis.pipeline()
    pipe.zincrby(QUERIES_KEY, 1, query)
    for t in types:
        pipe.hincrby(TYPES_KEY, t, 1)
    if not types:
        pipe.hincrby(TYPES_KEY, "all", 1)
    await pipe.execute()


async def get_top_searches(redis: Redis, n: int = TOP_N) -> list[dict]:
    rows = await redis.zrevrange(QUERIES_KEY, 0, n - 1, withscores=True)
    return [{"query": q, "count": int(score)} for q, score in rows]


async def get_type_breakdown(redis: Redis) -> dict[str, int]:
    raw = await redis.hgetall(TYPES_KEY)
    return {k: int(v) for k, v in raw.items()}
