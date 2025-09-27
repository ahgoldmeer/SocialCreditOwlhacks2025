from flask import Flask
from flask_cors import CORS


def create_app(config=None):
    """Application factory for the backend package.

    This replaces the incorrectly named `__init__.__.py` file and registers
    the `main` blueprint defined in the `main` package.
    """
    app = Flask(__name__)
    if config:
        app.config.update(config)

    CORS(app)

    # Import the blueprint from the package's main subpackage and register it.
    from .main import bp as main_bp
    app.register_blueprint(main_bp)

    return app
