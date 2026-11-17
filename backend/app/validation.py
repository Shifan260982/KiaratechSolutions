"""Server-side rules. These mirror frontend/src/lib/validation.ts and are the real security boundary."""

import re

from pydantic import BaseModel, ConfigDict

LIMITS = {"name": 60, "email": 254, "company": 120, "topic": 120, "message": 2000}
MIN_MESSAGE = 20

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


def sanitise_text(value: str) -> str:
    """Strip control characters (keeps tab and newline) and surrounding whitespace."""
    return _CONTROL_CHARS.sub("", value).strip()


def email_error(email: str) -> str | None:
    if not email:
        return "Enter your email address."
    if len(email) > LIMITS["email"] or not _EMAIL.fullmatch(email):
        return "Enter an email address in the format name@company.com."
    return None


def name_error(value: str, label: str) -> str | None:
    if not value:
        return f"Enter your {label}."
    if len(value) > LIMITS["name"]:
        return f"Your {label} must be {LIMITS['name']} characters or fewer."
    return None


class EnquiryIn(BaseModel):
    """Request body. Unknown fields are rejected; `website` is a honeypot the form keeps hidden from people."""

    model_config = ConfigDict(extra="forbid", str_max_length=10_000)

    firstName: str  # noqa: N815 - matches the form's field names
    lastName: str  # noqa: N815
    email: str
    company: str
    topic: str
    message: str
    website: str = ""
    captchaToken: str = ""  # noqa: N815 - Cloudflare Turnstile token from the form's widget


class Enquiry(BaseModel):
    """A sanitised, validated enquiry."""

    first_name: str
    last_name: str
    email: str
    company: str
    topic: str
    message: str


def validate_enquiry(raw: EnquiryIn) -> tuple[Enquiry, dict[str, str]]:
    """Returns the sanitised enquiry and errors keyed by form field name (empty when valid)."""
    enquiry = Enquiry(
        first_name=sanitise_text(raw.firstName),
        last_name=sanitise_text(raw.lastName),
        email=sanitise_text(raw.email).lower(),
        company=sanitise_text(raw.company),
        topic=sanitise_text(raw.topic),
        message=sanitise_text(raw.message),
    )
    checks = {
        "firstName": name_error(enquiry.first_name, "first name"),
        "lastName": name_error(enquiry.last_name, "last name"),
        "email": email_error(enquiry.email),
        "company": _length_error(enquiry.company, "company", "Enter your company or organisation.", "Company"),
        "topic": _length_error(
            enquiry.topic, "topic", "Enter a topic, for example: AI automation for invoice processing.", "Topic"
        ),
        "message": (
            f"Describe the outcome you are looking for in at least {MIN_MESSAGE} characters."
            if len(enquiry.message) < MIN_MESSAGE
            else _length_error(enquiry.message, "message", "", "Message")
        ),
    }
    return enquiry, {field: error for field, error in checks.items() if error}


def _length_error(value: str, limit: str, empty_message: str, label: str) -> str | None:
    if not value:
        return empty_message
    if len(value) > LIMITS[limit]:
        return f"{label} must be {LIMITS[limit]} characters or fewer."
    return None
