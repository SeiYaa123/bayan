from routers.isnad import compute_overall_grade, NarratorNode, RELIABILITY_RANK


def make_narrator(reliability: str, position: int = 0) -> NarratorNode:
    return NarratorNode(
        id="00000000-0000-0000-0000-000000000001",
        name_arabic="اسم",
        name_transliterated="Name",
        death_year=700,
        reliability=reliability,
        position=position,
        transmission_type="'an",
    )


def test_all_thiqah_is_sahih():
    chain = [make_narrator("thiqah", i) for i in range(5)]
    grade, weakest = compute_overall_grade(chain)
    assert grade == "sahih"
    assert weakest is not None


def test_one_daif_downgrades_chain():
    chain = [
        make_narrator("thiqah", 0),
        make_narrator("thiqah", 1),
        make_narrator("da_if", 2),
    ]
    grade, weakest = compute_overall_grade(chain)
    assert grade == "da'if"


def test_empty_chain_returns_unknown():
    grade, weakest = compute_overall_grade([])
    assert grade == "unknown"
    assert weakest is None


def test_reliability_rank_order():
    assert RELIABILITY_RANK["thiqah"] > RELIABILITY_RANK["sadouq"]
    assert RELIABILITY_RANK["sadouq"] > RELIABILITY_RANK["da_if"]


def test_chain_with_sadouq_is_hasan():
    chain = [
        make_narrator("thiqah", 0),
        make_narrator("sadouq", 1),
        make_narrator("thiqah", 2),
    ]
    grade, weakest = compute_overall_grade(chain)
    assert grade == "hasan"
    assert weakest == "اسم"


def test_weakest_link_points_to_first_minimum():
    chain = [
        make_narrator("thiqah", 0),
        make_narrator("da_if", 1),
        make_narrator("da_if", 2),
    ]
    _, weakest = compute_overall_grade(chain)
    assert weakest == "اسم"


def test_unknown_reliability_treated_as_daif_inconnu():
    chain = [
        make_narrator("thiqah", 0),
        make_narrator("unknown", 1),
    ]
    grade, _ = compute_overall_grade(chain)
    assert grade == "da'if (inconnu)"


def test_single_thiqah_narrator():
    chain = [make_narrator("thiqah", 0)]
    grade, _ = compute_overall_grade(chain)
    assert grade == "sahih"
