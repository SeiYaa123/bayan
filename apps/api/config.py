import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://akashic:akashic@localhost:5432/akashic_db"
    redis_url: str = "redis://localhost:6379"
    embedding_model: str = "intfloat/multilingual-e5-large"
    embedding_dim: int = 1024
    # Origines CORS autorisées (séparées par des virgules en production)
    allowed_origins: str = "http://localhost:3000"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    def validate_production(self) -> None:
        """Vérifie que les variables critiques sont présentes au démarrage."""
        critical = {
            "DATABASE_URL": self.database_url,
            "REDIS_URL": self.redis_url,
        }
        missing = [k for k, v in critical.items() if not v]
        if missing:
            raise RuntimeError(f"Variables d'environnement manquantes : {', '.join(missing)}")


settings = Settings()
