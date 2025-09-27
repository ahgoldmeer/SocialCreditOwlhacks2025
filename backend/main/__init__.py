from flask import Blueprint

"""Initialization for the main blueprint.

This module defines `bp` and imports the `routes` module which registers
HTTP handlers on that blueprint.
"""

bp = Blueprint("main", __name__)

# Use a relative import so the package can be imported as `backend` or via
# the application factory in `backend.__init__`.
from . import routes
