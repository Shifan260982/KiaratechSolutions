import httpx2
import pytest

from app.captcha import CaptchaUnavailable, TurnstileVerifier

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


def verifier(reply, hostnames=frozenset({"www.kiaratechs.com"})):
    seen: list[httpx2.Request] = []

    def handler(request):
        seen.append(request)
        return reply(request) if callable(reply) else reply

    client = httpx2.AsyncClient(transport=httpx2.MockTransport(handler))
    return TurnstileVerifier(client, "secret-123", hostnames), seen


def ok(**overrides):
    return httpx2.Response(200, json={"success": True, "action": "enquiry", "hostname": "www.kiaratechs.com", **overrides})


async def test_accepts_a_valid_token_and_sends_secret_and_ip():
    check, seen = verifier(ok())
    assert await check.verify("token-1", "enquiry", "203.0.113.5")
    body = seen[0].content.decode()
    assert "secret=secret-123" in body and "response=token-1" in body and "remoteip=203.0.113.5" in body


@pytest.mark.parametrize(
    "reply",
    [
        httpx2.Response(200, json={"success": False, "error-codes": ["invalid-input-response"]}),
        httpx2.Response(200, json={"success": False, "error-codes": ["timeout-or-duplicate"]}),
        ok(action="application"),  # token solved for the other form
        ok(hostname="evil.example"),  # token solved on another site using our site key
    ],
)
async def test_rejects_bad_tokens(reply):
    check, _ = verifier(reply)
    assert not await check.verify("token-1", "enquiry", "203.0.113.5")


async def test_cloudflare_test_key_reply_passes_outside_production():
    # Exactly what the real siteverify returned for the always-pass test secret: no action, example.com.
    reply = httpx2.Response(200, json={"success": True, "error-codes": [], "hostname": "example.com"})
    check, _ = verifier(reply, hostnames=frozenset())
    assert await check.verify("token-1", "enquiry", "203.0.113.5")


@pytest.mark.parametrize("token", ["", "x" * 2049])
async def test_empty_or_oversized_token_is_rejected_without_calling_cloudflare(token):
    check, seen = verifier(ok())
    assert not await check.verify(token, "enquiry", "203.0.113.5")
    assert seen == []


@pytest.mark.parametrize(
    "reply",
    [
        httpx2.Response(500),
        httpx2.Response(200, content=b"not json"),
        httpx2.Response(200, json={"success": False, "error-codes": ["invalid-input-secret"]}),
    ],
)
async def test_outage_or_our_misconfiguration_is_unavailable_not_a_visitor_error(reply):
    check, _ = verifier(reply)
    with pytest.raises(CaptchaUnavailable):
        await check.verify("token-1", "enquiry", "203.0.113.5")


async def test_network_error_is_unavailable_and_secret_is_not_logged(caplog):
    def down(request):
        raise httpx2.ConnectError("down")

    check, _ = verifier(down)
    with pytest.raises(CaptchaUnavailable):
        await check.verify("token-1", "enquiry", "203.0.113.5")
    assert "secret-123" not in caplog.text
