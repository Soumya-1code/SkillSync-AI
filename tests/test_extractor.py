from io import BytesIO

import pymupdf
from docx import Document
import pytest

from src.extractor import extract_resume


def pdf_bytes(text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


def test_extracts_pdf_contact_skills_and_sections():
    text = "Jane Doe\njane@example.com\n+1 212 555 0123\nSkills\nPython, SQL\nEducation\nSample University"
    result = extract_resume("resume.pdf", pdf_bytes(text))
    assert result.name == "Jane Doe"
    assert result.email == "jane@example.com"
    assert result.phone == "+1 212 555 0123"
    assert "Python" in result.skills and "SQL" in result.skills
    assert result.education


def test_extracts_docx_and_rejects_invalid():
    doc = Document()
    doc.add_paragraph("Alex Example\nalex@example.com")
    data = BytesIO()
    doc.save(data)
    assert extract_resume("resume.docx", data.getvalue()).email == "alex@example.com"
    with pytest.raises(ValueError): extract_resume("resume.txt", b"hello")
    with pytest.raises(ValueError): extract_resume("resume.pdf", b"")
