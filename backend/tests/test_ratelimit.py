import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.ratelimit import Limit, RateLimit, client_ip
from tests.fakes import FakeCaptcha

SITE = "https://www.kiaratechs.com"


def scope(peer: str = "10.0.0.9", forwarded: str | None = None) -> dict:
    headers = [(b"x-forwarded-for", forwarded.encode())] if forwarded else []
    return {"type": "http", "client": (peer, 1234), "headers": headers}


@pytest.mark.parametrize(
    ("hops", "forwarded", "expected"),
    [
        (0, "1.1.1.1", "10.0.0.9"),  # no proxy: the header is ignored entirely
        (1, None, "10.0.0.9"),
        (1, "203.0.113.5", "203.0.113.5"),
        (1, "6.6.6.6, 203.0.113.5", "203.0.113.5"),  # a forged left-hand entry cannot pick the key
        (2, "6.6.6.6, 203.0.113.5, 10.1.1.1", "203.0.113.5"),
        (2, "203.0.113.5", "10.0.0.9"),  # fewer entries than proxies: fall back to the peer
    ],
)
def test_client_ip(hops, forwarded, expected):
    assert client_ip(scope(forwarded=forwarded), hops) == expected


class Clock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


@pytest.fixture
def clock() -> Clock:
    return Clock()


@pytest.fixture
def client(clock) -> TestClient:
    app = create_app(Settings(environment="production", allowed_origins=(SITE,)), captcha=FakeCaptcha(), clock=clock)
    return TestClient(app, raise_server_exceptions=False)


def send(client, ip="203.0.113.5", path="/api/v1/enquiries"):
    return client.post(path, json={}, headers={"X-Forwarded-For": ip, "Origin": SITE})


def test_limit_resets_after_the_window(client, clock):
    assert [send(client).status_code for _ in range(5)] == [400] * 5  # counted even when invalid
    blocked = send(client)
    assert blocked.status_code == 429
    assert blocked.headers["Retry-After"] == "600"
    assert blocked.headers["access-control-allow-origin"] == SITE  # the form can read the message
    assert blocked.headers["X-Content-Type-Options"] == "nosniff"
    clock.now += 601
    assert send(client).status_code == 400


def test_limits_are_per_ip_and_per_path(client):
    for _ in range(5):
        send(client)
    assert send(client).status_code == 429
    assert send(client, ip="198.51.100.7").status_code == 400
    assert send(client, path="/api/v1/applications").status_code == 400


def test_other_methods_and_paths_are_not_limited(client):
    for _ in range(10):
        assert client.get("/health").status_code == 200
        assert (
            client.options("/api/v1/enquiries", headers={"Origin": SITE, "Access-Control-Request-Method": "POST"}).status_code
            == 200
        )


def test_memory_is_bounded(monkeypatch):
    monkeypatch.setattr("app.ratelimit.MAX_TRACKED_CLIENTS", 3)
    limiter = RateLimit(app=None, limits={}, trusted_proxy_hops=0, clock=lambda: 0.0)
    for n in range(10):
        limiter._hit((f"ip-{n}", "/x"), Limit(5, 60))
    assert len(limiter.hits) == 3
    assert ("ip-9", "/x") in limiter.hits
