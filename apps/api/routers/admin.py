"""
Endpoint d'administration — métriques d'usage.

Protégé par le header X-Admin-Key (valeur = ADMIN_SECRET_KEY env var).
Accessible uniquement en interne ; ne pas exposer publiquement.
"""

import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel

from database import get_db
from services.analytics import get_top_searches, get_type_breakdown

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_SECRET = os.getenv("ADMIN_SECRET_KEY", "")


def _require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    if not ADMIN_SECRET or x_admin_key != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")


class PlanBreakdown(BaseModel):
    free: int
    premium: int
    api: int
    total: int


class TopSearch(BaseModel):
    query: str
    count: int


class StatsResponse(BaseModel):
    users: PlanBreakdown
    searches_today: int
    top_searches: list[TopSearch]
    type_breakdown: dict[str, int]
    generated_at: datetime


@router.get("/stats", response_model=StatsResponse, dependencies=[Depends(_require_admin)])
async def get_stats(request: Request, db: AsyncSession = Depends(get_db)):
    redis = request.app.state.redis

    rows = await db.execute(
        text("SELECT plan, COUNT(*) AS cnt FROM users GROUP BY plan")
    )
    plan_counts: dict[str, int] = {r.plan: r.cnt for r in rows.fetchall()}

    today_result = await db.execute(
        text("""
            SELECT COALESCE(SUM(queries_today), 0) AS total
            FROM users
            WHERE DATE(queries_reset_at) = CURRENT_DATE
        """)
    )
    searches_today = int(today_result.scalar_one() or 0)
    total = sum(plan_counts.values())

    top = await get_top_searches(redis, n=10)
    breakdown = await get_type_breakdown(redis)

    return StatsResponse(
        users=PlanBreakdown(
            free=plan_counts.get("free", 0),
            premium=plan_counts.get("premium", 0),
            api=plan_counts.get("api", 0),
            total=total,
        ),
        searches_today=searches_today,
        top_searches=[TopSearch(**t) for t in top],
        type_breakdown=breakdown,
        generated_at=datetime.now(timezone.utc),
    )


@router.get("/users", dependencies=[Depends(_require_admin)])
async def list_users(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("""
            SELECT id, email, plan, queries_today, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """),
        {"limit": limit, "offset": offset},
    )
    users = [dict(r._mapping) for r in result.fetchall()]

    count_result = await db.execute(text("SELECT COUNT(*) FROM users"))
    total = count_result.scalar_one()

    return {"users": users, "total": total, "limit": limit, "offset": offset}
