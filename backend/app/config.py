"""Settings from environment variables. No secrets live here: Graph uses the app's Managed Identity."""

import os
from dataclasses import dataclass, field
from urllib.parse import urlsplit


@dataclass(frozen=True)
class MailSettings:
    sender: str  # the noreply mailbox every e-mail is sent from
    client_id: str | None  # set for a user-assigned identity; empty uses the system-assigned one
    enquiry_recipient: str | None  # None: enquiries are refused with 503
    application_recipient: str | None  # None: applications are refused with 503


@dataclass(frozen=True)
class ScannerSettings:
    host: str
    port: int


@dataclass(frozen=True)
class Settings:
    environment: str
    allowed_origins: tuple[str, ...]
    mail: MailSettings | None = None  # None: submissions are refused with 503 until the mailbox is set up
    scanner: ScannerSettings | None = None  # None: applications are refused with 503 (CVs are never sent unscanned)
    # Comes from Key Vault through a Container Apps secret reference. None: submissions are refused with 503.
    turnstile_secret: str | None = field(default=None, repr=False)
    # Proxies in front of the app that append to X-Forwarded-For. Azure Container Apps ingress is one.
    trusted_proxy_hops: int = 1

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def captcha_hostnames(self) -> frozenset[str]:
        """Hostnames a captcha token must come from. Empty outside production, where Cloudflare's test keys
        report example.com."""
        if not self.is_production:
            return frozenset()
        return frozenset(urlsplit(origin).hostname or "" for origin in self.allowed_origins)


def _env(name: str) -> str | None:
    return os.environ.get(name, "").strip() or None


def load_settings() -> Settings:
    environment = os.environ.get("APP_ENV", "production")  # fail safe: unknown env behaves like production
    # Browsers send Origin without a trailing slash, so "https://site.com/" would never match: drop it.
    origins = tuple(o.strip().rstrip("/") for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip().rstrip("/"))
    for origin in origins:
        if origin == "*" or (environment == "production" and not origin.startswith("https://")):
            raise ValueError(f"ALLOWED_ORIGINS must list exact https origins in production, got {origin!r}")

    sender, enquiry_to, application_to = _env("MAIL_SENDER"), _env("ENQUIRY_RECIPIENT"), _env("APPLICATION_RECIPIENT")
    if (enquiry_to or application_to) and not sender:
        # A recipient without a sender is a deployment mistake: fail at start-up rather than on the first submission.
        raise ValueError("Settings are incomplete, missing: MAIL_SENDER")
    mail = None
    if sender and (enquiry_to or application_to):
        mail = MailSettings(sender, _env("AZURE_CLIENT_ID"), enquiry_to, application_to)

    host = os.environ.get("CLAMAV_HOST", "").strip()
    scanner = ScannerSettings(host, int(os.environ.get("CLAMAV_PORT", "3310"))) if host else None
    hops = os.environ.get("TRUSTED_PROXY_HOPS", "1").strip()
    if not hops.isdigit():
        raise ValueError("TRUSTED_PROXY_HOPS must be a whole number")
    return Settings(
        environment=environment,
        allowed_origins=origins,
        mail=mail,
        scanner=scanner,
        turnstile_secret=os.environ.get("TURNSTILE_SECRET_KEY", "").strip() or None,
        trusted_proxy_hops=int(hops),
    )
