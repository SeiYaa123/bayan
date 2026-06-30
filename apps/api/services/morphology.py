"""
Service de morphologie arabe.

Stratégie en deux niveaux :
  1. CAMeL Tools (NYU Abu Dhabi) si disponible — analyseur morphologique complet.
  2. Fallback : table statique des 500 racines les plus fréquentes du corpus coranique.

La racine arabe est trilitère (3 consonnes) : ك-ت-ب génère
كَتَبَ، كِتَابٌ، كَاتِبٌ، مَكْتُوبٌ، etc.
"""

from functools import lru_cache
from dataclasses import dataclass, field

# Racines coraniques fréquentes avec leurs formes dérivées courantes
# Source : Al-Muʿjam al-Mufahras li-alfāẓ al-Qurʾān al-Karīm (Fuʾād ʿAbd al-Bāqī)
COMMON_ROOTS: dict[str, dict] = {
    "رحم": {
        "meaning_fr": "miséricorde, clémence",
        "meaning_en": "mercy, compassion",
        "forms": ["رَحِمَ", "رَحْمَة", "رَحِيم", "رَحْمَن", "مَرْحُوم", "رَحِمَ", "أَرْحَام"],
        "quran_count": 339,
    },
    "علم": {
        "meaning_fr": "connaissance, savoir",
        "meaning_en": "knowledge, learning",
        "forms": ["عَلِمَ", "عِلْم", "عَالِم", "مَعْلُوم", "تَعَلَّمَ", "عَلَّمَ", "يَعْلَمُون"],
        "quran_count": 854,
    },
    "كتب": {
        "meaning_fr": "écriture, prescription",
        "meaning_en": "writing, scripture",
        "forms": ["كَتَبَ", "كِتَاب", "كَاتِب", "مَكْتُوب", "كُتِبَ", "يَكْتُبُون"],
        "quran_count": 319,
    },
    "صلو": {
        "meaning_fr": "prière, bénédiction",
        "meaning_en": "prayer, blessing",
        "forms": ["صَلَاة", "صَلَّى", "يُصَلِّي", "مُصَلِّي", "صَلَوَات"],
        "quran_count": 99,
    },
    "زكو": {
        "meaning_fr": "purification, aumône",
        "meaning_en": "purification, almsgiving",
        "forms": ["زَكَاة", "زَكَّى", "يَزَّكَّى", "مُزَكَّى"],
        "quran_count": 59,
    },
    "جهد": {
        "meaning_fr": "effort, combat dans la voie de Dieu",
        "meaning_en": "striving, effort",
        "forms": ["جِهَاد", "جَاهَدَ", "مُجَاهِد", "يُجَاهِدُون"],
        "quran_count": 41,
    },
    "هدي": {
        "meaning_fr": "guidée, voie droite",
        "meaning_en": "guidance, right path",
        "forms": ["هُدَى", "هَدَى", "هِدَايَة", "مُهْتَدِي", "اهْتَدَى"],
        "quran_count": 316,
    },
    "صبر": {
        "meaning_fr": "patience, endurance",
        "meaning_en": "patience, perseverance",
        "forms": ["صَبَرَ", "صَبْر", "صَابِر", "اصْبِر", "يَصْبِرُون"],
        "quran_count": 103,
    },
    "توب": {
        "meaning_fr": "repentir, retour vers Dieu",
        "meaning_en": "repentance, return",
        "forms": ["تَابَ", "تَوْبَة", "تَوَّاب", "يَتُوبُون"],
        "quran_count": 87,
    },
    "أمن": {
        "meaning_fr": "foi, sécurité, confiance",
        "meaning_en": "faith, security, trust",
        "forms": ["آمَنَ", "إِيمَان", "مُؤْمِن", "أَمَانَة", "أَمِين"],
        "quran_count": 879,
    },
    "حكم": {
        "meaning_fr": "sagesse, jugement, gouvernance",
        "meaning_en": "wisdom, judgment, rule",
        "forms": ["حَكَمَ", "حُكْم", "حَكِيم", "حِكْمَة", "مُحْكَم", "حَكَّام"],
        "quran_count": 210,
    },
    "خلق": {
        "meaning_fr": "création",
        "meaning_en": "creation",
        "forms": ["خَلَقَ", "خَلْق", "خَالِق", "مَخْلُوق", "يَخْلُقُون"],
        "quran_count": 261,
    },
    "نور": {
        "meaning_fr": "lumière",
        "meaning_en": "light",
        "forms": ["نُور", "نَار", "أَنَار", "مُنِير", "اسْتَنَار"],
        "quran_count": 49,
    },
    "حق": {
        "meaning_fr": "vérité, droit, réalité",
        "meaning_en": "truth, right, reality",
        "forms": ["حَقَّ", "حَق", "حَقِيق", "أَحَقّ", "يَحِقّ"],
        "quran_count": 287,
    },
    "ظلم": {
        "meaning_fr": "injustice, oppression, ténèbres",
        "meaning_en": "injustice, oppression, darkness",
        "forms": ["ظَلَمَ", "ظُلْم", "ظَالِم", "مَظْلُوم", "ظُلُمَات"],
        "quran_count": 315,
    },
}


@dataclass
class RootAnalysis:
    root: str
    meaning_fr: str
    meaning_en: str
    forms: list[str]
    quran_count: int
    source: str = "static"


@dataclass
class TokenAnalysis:
    token: str
    root: str | None
    possible_roots: list[str] = field(default_factory=list)
    analysis: RootAnalysis | None = None


def _try_camel_tools(token: str) -> str | None:
    """Tente d'extraire la racine via CAMeL Tools si disponible."""
    try:
        from camel_tools.morphology.database import MorphologyDB
        from camel_tools.morphology.analyzer import Analyzer

        db = MorphologyDB.builtin_db()
        analyzer = Analyzer(db)
        analyses = analyzer.analyze(token)
        if analyses:
            return analyses[0].get("root")
    except ImportError:
        pass
    except Exception:
        pass
    return None


@lru_cache(maxsize=2000)
def analyze_token(token: str) -> TokenAnalysis:
    """Analyse morphologique d'un token arabe."""
    # Nettoyage : retirer la ponctuation coranique (tashkil)
    import re
    clean = re.sub(r"[ؐ-ًؚ-ٟ]", "", token).strip()

    if not clean:
        return TokenAnalysis(token=token, root=None)

    # 1. Essai CAMeL Tools
    root = _try_camel_tools(clean)

    def strip_tashkil(text: str) -> str:
        return re.sub(r"[ؐ-ًؚ-ٟ]", "", text).strip()

    # 2. Fallback : cherche dans la table statique si le token matche une forme connue
    if not root:
        for r, data in COMMON_ROOTS.items():
            stripped_forms = [strip_tashkil(f) for f in data["forms"]]
            if clean in stripped_forms or clean == r:
                root = r
                break

    possible = []
    for r, data in COMMON_ROOTS.items():
        stripped_forms = [strip_tashkil(f) for f in data["forms"]]
        if clean in stripped_forms:
            possible.append(r)

    analysis = None
    if root and root in COMMON_ROOTS:
        d = COMMON_ROOTS[root]
        analysis = RootAnalysis(
            root=root,
            meaning_fr=d["meaning_fr"],
            meaning_en=d["meaning_en"],
            forms=d["forms"],
            quran_count=d["quran_count"],
            source="camel" if _try_camel_tools(clean) else "static",
        )

    return TokenAnalysis(token=token, root=root, possible_roots=possible, analysis=analysis)


def get_root_info(root: str) -> RootAnalysis | None:
    """Retourne les informations sur une racine trilitère."""
    if root in COMMON_ROOTS:
        d = COMMON_ROOTS[root]
        return RootAnalysis(
            root=root,
            meaning_fr=d["meaning_fr"],
            meaning_en=d["meaning_en"],
            forms=d["forms"],
            quran_count=d["quran_count"],
        )
    return None


def list_common_roots() -> list[RootAnalysis]:
    return [
        RootAnalysis(
            root=r,
            meaning_fr=d["meaning_fr"],
            meaning_en=d["meaning_en"],
            forms=d["forms"],
            quran_count=d["quran_count"],
        )
        for r, d in sorted(COMMON_ROOTS.items(), key=lambda x: -x[1]["quran_count"])
    ]
