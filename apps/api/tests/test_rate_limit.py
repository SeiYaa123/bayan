import pytest
from middleware.rate_limit import _seconds_until_midnight, FREE_DAILY_LIMIT, PREMIUM_DAILY_LIMIT


def test_seconds_until_midnight_positive():
    secs = _seconds_until_midnight()
    assert secs > 0
    assert secs <= 86400


def test_free_limit_lower_than_premium():
    assert FREE_DAILY_LIMIT < PREMIUM_DAILY_LIMIT


def test_free_limit_value():
    assert FREE_DAILY_LIMIT == 20


def test_premium_limit_value():
    assert PREMIUM_DAILY_LIMIT == 500
