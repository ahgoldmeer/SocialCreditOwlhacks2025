import json
import time
from functools import wraps
from typing import Dict, Any, Optional

import requests
from flask import request, jsonify
from jose import jwt
import os

_JWKS_CACHE: Dict[str, Any] = {}
_JWKS_EXPIRES_AT = 0


def _load_jwks():
    global _JWKS_CACHE, _JWKS_EXPIRES_AT
    domain = os.environ.get('AUTH0_DOMAIN')
    if not domain:
        raise RuntimeError('AUTH0_DOMAIN not configured')
    url = f'https://{domain}/.well-known/jwks.json'
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    _JWKS_CACHE = resp.json()
    _JWKS_EXPIRES_AT = time.time() + 60 * 60 * 12  # 12h cache


def _get_jwks():
    if not _JWKS_CACHE or time.time() > _JWKS_EXPIRES_AT:
        _load_jwks()
    return _JWKS_CACHE


def _get_token_from_header() -> Optional[str]:
    auth = request.headers.get('Authorization', '')
    if auth.lower().startswith('bearer '):
        return auth.split(' ', 1)[1].strip()
    return None


def verify_jwt() -> Optional[Dict[str, Any]]:
    token = _get_token_from_header()
    if not token:
        return None

    audience = os.environ.get('AUTH0_AUDIENCE')
    issuer = os.environ.get('AUTH0_API_ISSUER') or f"https://{os.environ.get('AUTH0_DOMAIN')}/"
    algorithms = [a.strip() for a in (os.environ.get('AUTH0_ALGORITHMS') or 'RS256').split(',')]

    unverified = jwt.get_unverified_header(token)
    kid = unverified.get('kid')
    jwks = _get_jwks()
    key = None
    for k in jwks.get('keys', []):
        if k.get('kid') == kid:
            key = k
            break
    if not key:
        # refresh once
        _load_jwks()
        jwks = _get_jwks()
        for k in jwks.get('keys', []):
            if k.get('kid') == kid:
                key = k
                break
    if not key:
        raise RuntimeError('Appropriate JWK not found')

    payload = jwt.decode(token, key, algorithms=algorithms, audience=audience, issuer=issuer)
    return payload


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            claims = verify_jwt()
            if claims is None:
                return jsonify({'error': 'authorization_header_missing'}), 401
            request.claims = claims  # type: ignore
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'invalid_token', 'message': str(e)}), 401
    return wrapper


def optional_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            claims = verify_jwt()
            if claims:
                request.claims = claims  # type: ignore
        except Exception:
            pass
        return f(*args, **kwargs)
    return wrapper
