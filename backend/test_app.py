import json
from app import app


def test_health():
    client = app.test_client()
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.get_json() == {'status': 'ok'}


def test_echo():
    client = app.test_client()
    payload = {'foo': 'bar'}
    resp = client.post('/echo', json=payload)
    assert resp.status_code == 200
    assert resp.get_json() == {'received': payload}
