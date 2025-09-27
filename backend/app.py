"""Launcher module that exposes an `app` variable.

This file tries to construct the Flask application using the factory
`create_app()` (recommended). If the package-style import fails (for
example when this file is executed/imported directly from the `backend`
directory during tests), it falls back to creating a Flask instance and
registering the `main` blueprint so behaviour remains identical.
"""
from flask import Flask
from flask_cors import CORS

try:
    # Preferred: import the factory from the package when running from the
    # project root (importable as `backend`). This produces `app = create_app()`.
    from backend import create_app

    app = create_app()
except Exception:
    # Fallback: when running from the `backend` folder directly (tests),
    # import the blueprint and register it on a locally created app so
    # `from app import app` continues to work.
    from main import bp as main_bp  # local package `main`

    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(main_bp)


if __name__ == '__main__':
    # Use 127.0.0.1 and a fixed port so it's easy to test locally.
    app.run(host='127.0.0.1', port=5000, debug=True)
