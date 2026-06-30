"""
Request/response logging middleware.

Emits one JSON log line per request with:
  method, path, status, duration_ms
"""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from logging_config import get_logger

logger = get_logger("http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)

        level = "warning" if response.status_code >= 400 else "info"
        log = getattr(logger, level)
        log(
            "request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )

        return response
