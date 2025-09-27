# SocialCreditOwlhacks Backend

This folder contains a minimal Flask backend for the SocialCreditOwlhacks2025 project.

Quick start (Windows PowerShell):

1. Create a virtual environment and activate it:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

3. Run the server:

```powershell
python app.py
```

4. Test the health endpoint:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:5000/health
```

Notes:

- The server listens on 127.0.0.1:5000 by default.
- If you prefer, use the included `run_backend.ps1` helper which creates a venv (if missing), activates it, installs deps, and starts the server.
