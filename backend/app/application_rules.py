"""Job application rules. Mirrors frontend/src/lib/application.ts; this is the real security boundary."""

import io
import re
import zipfile
from dataclasses import dataclass

from app.validation import email_error, name_error, sanitise_text

LIMITS = {"location": 100, "linkedIn": 200, "coverNote": 2000, "roleId": 100, "roleTitle": 200}
CV_MAX_BYTES = 5 * 1024 * 1024

_PHONE = re.compile(r"^\+?[\d\s()-]{7,20}$")
_HTTPS_URL = re.compile(r"^https://[^\s\"'<>]+$", re.IGNORECASE)


@dataclass(frozen=True)
class NumberField:
    label: str
    min: float
    max: float
    integer: bool


@dataclass(frozen=True)
class TextField:
    label: str
    max_length: int


@dataclass(frozen=True)
class SelectField:
    label: str
    options: tuple[str, ...]


# Same keys and limits as `applicationFields` in the frontend. Keep both in step.
DETAIL_FIELDS: dict[str, NumberField | TextField | SelectField] = {
    "totalExperience": NumberField("total experience", 0, 50, integer=False),
    "relevantExperience": NumberField("relevant experience", 0, 50, integer=False),
    "currentCtc": TextField("current CTC", 40),
    "expectedCtc": TextField("expected CTC", 40),
    "noticePeriod": NumberField("notice period", 0, 365, integer=True),
    "teamSize": NumberField("team size managed", 0, 1000, integer=True),
    "primaryTechnology": TextField("primary technology", 60),
    "itilCertification": SelectField("ITIL certification", ("ITIL 4", "Another ITIL version", "Not certified")),
}

BASIC_FIELDS = ("roleId", "roleTitle", "firstName", "lastName", "email", "phone", "location", "linkedIn", "coverNote")
HONEYPOT = "website"
FORM_FIELDS = frozenset((*BASIC_FIELDS, *DETAIL_FIELDS, HONEYPOT, "captchaToken", "cv"))


@dataclass(frozen=True)
class Application:
    role_id: str
    role_title: str
    first_name: str
    last_name: str
    email: str
    phone: str
    location: str
    linked_in: str
    cover_note: str
    details: dict[str, str]


def detail_error(key: str, value: str) -> str | None:
    field = DETAIL_FIELDS[key]
    if not value:
        return f"Choose your {field.label}." if isinstance(field, SelectField) else f"Enter your {field.label}."
    if isinstance(field, TextField):
        return f"Keep this to {field.max_length} characters or fewer." if len(value) > field.max_length else None
    if isinstance(field, SelectField):
        return None if value in field.options else f"Choose your {field.label}."
    try:
        number = float(value)
    except ValueError:
        number = float("nan")
    if not (field.min <= number <= field.max):  # also false for NaN and infinity
        return f"Enter a number between {field.min:g} and {field.max:g}."
    if field.integer and not number.is_integer():
        return "Enter a whole number."
    return None


def validate_application(raw: dict[str, str]) -> tuple[Application, dict[str, str]]:
    """`raw` holds the text form fields, already checked to be known names. Returns errors keyed by field name."""
    text = {key: sanitise_text(raw.get(key, "")) for key in BASIC_FIELDS}
    details = {key: sanitise_text(raw[key]) for key in DETAIL_FIELDS if key in raw}
    application = Application(
        role_id=text["roleId"],
        role_title=text["roleTitle"],
        first_name=text["firstName"],
        last_name=text["lastName"],
        email=text["email"].lower(),
        phone=text["phone"],
        location=text["location"],
        linked_in=text["linkedIn"],
        cover_note=text["coverNote"],
        details=details,
    )

    errors: dict[str, str | None] = {}
    if not application.role_id or not application.role_title:
        errors["roleId"] = "This application is missing its role. Reload the page and try again."
    elif len(application.role_id) > LIMITS["roleId"] or len(application.role_title) > LIMITS["roleTitle"]:
        errors["roleId"] = "This application's role is not valid. Reload the page and try again."
    errors["firstName"] = name_error(application.first_name, "first name")
    errors["lastName"] = name_error(application.last_name, "last name")
    errors["email"] = email_error(application.email)
    phone = application.phone
    if not phone:
        errors["phone"] = "Enter your phone number."
    elif not _PHONE.fullmatch(phone) or sum(c.isdigit() for c in phone) < 7:
        errors["phone"] = "Enter a phone number with its country code, for example +91 98765 43210."
    if not application.location:
        errors["location"] = "Enter your current location."
    elif len(application.location) > LIMITS["location"]:
        errors["location"] = f"Keep this to {LIMITS['location']} characters or fewer."
    if application.linked_in and (
        len(application.linked_in) > LIMITS["linkedIn"] or not _HTTPS_URL.fullmatch(application.linked_in)
    ):
        errors["linkedIn"] = "Enter the full profile address, starting with https://"
    if len(application.cover_note) > LIMITS["coverNote"]:
        errors["coverNote"] = f"Keep this to {LIMITS['coverNote']} characters or fewer."
    # shortcut: checks each detail the visitor sent, not which details the role asks for (the role list lives in the
    # frontend). Upgrade: move jobs to shared JSON if a forged request leaving out a question matters.
    for key, value in details.items():
        errors[key] = detail_error(key, value)
    return application, {key: message for key, message in errors.items() if message}


# --- CV file ---

WRONG_TYPE = "Attach your CV as a PDF or Word document."
_OLE2 = bytes.fromhex("d0cf11e0a1b11ae1")  # legacy .doc container
_MAX_ZIP_ENTRIES = 2000


def cv_error(filename: str, content: bytes) -> str | None:
    """Checks the CV's real type from its bytes, not just its name. Returns an error message or None."""
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ("pdf", "doc", "docx"):
        return WRONG_TYPE
    if not content:
        return "The file you chose is empty."
    if len(content) > CV_MAX_BYTES:
        return "Your CV must be 5 MB or smaller."
    if extension == "pdf":
        return None if content.startswith(b"%PDF-") else WRONG_TYPE
    if extension == "doc":
        return None if content.startswith(_OLE2) else WRONG_TYPE
    return None if _is_plain_docx(content) else WRONG_TYPE


def _is_plain_docx(content: bytes) -> bool:
    """A real Word document without macros. Reads the zip directory only, so nothing is decompressed."""
    if not content.startswith(b"PK\x03\x04"):
        return False
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            names = archive.namelist()
    except (zipfile.BadZipFile, ValueError):
        return False
    if len(names) > _MAX_ZIP_ENTRIES:
        return False
    lowered = {name.lower() for name in names}
    has_document = "[content_types].xml" in lowered and "word/document.xml" in lowered
    has_macros = any(name.endswith("vbaproject.bin") for name in lowered)  # a .docm renamed to .docx
    return has_document and not has_macros
