from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from redis.asyncio import Redis
from config import settings
from logging_config import configure_logging, get_logger
from middleware.request_logging import RequestLoggingMiddleware
from routers import search, texts, roots, fiqh, isnad, semantic_evolution, admin, corpus

configure_logging(level=settings.log_level)
logger = get_logger("startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.validate_production()

    app.state.redis = Redis.from_url(settings.redis_url, decode_responses=True)

    from embeddings import get_model
    get_model()
    logger.info("startup_complete", version="0.2.0")

    yield

    await app.state.redis.aclose()
    logger.info("shutdown")


app = FastAPI(
    title="Bayān API",
    description="Moteur de recherche sémantique sur le corpus islamique",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router,             prefix="/api")
app.include_router(texts.router,              prefix="/api")
app.include_router(roots.router,              prefix="/api")
app.include_router(fiqh.router,               prefix="/api")
app.include_router(isnad.router,              prefix="/api")
app.include_router(semantic_evolution.router, prefix="/api")
app.include_router(admin.router,              prefix="/api")
app.include_router(corpus.router,            prefix="/api")


@app.get("/health")
async def health():
    redis_ok = False
    try:
        await app.state.redis.ping()
        redis_ok = True
    except Exception:
        pass
    return {
        "status": "ok",
        "service": "bayan-api",
        "version": "0.2.0",
        "redis": redis_ok,
    }
