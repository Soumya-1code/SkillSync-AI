from src.extractor import ResumeData
from src.skill_matcher import match_job


def test_explainable_match_score_and_evidence():
    resume = ResumeData(skills=["Python"], text="Built a Python data pipeline")
    result = match_job(resume, "Need Python and SQL")
    assert result.requirements == ["Python", "SQL"]
    assert result.matched == ["Python"] and result.missing == ["SQL"]
    assert result.score == 50 and "pipeline" in result.evidence["Python"]


def test_no_identifiable_requirement_has_no_score():
    assert match_job(ResumeData(), "Join our growing team").requirements == []
