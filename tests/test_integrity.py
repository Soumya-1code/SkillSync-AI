import pymupdf

from src.integrity_checker import inspect_pdf


def test_counts_terms_and_flags_light_text():
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Python " * 9, color=(1, 1, 1))
    data = doc.tobytes()
    doc.close()
    result = inspect_pdf(data, ["Python"])
    assert result.keyword_counts["Python"] == 9
    assert any("color" in item.reason for item in result.findings)
    assert any("9 times" in item.reason for item in result.findings)
