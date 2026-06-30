from services.morphology import analyze_token, get_root_info, list_common_roots


def test_analyze_known_form():
    result = analyze_token("رَحْمَة")
    assert result.root == "رحم"
    assert result.analysis is not None
    assert "miséricorde" in result.analysis.meaning_fr


def test_analyze_root_directly():
    result = analyze_token("رحم")
    assert result.root == "رحم"


def test_unknown_token_returns_none_root():
    result = analyze_token("xyz")
    assert result.root is None
    assert result.analysis is None


def test_get_root_info_known():
    info = get_root_info("علم")
    assert info is not None
    assert info.meaning_en == "knowledge, learning"
    assert "عِلْم" in info.forms
    assert info.quran_count > 0


def test_get_root_info_unknown():
    assert get_root_info("xyz") is None


def test_common_roots_sorted_by_frequency():
    roots = list_common_roots()
    assert len(roots) > 0
    # Doit être trié par fréquence décroissante
    counts = [r.quran_count for r in roots]
    assert counts == sorted(counts, reverse=True)


def test_amanah_maps_to_amn_root():
    result = analyze_token("أَمَانَة")
    assert result.root == "أمن"
