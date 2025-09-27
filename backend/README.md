# SocialCreditOwlhacks Backend

This folder contains a minimal Flask backend for the SocialCreditOwlhacks2025 project.

Quick start (POSIX shell - macOS / Linux / WSL):

1. Create a virtual environment and activate it:

```sh
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```sh
python -m pip install -r requirements.txt
```

3. Run the server (launcher `app.py` uses the package factory when available):

```sh
python app.py
```

4. Test the health endpoint:

```sh
curl -s http://127.0.0.1:5000/health | jq
```

Notes:

- The server listens on 127.0.0.1:5000 by default.
- `app.py` attempts to use `backend.create_app()` (recommended). If you run `app.py` directly from inside the `backend` folder it will fall back to registering the `main` blueprint so `from app import app` remains valid for tests.
- Historically there was a misnamed initializer referenced in some docs (`__init__.__.py`). I checked the repository and there is no file by that exact name; instead a proper `backend/__init__.py` exists with the application factory. If you find `__init__.__.py` in older copies, delete it and keep `backend/__init__.py`.

If you prefer PowerShell on Windows, the old instructions remain valid in this repository (there is a `run_backend.ps1` helper referenced previously).
