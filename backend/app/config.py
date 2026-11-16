"""Settings from environment variables. No secrets live here: Graph uses the app's Managed Identity."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class GraphSettings:
    site_id: str
    enquiries_list_id: str
    mail_sender: str
    enquiry_recipient: str
    client_id: str | None  # set for a user-assigned identity; empty uses the system-assigned one


@dataclass(frozen=True)
class Settings:
    environment: str
    allowed_origins: tuple[str, ...]
    graph: GraphSettings | None = None  # None: submissions are refused with 503 until SharePoint is set up

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


GRAPH_VARIABLES = ("GRAPH_SITE_ID", "ENQUIRIES_LIST_ID", "MAIL_SENDER", "ENQUIRY_RECIPIENT")


def load_settings() -> Settings:
    environment = os.environ.get("APP_ENV", "production")  # fail safe: unknown env behaves like production
    origins = tuple(o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip())
    for origin in origins:
        if origin == "*" or (environment == "production" and not origin.startswith("https://")):
            raise ValueError(f"ALLOWED_ORIGINS must list exact https origins in production, got {origin!r}")

    values = {name: os.environ.get(name, "").strip() for name in GRAPH_VARIABLES}
    if any(values.values()) and not all(values.values()):
        missing = ", ".join(name for name, value in values.items() if not value)
        raise ValueError(f"SharePoint settings are incomplete, missing: {missing}")
    graph = (
        GraphSettings(
            site_id=values["GRAPH_SITE_ID"],
            enquiries_list_id=values["ENQUIRIES_LIST_ID"],
            mail_sender=values["MAIL_SENDER"],
            enquiry_recipient=values["ENQUIRY_RECIPIENT"],
            client_id=os.environ.get("AZURE_CLIENT_ID") or None,
        )
        if all(values.values())
        else None
    )
    return Settings(environment=environment, allowed_origins=origins, graph=graph)
