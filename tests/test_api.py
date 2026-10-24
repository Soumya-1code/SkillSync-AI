import asyncio
from pathlib import Path

import httpx
import pymupdf
import pytest

import backend.main as api_module


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(api_module, "DB_PATH", tmp_path / "test-skillsync.sqlite3")
    api_module.initialize_database()
    return LocalApiClient(api_module.app)


class LocalApiClient:
    """Small synchronous wrapper around the in-process ASGI transport."""
    def __init__(self, app):
        self.app = app

    def request(self, method, url, **kwargs):
        async def send():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app), base_url="http://test") as client:
                return await client.request(method, url, **kwargs)
        return asyncio.run(send())

    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)


def authorized_client(client):
    response = client.post("/auth/signup", json={"email": "demo@example.com", "password": "correct horse battery"})
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_auth_hashes_password_and_protects_analysis(client):
    blocked = client.get("/auth/me")
    assert blocked.status_code == 401
    headers = authorized_client(client)
    profile = client.get("/auth/me", headers=headers)
    assert profile.status_code == 200 and profile.json()["email"] == "demo@example.com"
    valid = client.post("/auth/login", json={"email": "demo@example.com", "password": "correct horse battery"})
    assert valid.status_code == 200 and valid.json()["access_token"]
    wrong = client.post("/auth/login", json={"email": "demo@example.com", "password": "wrong password"})
    assert wrong.status_code == 401
    with api_module.connect_db() as connection:
        stored = connection.execute("SELECT password_hash, password_salt FROM users").fetchone()
    assert stored["password_hash"] != "correct horse battery"
    assert stored["password_hash"] != stored["password_salt"]


@pytest.mark.parametrize("origin", ["http://localhost:5174", "http://127.0.0.1:5174"])
def test_vite_signup_preflight_allows_local_5174_origins(client, origin):
    response = client.request(
        "OPTIONS",
        "/auth/signup",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_additional_cors_configuration_keeps_vite_origins():
    configured = api_module.cors_origins("https://example.test, http://localhost:5174")
    assert "https://example.test" in configured
    assert "http://localhost:5174" in configured
    assert "http://127.0.0.1:5174" in configured


def test_signup_returns_readable_validation_errors(client):
    response = client.post("/auth/signup", json={"email": "not-an-email", "password": "short"})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)


def test_analysis_match_and_bias_blind_use_existing_modules(client):
    headers = authorized_client(client)
    sample = Path("sample_data/synthetic_resume.docx").read_bytes()
    analyzed = client.post("/api/resume/analyze", headers=headers, files={"file": ("resume.docx", sample)})
    assert analyzed.status_code == 200
    assert "Python" in analyzed.json()["skills"]
    matched = client.post("/api/match", headers=headers, files={"file": ("resume.docx", sample)}, data={"job_description": "Python SQL and leadership"})
    assert matched.status_code == 200
    assert "Python" in matched.json()["matched"] and "Leadership" in matched.json()["missing"]
    masked = client.post("/api/resume/bias-blind", headers=headers, files={"file": ("resume.docx", sample)})
    assert masked.status_code == 200
    assert masked.json()["name"] == "[Masked]"
    assert "Jamie Example" not in masked.json()["text"]


def test_integrity_upload_and_file_validation(client):
    headers = authorized_client(client)
    pdf = pymupdf.open()
    page = pdf.new_page()
    page.insert_text((72, 72), "Python " * 9, color=(1, 1, 1))
    content = pdf.tobytes()
    pdf.close()
    checked = client.post("/api/integrity", headers=headers, files={"file": ("resume.pdf", content)}, data={"keywords": "Python"})
    assert checked.status_code == 200
    assert checked.json()["keyword_counts"]["Python"] == 9
    assert checked.json()["findings"]
    rejected = client.post("/api/integrity", headers=headers, files={"file": ("resume.docx", b"not a pdf")})
    assert rejected.status_code == 415
    bad_extension = client.post("/api/resume/analyze", headers=headers, files={"file": ("resume.txt", b"hello")})
    assert bad_extension.status_code == 415
