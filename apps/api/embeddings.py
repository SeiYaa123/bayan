from sentence_transformers import SentenceTransformer
from config import settings
import numpy as np

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed(texts: list[str]) -> list[list[float]]:
    """Génère des embeddings pour une liste de textes.

    Préfixe 'query:' pour les requêtes, 'passage:' pour le corpus
    (convention multilingual-e5).
    """
    model = get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return vectors.tolist()


def embed_query(query: str) -> list[float]:
    return embed([f"query: {query}"])[0]


def embed_passage(text: str) -> list[float]:
    return embed([f"passage: {text}"])[0]
