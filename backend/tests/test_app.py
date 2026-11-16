import pytest
from fastapi.testclient import TestClient

from app.config import Settings, load_settings
from app.main import create_app

SITE = "https://www.kiaratechs.com"


@pytest.fixture
def client() -> TestClient:
    app = create_app(Settings(environment="production", allowed_origins=(SITE,)))

    @app.get("/boom")
    async def boom():
        raise RuntimeError("secret detail")

    return TestClient(app, raise_server_exceptions=False)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_security_headers_on_every_response(client):
    for path in ("/health", "/missing"):
        headers = client.get(path).headers
        assert headers["X-Content-Type-Options"] == "nosniff"
        assert headers["Cache-Control"] == "no-store"
        assert "frame-ancestors 'none'" in headers["Content-Security-Policy"]
        assert headers["X-Request-ID"]


def test_docs_hidden_in_production(client):
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404


def test_errors_do_not_leak_details(client):
    response = client.get("/boom")
    assert response.status_code == 500
    assert "secret detail" not in response.text
    assert response.json()["requestId"] == response.headers["X-Request-ID"]
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_cors_allows_only_the_site(client):
    preflight = {"Access-Control-Request-Method": "POST"}
    allowed = client.options("/health", headers={"Origin": SITE, **preflight})
    assert allowed.headers.get("access-control-allow-origin") == SITE
    denied = client.options("/health", headers={"Origin": "https://evil.example", **preflight})
    assert "access-control-allow-origin" not in denied.headers


@pytest.mark.parametrize("origins", ["*", "http://www.kiaratechs.com"])
def test_rejects_unsafe_origins_in_production(monkeypatch, origins):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", origins)
    with pytest.raises(ValueError):
        load_settings()


def test_defaults_to_production(monkeypatch):
    monkeypatch.delenv("APP_ENV", raising=False)
    assert load_settings().is_production
