"""Tests unitaires pour la logique RRF — sans base de données."""

import pytest
from services.search import hybrid_search, RRF_K


def rrf_score(rank: int) -> float:
    return 1.0 / (RRF_K + rank)


def test_rrf_formula():
    """Un document au rang 1 a toujours un meilleur score que rang 2."""
    assert rrf_score(1) > rrf_score(2)
    assert rrf_score(10) > rrf_score(100)


def test_hybrid_beats_single_leg():
    """Un document présent dans les deux legs a un score > document dans un seul leg."""
    score_hybrid = rrf_score(1) + rrf_score(1)  # présent dans les deux au rang 1
    score_semantic_only = rrf_score(1)           # présent uniquement en sémantique
    assert score_hybrid > score_semantic_only


def test_rrf_k_constant():
    assert RRF_K == 60
