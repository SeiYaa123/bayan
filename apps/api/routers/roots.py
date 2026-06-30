from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db
from services.morphology import analyze_token, get_root_info, list_common_roots

router = APIRouter(prefix="/roots", tags=["roots"])


class RootResponse(BaseModel):
    root: str
    meaning_fr: str
    meaning_en: str
    forms: list[str]
    quran_count: int
    source: str


class TokenResponse(BaseModel):
    token: str
    root: str | None
    possible_roots: list[str]
    analysis: RootResponse | None


@router.get("/analyze")
async def analyze(token: str = Query(..., min_length=1)) -> TokenResponse:
    """Analyse morphologique d'un token arabe — retourne la racine et ses dérivés."""
    result = analyze_token(token)
    return TokenResponse(
        token=result.token,
        root=result.root,
        possible_roots=result.possible_roots,
        analysis=RootResponse(**result.analysis.__dict__) if result.analysis else None,
    )


@router.get("/common")
async def common_roots():
    """Liste les racines coraniques les plus fréquentes."""
    roots = list_common_roots()
    return {"roots": [r.__dict__ for r in roots]}


@router.get("/{root}")
async def get_root(root: str, db: AsyncSession = Depends(get_db)):
    """Retourne tous les textes du corpus contenant une forme de cette racine."""
    info = get_root_info(root)
    if not info:
        raise HTTPException(status_code=404, detail=f"Racine '{root}' non trouvée dans le lexique")

    # Recherche de toutes les formes de la racine dans le corpus
    forms_pattern = "|".join(info.forms + [root])
    sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            t.translation_en,
            s.type  AS source_type,
            s.collection,
            t.metadata
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE t.arabic ~ :pattern
        ORDER BY s.type, t.reference
        LIMIT 100
    """)

    result = await db.execute(sql, {"pattern": forms_pattern})
    rows = result.fetchall()

    return {
        "root": root,
        "info": info.__dict__,
        "occurrences": len(rows),
        "texts": [dict(r._mapping) for r in rows],
    }
