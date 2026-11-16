"""Settings from environment variables. No secrets live here: Graph and Key Vault use Managed Identity."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    environment: str
    allowed_origins: tuple[str, ...]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


def load_settings() -> Settings:
    environment = os.environ.get("APP_ENV", "production")  # fail safe: unknown env behaves like production
    origins = tuple(o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip())
    for origin in origins:
        if origin == "*" or (environment == "production" and not origin.startswith("https://")):
            raise ValueError(f"ALLOWED_ORIGINS must list exact https origins in production, got {origin!r}")
    return Settings(environment=environment, allowed_origins=origins)
