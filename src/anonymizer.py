"""Create an independent masked view without mutating the extracted resume."""
from __future__ import annotations

from copy import deepcopy

from src.extractor import ResumeData


def anonymize(data: ResumeData) -> ResumeData:
    """Mask known identity fields and known institution names in a copy."""
    masked = deepcopy(data)
    masked.name = "[Masked]" if data.name else ""
    masked.email = "[Masked]" if data.email else ""
    masked.phone = "[Masked]" if data.phone else ""
    masked.profile_links = []
    replacements = [(value, replacement) for value, replacement in [
        (data.name, "[Name masked]"), (data.email, "[Email masked]"),
        (data.phone, "[Phone masked]"), *[(link, "[Profile link masked]") for link in data.profile_links],
        *[(school, "[Institution masked]") for school in data.institutions],
    ] if value]
    for original, replacement in replacements:
        masked.text = masked.text.replace(original, replacement)
        for entry in [*masked.education, *masked.projects, *masked.experience]:
            entry.title = entry.title.replace(original, replacement)
            entry.organization = entry.organization.replace(original, replacement)
            entry.dates = entry.dates.replace(original, replacement)
            entry.description = entry.description.replace(original, replacement)
        masked.certifications = [cert.replace(original, replacement) for cert in masked.certifications]
    masked.institutions = ["[Institution masked]" for _ in data.institutions]
    return masked
