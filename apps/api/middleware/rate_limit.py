"""
Rate limiting par IP (utilisateurs non authentifiés) ou user_id (authentifiés).

Stratégie :
  - Free  : 20 requêtes / 24h par IP
  - Premium : 500 requêtes / 24h par user
  - API  : usage-based (compté séparément)

Stockage Redis : clé TTL = minuit UTC (reset quotidien naturel).
"""

import time
from datetime import datetime, timezone
from fastapi import Request, HTTPException
from redis.asyncio import Redis

FREE_DAILY_LIMIT = 20
PREMIUM_DAILY_LIMIT = 500


def _seconds_until_midnight() -> int:
    now = datetime.now(timezone.utc)
    midnight = now.replace(hour=23, minute=59, second=59)
    return max(1, int((midnight - now).total_seconds()))


async def get_redis(request: Request) -> Redis:
    return request.app.state.redis


async def check_rate_limit(
    request: Request,
    user_id: str | None = None,
    plan: str = "free",
) -> dict:
    redis: Redis = request.app.state.redis

    if user_id:
        key = f"ratelimit:user:{user_id}"
        limit = PREMIUM_DAILY_LIMIT if plan in ("premium", "api") else FREE_DAILY_LIMIT
    else:
        ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:ip:{ip}"
        limit = FREE_DAILY_LIMIT

    current = await redis.get(key)
    count = int(current) if current else 0

    if count >= limit:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "limit": limit,
                "reset_in_seconds": _seconds_until_midnight(),
                "upgrade_url": "/pricing",
            },
        )

    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, _seconds_until_midnight())
    await pipe.execute()

    return {
        "x-ratelimit-limit": str(limit),
        "x-ratelimit-remaining": str(limit - count - 1),
        "x-ratelimit-reset": str(int(time.time()) + _seconds_until_midnight()),
    }
