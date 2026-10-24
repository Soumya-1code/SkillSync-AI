"""Explainable, deterministic skill comparison."""
from __future__ import annotations

import re
from dataclasses import dataclass

from src.extractor import ResumeData
from src.utils import SKILL_TERMS


@dataclass
class MatchResult:
    requirements: list[str]
    matched: list[str]
    missing: list[str]
    score: int
    evidence: dict[str, str]


def _contains(text: str, term: str) -> bool:
    return bool(re.search(r"(?<!\w)" + re.escape(term) + r"(?!\w)", text, re.I))


def match_job(resume: ResumeData, description: str) -> MatchResult:
    """Match known skill vocabulary and attach literal resume snippets as evidence."""
    requirements = [skill for skill in SKILL_TERMS if _contains(description, skill)]
    resume_set = {skill.casefold() for skill in resume.skills}
    matched = [skill for skill in requirements if skill.casefold() in resume_set or _contains(resume.text, skill)]
    missing = [skill for skill in requirements if skill not in matched]
    evidence: dict[str, str] = {}
    for skill in matched:
        evidence[skill] = next((line.strip() for line in resume.text.splitlines() if _contains(line, skill)), "Listed in extracted resume skills")
    score = round(100 * len(matched) / len(requirements)) if requirements else 0
    return MatchResult(requirements=requirements, matched=matched, missing=missing, score=score, evidence=evidence)
