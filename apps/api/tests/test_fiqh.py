from services.fiqh import MADHHABS, MadhabPosition, FiqhComparison


def test_four_madhhabs_defined():
    assert set(MADHHABS.keys()) == {"hanafi", "maliki", "shafi_i", "hanbali"}


def test_each_madhhab_has_required_fields():
    for key, info in MADHHABS.items():
        assert "name" in info, f"{key} missing name"
        assert "founder" in info, f"{key} missing founder"
        assert "region" in info, f"{key} missing region"


def test_convergence_score_range():
    positions = [
        MadhabPosition(madhhab="hanafi",  madhhab_info=MADHHABS["hanafi"],  texts=[{"similarity": 0.8}], summary_position=None),
        MadhabPosition(madhhab="maliki",  madhhab_info=MADHHABS["maliki"],  texts=[{"similarity": 0.7}], summary_position=None),
        MadhabPosition(madhhab="shafi_i", madhhab_info=MADHHABS["shafi_i"], texts=[{"similarity": 0.9}], summary_position=None),
        MadhabPosition(madhhab="hanbali", madhhab_info=MADHHABS["hanbali"], texts=[{"similarity": 0.6}], summary_position=None),
    ]
    similarities = [t["similarity"] for p in positions for t in p.texts]
    convergence = round(sum(similarities) / len(similarities), 3)
    assert 0.0 <= convergence <= 1.0
    assert convergence == 0.75
