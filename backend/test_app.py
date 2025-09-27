import json

# Use the application factory for tests so we can configure or replace
# settings easily in future. This imports `create_app` from the package
# and builds a fresh app for each test run.
from backend import create_app


def test_health():
    app = create_app()
    client = app.test_client()
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.get_json() == {'status': 'ok'}


def test_echo():
    app = create_app()
    client = app.test_client()
    payload = {'foo': 'bar'}
    resp = client.post('/echo', json=payload)
    assert resp.status_code == 200
    assert resp.get_json() == {'received': payload}

def test_add_user():
    app = create_app()
    client = app.test_client()
    payload = {
        'username': 'testuser',
        'email': 'test@temple.edu',
        'password_hash': 'hashed_password',
        'createdAt': '2024-10-01T12:00:00Z'
    }
    resp = client.post('/add_user', json=payload)
    assert resp.status_code == 201