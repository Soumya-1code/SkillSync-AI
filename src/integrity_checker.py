"""PDF text and formatting signal inspection; findings are not fraud verdicts."""
from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass

import pymupdf


@dataclass
class Finding:
    page: int
    reason: str
    snippet: str


@dataclass
class IntegrityResult:
    keyword_counts: dict[str, int]
    findings: list[Finding]


def inspect_pdf(data: bytes, keywords: list[str] | None = None) -> IntegrityResult:
    """Inspect PDF text spans and count supplied terms, returning potentially suspicious signals."""
    if not data:
        raise ValueError("The uploaded PDF is empty.")
    try:
        doc = pymupdf.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("This PDF could not be opened for inspection.") from exc
    counts: Counter[str] = Counter()
    findings: list[Finding] = []
    for page_index, page in enumerate(doc, start=1):
        page_text = page.get_text("text")
        for term in keywords or []:
            if term.strip(): counts[term.strip()] += len(re.findall(re.escape(term.strip()), page_text, re.I))
        for block in page.get_text("dict").get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    content = span.get("text", "").strip()
                    if not content: continue
                    color = span.get("color", 0)
                    if color >= 0xF0F0F0:
                        findings.append(Finding(page_index, "Text uses a white or near-white font color and may be difficult to see on a white page. This can also have benign formatting causes.", content[:180]))
                    size = span.get("size", 0)
                    if 0 < size < 4:
                        findings.append(Finding(page_index, f"Text uses a very small font size ({size:.1f} pt), which may reduce readability and merits a visual check.", content[:180]))
                    x0, y0, x1, y1 = span.get("bbox", (0, 0, 0, 0))
                    bounds = page.rect
                    if x1 < 0 or y1 < 0 or x0 > bounds.width or y0 > bounds.height:
                        findings.append(Finding(page_index, "Text is positioned outside the visible page bounds and may not appear in a normal reading view.", content[:180]))
        for term in keywords or []:
            n = len(re.findall(re.escape(term.strip()), page_text, re.I)) if term.strip() else 0
            if n >= 8:
                excerpt = next((line.strip() for line in page_text.splitlines() if re.search(re.escape(term.strip()), line, re.I)), term)
                findings.append(Finding(page_index, f"The keyword “{term}” appears {n} times on this page, an unusually high count that merits context review.", excerpt[:180]))
    doc.close()
    return IntegrityResult(keyword_counts=dict(counts), findings=findings)
