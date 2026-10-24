from src.section_parser import parse_entries


def test_groups_bullet_descriptions_with_their_project_title():
    entries = parse_entries("Campus Resource Dashboard\n• Built a Python dashboard for students")
    assert len(entries) == 1
    assert entries[0].title == "Campus Resource Dashboard"
    assert "Python dashboard" in entries[0].description
