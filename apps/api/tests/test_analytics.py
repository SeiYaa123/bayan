"""Tests pour services/analytics.py."""

import pytest
from tests.conftest import FakeRedis
from services.analytics import record_search, get_top_searches, get_type_breakdown


@pytest.fixture
def redis():
    r = FakeRedis()
    yield r
    r.flush()


@pytest.mark.asyncio
async def test_record_search_increments_query_score(redis):
    await record_search(redis, "رحمة", [])
    await record_search(redis, "رحمة", [])
    top = await get_top_searches(redis, n=5)
    assert top[0]["query"] == "رحمة"
    assert top[0]["count"] == 2


@pytest.mark.asyncio
async def test_record_search_ranks_by_frequency(redis):
    await record_search(redis, "صبر", [])
    await record_search(redis, "رحمة", [])
    await record_search(redis, "رحمة", [])
    top = await get_top_searches(redis, n=2)
    assert top[0]["query"] == "رحمة"
    assert top[1]["query"] == "صبر"


@pytest.mark.asyncio
async def test_record_search_type_breakdown_with_types(redis):
    await record_search(redis, "صلاة", ["quran", "hadith"])
    breakdown = await get_type_breakdown(redis)
    assert breakdown["quran"] == 1
    assert breakdown["hadith"] == 1


@pytest.mark.asyncio
async def test_record_search_type_breakdown_no_types_uses_all(redis):
    await record_search(redis, "زكاة", [])
    breakdown = await get_type_breakdown(redis)
    assert breakdown.get("all", 0) == 1


@pytest.mark.asyncio
async def test_get_top_searches_respects_n_limit(redis):
    for i in range(15):
        await record_search(redis, f"query_{i}", [])
    top = await get_top_searches(redis, n=5)
    assert len(top) == 5


@pytest.mark.asyncio
async def test_get_top_searches_empty_store(redis):
    top = await get_top_searches(redis)
    assert top == []


@pytest.mark.asyncio
async def test_get_type_breakdown_empty_store(redis):
    breakdown = await get_type_breakdown(redis)
    assert breakdown == {}


@pytest.mark.asyncio
async def test_type_breakdown_accumulates_across_searches(redis):
    await record_search(redis, "نور", ["quran"])
    await record_search(redis, "هدى", ["quran"])
    breakdown = await get_type_breakdown(redis)
    assert breakdown["quran"] == 2
