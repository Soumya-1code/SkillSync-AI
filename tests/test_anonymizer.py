from src.anonymizer import anonymize
from src.extractor import ResumeData
from src.section_parser import Entry


def test_masks_identity_and_institution_without_mutating_source():
    source = ResumeData(name="Jane Doe", email="jane@example.com", phone="555-123-4567",
                        profile_links=["https://example.com/jane"], institutions=["Sample University"],
                        education=[Entry(title="BSc, Sample University")],
                        experience=[Entry(title="Volunteer", organization="Sample University")],
                        text="Jane Doe jane@example.com 555-123-4567 Sample University")
    masked = anonymize(source)
    assert "Jane Doe" not in masked.text and "jane@example.com" not in masked.text
    assert "555-123-4567" not in masked.text and "Sample University" not in masked.text
    assert "Sample University" not in masked.experience[0].organization
    assert "Jane Doe" in source.text and "Sample University" in source.education[0].title
