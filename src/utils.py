"""Shared constants and presentation helpers."""
from __future__ import annotations

SKILL_TERMS = [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "R", "Go", "Rust", "HTML", "CSS",
    "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI", "Streamlit", "Pandas", "NumPy",
    "scikit-learn", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "Data Analysis", "Data Visualization",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux", "Excel", "Power BI", "Tableau",
    "Communication", "Leadership", "Project Management", "Agile", "Figma", "REST API", "PostgreSQL", "MongoDB",
]


def format_bytes(value: int) -> str:
    """Format byte length in readable units."""
    return f"{value / 1024:.1f} KB" if value < 1024 * 1024 else f"{value / (1024 * 1024):.1f} MB"
