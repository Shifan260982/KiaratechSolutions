"""Settings from environment variables. No secrets live here: Graph uses the app's Managed Identity."""

import os
from dataclasses import dataclass, field
from urllib.parse import urlsplit

from app.sharepoint import ApplicationsTarget, EnquiriesTarget


@dataclass(frozen=True)
class GraphSettings:
    site_id: str
    mail_sender: str
    client_id: str | None  # set for a user-assigned identity; empty uses the system-assigned one
    enquiries: EnquiriesTarget | None
    applications: ApplicationsTarget | None


@dataclass(frozen=True)
class ScannerSettings:
    host: str
    port: int


@dataclass(frozen=True)
class Settings:
    environment: str
    allowed_origins: tuple[str, ...]
    graph: GraphSettings | None = None  # None: submissions are refused with 503 until SharePoint is set up
    scanner: ScannerSettings | None = None  # None: applications are refused with 503 (CVs are never stored unscanned)
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


COMMON = ("GRAPH_SITE_ID", "MAIL_SENDER")
ENQUIRIES = ("ENQUIRIES_LIST_ID", "ENQUIRY_RECIPIENT")
APPLICATIONS = ("APPLICATIONS_LIST_ID", "CV_DRIVE_ID", "APPLICATION_RECIPIENT")


def _group(names: tuple[str, ...]) -> dict[str, str] | None:
    """All of `names` set, or none of them. A half-configured feature is a deployment mistake, so fail at start-up."""
    values = {name: os.environ.get(name, "").strip() for name in names}
    if not any(values.values()):
        return None
    missing = [name for name, value in values.items() if not value]
    if missing:
        raise ValueError(f"Settings are incomplete, missing: {', '.join(missing)}")
    return values


def load_settings() -> Settings:
    environment = os.environ.get("APP_ENV", "production")  # fail safe: unknown env behaves like production
    origins = tuple(o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip())
    for origin in origins:
        if origin == "*" or (environment == "production" and not origin.startswith("https://")):
            raise ValueError(f"ALLOWED_ORIGINS must list exact https origins in production, got {origin!r}")

    common, enquiries, applications = _group(COMMON), _group(ENQUIRIES), _group(APPLICATIONS)
    if (enquiries or applications) and not common:
        raise ValueError(f"Settings are incomplete, missing: {', '.join(COMMON)}")
    graph = None
    if common and (enquiries or applications):
        graph = GraphSettings(
            site_id=common["GRAPH_SITE_ID"],
            mail_sender=common["MAIL_SENDER"],
            client_id=os.environ.get("AZURE_CLIENT_ID") or None,
            enquiries=enquiries and EnquiriesTarget(enquiries["ENQUIRIES_LIST_ID"], enquiries["ENQUIRY_RECIPIENT"]),
            applications=applications
            and ApplicationsTarget(
                applications["APPLICATIONS_LIST_ID"], applications["CV_DRIVE_ID"], applications["APPLICATION_RECIPIENT"]
            ),
        )

    host = os.environ.get("CLAMAV_HOST", "").strip()
    scanner = ScannerSettings(host, int(os.environ.get("CLAMAV_PORT", "3310"))) if host else None
    hops = os.environ.get("TRUSTED_PROXY_HOPS", "1").strip()
    if not hops.isdigit():
        raise ValueError("TRUSTED_PROXY_HOPS must be a whole number")
    return Settings(
        environment=environment,
        allowed_origins=origins,
        graph=graph,
        scanner=scanner,
        turnstile_secret=os.environ.get("TURNSTILE_SECRET_KEY", "").strip() or None,
        trusted_proxy_hops=int(hops),
    )
