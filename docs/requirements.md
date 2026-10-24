# Requirements

Recommended: Python 3.11 or 3.12 and Node.js 20.19 or newer. The existing environment was verified with Python 3.14 and Node.js 24.

The React website dependencies are declared in `frontend/package.json` and installed with `npm install`. Python packages are declared in the root `requirements.txt`; `backend/requirements.txt` lists the API and analysis dependencies without Streamlit.

The app uses React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, and Lucide icons in the browser; FastAPI, Pydantic, and SQLite in the API; and the preserved PyMuPDF/python-docx analysis modules. Accounts use Python's standard-library PBKDF2 and HMAC implementations. No paid API, cloud service, or external analysis API is needed. A network connection is required only for first-time dependency installation.
