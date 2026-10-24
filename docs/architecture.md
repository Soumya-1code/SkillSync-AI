# Architecture

The React application talks to FastAPI using typed JSON and multipart requests. Authenticated requests carry an expiring bearer token. The API accepts uploaded files in memory and invokes the existing Python analysis functions directly.

- `frontend/src/pages/` contains the public landing, login/signup, and authenticated feature pages.
- `frontend/src/components/` contains the reusable logo, application shell, upload control, result views, and status UI.
- `frontend/src/services/api.ts` defines the frontend API URL and typed request functions.
- `frontend/src/hooks/useAuth.tsx` manages the local auth session; `useResume.tsx` keeps the selected `File` and profile in browser-tab memory.
- `backend/main.py` owns the FastAPI routes, SQLite accounts, PBKDF2 password hashes, HMAC bearer tokens, CORS, and upload limits.
- `src/extractor.py`, `src/skill_matcher.py`, `src/integrity_checker.py`, and `src/anonymizer.py` remain the source of analysis behavior.
- `app.py` remains a separate, working Streamlit entry point.

Auth tokens use a process-random signing secret when `SKILLSYNC_SECRET_KEY` is unset, so API restart invalidates current sessions. Set a private key in the untracked root `.env` file for stable local sessions. The SQLite database contains account email and password hashes only. Resume data is not saved as application data; FastAPI's multipart parser can use short-lived temporary storage for larger uploads, which is cleaned up after request handling.
