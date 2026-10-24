"""Small, explainable section and field parser for resume text."""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class Entry:
    title: str
    organization: str = ""
    dates: str = ""
    description: str = ""


HEADERS = {
    "education": ("education", "academic background", "academics"),
    "projects": ("projects", "project experience", "selected projects"),
    "experience": ("experience", "work experience", "employment", "professional experience"),
    "certifications": ("certifications", "certificates", "licenses"),
    "skills": ("skills", "technical skills", "core competencies", "technologies"),
}


def split_sections(text: str) -> dict[str, str]:
    """Split text at common resume headings, retaining unclassified text as summary."""
    sections: dict[str, list[str]] = {"summary": []}
    active = "summary"
    lookup = {alias: key for key, aliases in HEADERS.items() for alias in aliases}
    for raw in text.splitlines():
        line = raw.strip().strip("|•·- ")
        norm = re.sub(r"[^a-z ]", "", line.lower()).strip()
        norm = re.sub(r"\s+", " ", norm)
        heading = lookup.get(norm)
        if heading:
            active = heading
            sections.setdefault(active, [])
        elif line:
            sections.setdefault(active, []).append(raw.strip())
    return {key: "\n".join(lines).strip() for key, lines in sections.items()}


def parse_entries(section: str) -> list[Entry]:
    """Turn section lines into conservative entries, grouping wrapped descriptions."""
    entries: list[Entry] = []
    action_starters = {"built", "developed", "created", "led", "designed", "implemented", "managed", "analyzed",
                       "analysed", "delivered", "collaborated", "maintained", "improved", "researched", "deployed",
                       "wrote", "supported", "prepared", "automated", "worked", "responsible"}
    for raw in section.splitlines():
        raw = raw.strip()
        is_bullet = raw.startswith(("•", "*", "-"))
        line = raw.lstrip("•*- ").strip()
        if not line:
            continue
        first_word = line.split(maxsplit=1)[0].strip(".,:").casefold()
        if not entries or (not is_bullet and len(line) < 100 and line[0].isupper() and first_word not in action_starters):
            entries.append(Entry(title=line))
        else:
            entries[-1].description = (entries[-1].description + " " + line).strip()
    return entries
