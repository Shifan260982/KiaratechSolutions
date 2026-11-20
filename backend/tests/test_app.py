import logging

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, load_settings
from app.main import configure_logging, create_app

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


def test_drops_trailing_slashes_from_origins(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://kiaratechs.com/, https://www.kiaratechs.com")
    for name in SETTING_VARIABLES:
        monkeypatch.delenv(name, raising=False)
    assert load_settings().allowed_origins == ("https://kiaratechs.com", "https://www.kiaratechs.com")


SETTING_VARIABLES = (
    "MAIL_SENDER",
    "ENQUIRY_RECIPIENT",
    "APPLICATION_RECIPIENT",
    "CLAMAV_HOST",
    "TURNSTILE_SECRET_KEY",
    "TRUSTED_PROXY_HOPS",
)


@pytest.fixture
def clean_env(monkeypatch):
    for name in SETTING_VARIABLES:
        monkeypatch.delenv(name, raising=False)
    return monkeypatch


@pytest.mark.parametrize("recipient", ["ENQUIRY_RECIPIENT", "APPLICATION_RECIPIENT"])
def test_recipient_without_sender_fails_at_startup(clean_env, recipient):
    clean_env.setenv(recipient, "team@kiaratech.ai")
    with pytest.raises(ValueError, match="MAIL_SENDER"):
        load_settings()


@pytest.mark.parametrize("variables", [{}, {"MAIL_SENDER": "noreply@kiaratech.ai"}])
def test_no_recipient_means_mail_not_configured(clean_env, variables):
    for name, value in variables.items():
        clean_env.setenv(name, value)
    settings = load_settings()
    assert settings.mail is None and settings.scanner is None


def test_applications_without_enquiries(clean_env):
    clean_env.setenv("MAIL_SENDER", "noreply@kiaratech.ai")
    clean_env.setenv("APPLICATION_RECIPIENT", "jobs@kiaratech.ai")
    clean_env.setenv("CLAMAV_HOST", "localhost")
    settings = load_settings()
    assert settings.mail.sender == "noreply@kiaratech.ai"
    assert settings.mail.enquiry_recipient is None
    assert settings.mail.application_recipient == "jobs@kiaratech.ai"
    assert settings.scanner.port == 3310


def test_defaults_to_production(monkeypatch):
    monkeypatch.delenv("APP_ENV", raising=False)
    assert load_settings().is_production


def test_captcha_secret_never_appears_in_settings_output(clean_env):
    clean_env.setenv("TURNSTILE_SECRET_KEY", "super-secret-value")
    settings = load_settings()
    assert settings.turnstile_secret == "super-secret-value"
    assert "super-secret-value" not in repr(settings)


def test_proxy_hops_default_and_validation(clean_env):
    assert load_settings().trusted_proxy_hops == 1
    clean_env.setenv("TRUSTED_PROXY_HOPS", "-1")
    with pytest.raises(ValueError, match="TRUSTED_PROXY_HOPS"):
        load_settings()


def test_captcha_hostnames_come_from_origins_in_production_only():
    production = Settings(environment="production", allowed_origins=(SITE, "https://kiaratechs.com"))
    assert production.captcha_hostnames == {"www.kiaratechs.com", "kiaratechs.com"}
    assert Settings(environment="development", allowed_origins=(SITE,)).captcha_hostnames == frozenset()


def test_every_request_is_logged_without_the_visitor_ip(client, caplog):
    with caplog.at_level(logging.INFO, logger="kiaratech"):
        client.get("/health", headers={"X-Forwarded-For": "203.0.113.5"})
    line = next(r.getMessage() for r in caplog.records if "path=/health" in r.getMessage())
    assert "method=GET" in line and "status=200" in line and "request_id=" in line
    assert "203.0.113.5" not in caplog.text and "testclient" not in caplog.text


def test_logging_is_configured_for_info_once():
    configure_logging()
    configure_logging()
    app_logger = logging.getLogger("kiaratech")
    assert app_logger.level == logging.INFO
    assert len(app_logger.handlers) == 1
