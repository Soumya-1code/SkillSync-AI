from pathlib import Path

from streamlit.testing.v1 import AppTest


def test_app_renders_without_streamlit_exceptions():
    app = AppTest.from_file(Path(__file__).resolve().parents[1] / "app.py").run(timeout=30)
    assert not app.exception
    assert [option for option in app.radio[0].options] == [
        "Overview", "Resume analysis", "Job alignment", "Integrity review"
    ]
    for page in ("Resume analysis", "Job alignment", "Integrity review"):
        app.radio[0].set_value(page).run(timeout=30)
        assert not app.exception
