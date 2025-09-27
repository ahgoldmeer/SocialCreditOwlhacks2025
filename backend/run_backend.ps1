# Helper script: creates venv if missing, installs deps, and runs the app
$venv = "./.venv"
if (-not (Test-Path $venv)) {
    python -m venv $venv
}
# Activate
& "$venv/Scripts/Activate.ps1"
# Install requirements (idempotent)
python -m pip install -r requirements.txt
# Run app
python app.py
