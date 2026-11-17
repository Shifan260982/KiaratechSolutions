from app.captcha import CaptchaUnavailable

GOOD_TOKEN = "good-token"


class FakeCaptcha:
    """Passes only GOOD_TOKEN for the expected action; `fail=True` simulates Cloudflare being unreachable."""

    def __init__(self, fail: bool = False) -> None:
        self.fail = fail
        self.calls: list[tuple[str, str, str]] = []

    async def verify(self, token: str, action: str, remote_ip: str) -> bool:
        self.calls.append((token, action, remote_ip))
        if self.fail:
            raise CaptchaUnavailable
        return token == GOOD_TOKEN
