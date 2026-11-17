"""Cloudflare Turnstile verification. Tokens are single-use and expire after 5 minutes."""

import logging
from typing import Protocol

import httpx2
from starlette.requests import Request

from app.ratelimit import client_ip

logger = logging.getLogger("kiaratech.captcha")

SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
MAX_TOKEN_LENGTH = 2048  # Cloudflare's documented maximum
FIELD = "captchaToken"
FAILED = "We could not confirm you are a person. Complete the check again, then resubmit."


class CaptchaUnavailable(Exception):
    """Verification could not complete, so the submission is refused for now."""


class CaptchaVerifier(Protocol):
    async def verify(self, token: str, action: str, remote_ip: str) -> bool: ...


class TurnstileVerifier:
    def __init__(self, client: httpx2.AsyncClient, secret: str, hostnames: frozenset[str]) -> None:
        self._client = client
        self._secret = secret
        # The site's own hostnames: a token solved on another site is refused. Empty outside production.
        self._hostnames = hostnames

    async def verify(self, token: str, action: str, remote_ip: str) -> bool:
        if not token or len(token) > MAX_TOKEN_LENGTH:
            return False
        try:
            response = await self._client.post(
                SITEVERIFY, data={"secret": self._secret, "response": token, "remoteip": remote_ip}
            )
            result = response.json() if response.status_code == 200 else None
        except Exception as error:  # network or JSON failure; never log the request, it holds the secret
            logger.error("captcha verification failed error=%s", type(error).__name__)
            raise CaptchaUnavailable from error
        if not isinstance(result, dict):
            logger.error("captcha verification failed status=%s", response.status_code)
            raise CaptchaUnavailable
        if not result.get("success"):
            codes = result.get("error-codes", [])
            if "invalid-input-secret" in codes or "missing-input-secret" in codes:
                logger.error("captcha secret rejected by Cloudflare")  # our misconfiguration, not the visitor's
                raise CaptchaUnavailable
            logger.info("captcha rejected codes=%s", ",".join(map(str, codes)))
            return False
        # Cloudflare's test keys report neither our action nor our hostname, so both checks run in production only.
        if self._hostnames and (result.get("action") != action or result.get("hostname") not in self._hostnames):
            logger.warning("captcha token for the wrong action or site")
            return False
        return True


async def captcha_passed(request: Request, token: str, action: str) -> bool:
    """Runs the app's verifier. Raises CaptchaUnavailable when none is configured: never accept unverified."""
    verifier: CaptchaVerifier | None = request.app.state.captcha
    if verifier is None:
        logger.error("submission refused: captcha is not configured")
        raise CaptchaUnavailable
    return await verifier.verify(token, action, client_ip(request.scope, request.app.state.trusted_proxy_hops))
