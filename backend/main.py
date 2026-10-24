"""FastAPI API for SkillSync AI. Resume files are handled in memory only."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import sys
import time
from dataclasses import asdict
from pathlib import Path
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field


# Make the project root available so Python can find the root-level src folder.
# Add the repository root so backend imports can find the root-level src package.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.anonymizer import anonymize
from src.extractor import ResumeData, extract_resume
from src.integrity_checker import inspect_pdf
from src.skill_matcher import match_job


load_dotenv(ROOT / ".env")

DB_PATH = Path(
    os.getenv(
        "SKILLSYNC_DB_PATH",
        str(ROOT / "backend" / "data" / "skillsync.sqlite3"),
    )
)

if not DB_PATH.is_absolute():
    DB_PATH = ROOT / DB_PATH

DB_PATH.parent.mkdir(parents=True, exist_ok=True)

TOKEN_SECRET = os.getenv("SKILLSYNC_SECRET_KEY") or secrets.token_urlsafe(48)
TOKEN_TTL_SECONDS = 60 * 60 * 12
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
PBKDF2_ROUNDS = 310_000

DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
)



def cors_origins(configured: str | None = None) -> list[str]:
    """Allow local development and the deployed SkillSync frontend."""
    import os

    origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://skill-sync-ai-frontend-lemon.vercel.app",
    }

    extra = configured or os.getenv("SKILLSYNC_CORS_ORIGINS", "")

    for origin in extra.split(","):
        origin = origin.strip().rstrip("/")
        if origin:
            origins.add(origin)

    return sorted(origins)



origins = cors_origins()

app = FastAPI(
    title="SkillSync AI API",
    version="1.0.0",
    description="Resume analysis API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://skill-?sync-ai-frontend[a-z0-9-]*-sharmasoumya4211-6485s-projects\.vercel\.app$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

bearer = HTTPBearer(auto_error=False)


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class UserView(BaseModel):
    id: int
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserView


class MatchResponse(BaseModel):
    requirements: list[str]
    matched: list[str]
    missing: list[str]
    score: int
    evidence: dict[str, str]


class IntegrityFinding(BaseModel):
    page: int
    reason: str
    snippet: str


class IntegrityResponse(BaseModel):
    keyword_counts: dict[str, int]
    findings: list[IntegrityFinding]


def connect_db() -> sqlite3.Connection:
    """Create a connection to the SQLite database."""
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Create the users table if it does not already exist."""
    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
            """
        )


initialize_database()


def hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    """Create a salted password hash without storing the plaintext password."""
    salt = salt or secrets.token_bytes(16)

    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ROUNDS,
    )

    return derived.hex(), salt.hex()


def verify_password(
    password: str,
    expected_hash: str,
    salt_hex: str,
) -> bool:
    """Verify a password against its stored hash."""
    actual, _ = hash_password(password, bytes.fromhex(salt_hex))
    return hmac.compare_digest(actual, expected_hash)


def _b64(data: bytes) -> str:
    """Encode bytes as URL-safe Base64 without trailing padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def create_token(user_id: int) -> str:
    """Create a signed, time-limited authentication token."""
    payload = _b64(
        json.dumps(
            {
                "sub": user_id,
                "exp": int(time.time()) + TOKEN_TTL_SECONDS,
            },
            separators=(",", ":"),
        ).encode("utf-8")
    )

    signature = _b64(
        hmac.new(
            TOKEN_SECRET.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).digest()
    )

    return f"{payload}.{signature}"


def parse_token(token: str) -> int:
    """Validate an authentication token and return its user ID."""
    try:
        payload_part, signature = token.split(".", 1)

        expected = _b64(
            hmac.new(
                TOKEN_SECRET.encode("utf-8"),
                payload_part.encode("utf-8"),
                hashlib.sha256,
            ).digest()
        )

        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")

        payload_bytes = base64.urlsafe_b64decode(
            payload_part + "=" * (-len(payload_part) % 4)
        )

        payload = json.loads(payload_bytes)
        user_id = int(payload["sub"])

        if int(payload["exp"]) < int(time.time()):
            raise ValueError("Token expired")

        return user_id

    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or expired. Please sign in again.",
        ) from exc


def current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer),
    ],
) -> UserView:
    """Return the authenticated user or reject the request."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Sign in to continue.",
        )

    user_id = parse_token(credentials.credentials)

    with connect_db() as connection:
        row = connection.execute(
            "SELECT id, email FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=401,
            detail="This account is no longer available. Please sign in again.",
        )

    return UserView(id=row["id"], email=row["email"])


def auth_response(row: sqlite3.Row) -> AuthResponse:
    """Build the response returned after successful authentication."""
    user = UserView(id=row["id"], email=row["email"])

    return AuthResponse(
        access_token=create_token(user.id),
        user=user,
    )


def resume_payload(data: ResumeData) -> dict[str, Any]:
    """Convert resume dataclasses into JSON-safe API values."""
    return {
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "skills": data.skills,
        "education": [asdict(item) for item in data.education],
        "projects": [asdict(item) for item in data.projects],
        "experience": [asdict(item) for item in data.experience],
        "certifications": data.certifications,
        "profile_links": data.profile_links,
        "institutions": data.institutions,
        "text": data.text,
        "warnings": data.warnings,
    }


async def read_resume(file: UploadFile) -> tuple[str, bytes]:
    """Validate an uploaded resume and read it into memory."""
    filename = Path(file.filename or "").name

    if filename.lower().rsplit(".", 1)[-1] not in {"pdf", "docx"}:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF or DOCX resume.",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Resume files must be 15 MB or smaller.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    return filename, content


def safe_extract(filename: str, content: bytes) -> ResumeData:
    """Convert resume parsing errors into readable API responses."""
    try:
        return extract_resume(filename, content)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@app.get("/health")
def health() -> dict[str, str]:
    """Health-check endpoint."""
    return {
        "status": "ok",
        "service": "skillsync-api",
    }


@app.post(
    "/auth/signup",
    response_model=AuthResponse,
    status_code=201,
)
def signup(credentials: Credentials) -> AuthResponse:
    """Register a new user."""
    email = str(credentials.email).lower()
    password_hash, salt = hash_password(credentials.password)

    try:
        with connect_db() as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (
                    email,
                    password_hash,
                    password_salt,
                    created_at
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    email,
                    password_hash,
                    salt,
                    int(time.time()),
                ),
            )

            row = connection.execute(
                "SELECT id, email FROM users WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()

    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        ) from exc

    return auth_response(row)


@app.post("/auth/login", response_model=AuthResponse)
def login(credentials: Credentials) -> AuthResponse:
    """Authenticate an existing user."""
    email = str(credentials.email).lower()

    with connect_db() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if row is None or not verify_password(
        credentials.password,
        row["password_hash"],
        row["password_salt"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Email or password is incorrect.",
        )

    return auth_response(row)


@app.get("/auth/me", response_model=UserView)
def me(
    user: Annotated[UserView, Depends(current_user)],
) -> UserView:
    """Return the currently authenticated user."""
    return user


@app.post("/api/resume/analyze")
async def analyze_resume(
    user: Annotated[UserView, Depends(current_user)],
    file: Annotated[UploadFile, File()],
) -> dict[str, Any]:
    """Extract structured information from a resume."""
    filename, content = await read_resume(file)

    return resume_payload(
        safe_extract(filename, content)
    )


@app.post("/api/resume/bias-blind")
async def bias_blind_resume(
    user: Annotated[UserView, Depends(current_user)],
    file: Annotated[UploadFile, File()],
) -> dict[str, Any]:
    """Return resume data after anonymization."""
    filename, content = await read_resume(file)

    resume = safe_extract(filename, content)

    return resume_payload(
        anonymize(resume)
    )


@app.post("/api/match", response_model=MatchResponse)
async def job_match(
    user: Annotated[UserView, Depends(current_user)],
    file: Annotated[UploadFile, File()],
    job_description: Annotated[
        str,
        Form(min_length=1, max_length=30_000),
    ],
) -> MatchResponse:
    """Compare resume skills with a job description."""
    filename, content = await read_resume(file)
    resume = safe_extract(filename, content)

    result = match_job(resume, job_description)

    return MatchResponse(**asdict(result))


@app.post("/api/integrity", response_model=IntegrityResponse)
async def integrity_check(
    user: Annotated[UserView, Depends(current_user)],
    file: Annotated[UploadFile, File()],
    keywords: Annotated[str, Form(max_length=2_000)] = "",
) -> IntegrityResponse:
    """Inspect a PDF resume for formatting and keyword concerns."""
    filename, content = await read_resume(file)

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail="Formatting inspection is available for PDF resumes.",
        )

    terms = list(
        dict.fromkeys(
            term.strip()
            for term in re.split(r"[,\n]", keywords)
            if term.strip()
        )
    )[:30]

    try:
        result = inspect_pdf(content, terms)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    return IntegrityResponse(
        keyword_counts=result.keyword_counts,
        findings=[
            IntegrityFinding(**asdict(item))
            for item in result.findings
        ],
    )