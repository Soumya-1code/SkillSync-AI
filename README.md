# SkillSync AI

**Understand skills. Reveal potential.**

SkillSync AI is a local-first resume analysis project. The workspace now includes a React + TypeScript website and FastAPI backend, while preserving the original Streamlit app and its Python analysis modules.

## Project layout

- `frontend/` — React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, and Lucide icons.
- `backend/main.py` — FastAPI routes, local account authentication, SQLite storage, CORS, and in-memory upload handling.
- `src/` — the original reusable resume extraction, matching, PDF integrity, and anonymization code.
- `app.py` — the preserved Streamlit interface.
- `tests/` — Python unit and API integration tests.

## Run the React website on Windows

Open the workspace root in VS Code and create two integrated terminals.

### 1. Install Python packages (once)

Python 3.11 or 3.12 is recommended. From the workspace root:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If `.venv` already exists, skip the first command. Copy `.env.example` to `.env` if you want to configure a persistent signing key, database path, or allowed development origins. With no signing key configured, the API generates one at startup; users remain in SQLite, but active tokens become invalid when the API restarts.

### 2. Start the API (terminal 1, workspace root)

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

The API health check is at `http://127.0.0.1:8001/health`; interactive API docs are at `http://127.0.0.1:8001/docs`.

### 3. Install and start the website (terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`). The API address can be changed in `frontend/.env` using the variable shown in `frontend/.env.example`.

If npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE` in a managed Windows environment, retry with Node's system certificate store (TLS verification stays enabled):

```powershell
$env:NODE_OPTIONS = "--use-system-ca"
npm install
Remove-Item Env:NODE_OPTIONS
```

### 4. Verify changes

From the workspace root:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

From `frontend/`:

```powershell
npm run build
```

## Authentication and privacy

Sign-up creates a local SQLite account. Passwords are stored as salted PBKDF2 hashes; plaintext passwords are never stored. The API issues signed bearer tokens that expire after 12 hours. The browser holds the token in session storage. This is a local project demo, not a production identity service: it does not provide email verification, password recovery, HTTPS configuration, account recovery, rate limiting, or deployment-grade key management.

Uploaded resumes are held in browser memory and submitted to the API for each feature request. The backend enforces a 15 MB limit and does not save resume content or log request bodies. The multipart framework may spool larger uploads to short-lived temporary storage while a request is being handled; it is not retained as application data. Account records persist in `backend/data/skillsync.sqlite3` (ignored by Git). No paid AI API, external analysis service, or cloud account is used.

## Feature notes and limitations

- **Resume analyzer:** extracts PDF selectable text and DOCX text with a conservative parser. Scanned PDFs need OCR, which is not included; section layouts can be missed.
- **Job matcher:** compares a finite list of skill terms and shows literal resume lines as evidence. The alignment percentage is not a hiring prediction and does not understand every synonym or context.
- **Integrity review:** counts user-selected terms and flags repeated terms, light-colored spans, tiny text, or off-page text in PDFs. These are potentially suspicious signals, never proof. PDF checks can miss cases; DOCX formatting inspection is not implemented.
- **Bias-blind review:** masks detected name, contact fields, links, and confidently detected institution names in a separate API response. It cannot remove every identity clue and does not extract embedded profile photos.
- **Recent activity:** intentionally shows an empty state. Analysis history is not recorded.

## Preserved Streamlit app

The existing interface remains available from the workspace root:

```powershell
.\.venv\Scripts\python.exe -m streamlit run app.py
```

## Synthetic sample

`sample_data/synthetic_resume.docx` is fictional and intended for local demonstrations. Its email uses the reserved `.invalid` domain.
