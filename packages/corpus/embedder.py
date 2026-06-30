import os
from sentence_transformers import SentenceTransformer

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-large")
_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"Chargement du modèle {MODEL_NAME}...")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_passages(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    model = get_model()
    model.max_seq_length = 256
    prefixed = [f"passage: {t}" for t in texts]
    vectors = model.encode(
        prefixed,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    return vectors.tolist()
