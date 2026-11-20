"""E-mail templates for the three messages the API sends.

Every value a visitor typed is HTML-escaped before it goes into a message, and subjects are forced onto one line.
The candidate's confirmation goes to whatever address was typed, so it repeats only a name and a role that look
like a real name and job title, never anything link-like: the form cannot be used to send our e-mail with arbitrary
text or links to someone else's address.
"""

import html
import re
from dataclasses import dataclass
from datetime import date, datetime

from app.application_rules import DETAIL_FIELDS, Application
from app.validation import Enquiry

NAVY = "#102A56"
AMBER = "#B45309"

# Characters that are unsafe in file names on common systems, characters that change a path, and control characters.
_UNSAFE_IN_FILE_NAME = re.compile(r'["*:<>?/\\|#%~&{}\x00-\x1f\x7f]+')

# What may be echoed back in the candidate's confirmation. Names: letters (any alphabet) joined by single spaces,
# hyphens or apostrophes. Roles: the characters real job titles use, e.g. "Software Engineer – C# / .NET".
_NAME = re.compile(r"[^\W\d_]+(?:[ '’-][^\W\d_]+)*")
_ROLE = re.compile(r"[\w ,&/#+().–-]+")
# Anything a mail client could turn into a link: a scheme, www, an address, or a domain such as evil.example.
_LINK_LIKE = re.compile(r"https?|www|://|@|[^\W_]\.[^\W\d_]{2,}", re.IGNORECASE)


def _safe(value: str, pattern: re.Pattern[str], limit: int) -> str | None:
    """`value` if it is short, made only of allowed characters and nothing link-like; otherwise None."""
    value = " ".join(value.split())
    if value and len(value) <= limit and pattern.fullmatch(value) and not _LINK_LIKE.search(value):
        return value
    return None


@dataclass(frozen=True)
class Email:
    to: str
    subject: str
    html: str
    reply_to: str | None = None  # replies go straight to the visitor, not to the noreply mailbox


def cv_file_name(application: Application, extension: str, today: date) -> str:
    """The attachment's name, e.g. 'Jane Doe - Senior Backend Engineer - 2026-11-20.pdf'.

    Built only from validated fields, never from the applicant's own file name. The extension comes from the
    content check. At most 181 characters.
    """

    def clean(text: str, limit: int) -> str:
        text = " ".join(_UNSAFE_IN_FILE_NAME.sub(" ", text).split())
        return text[:limit].strip(" .")

    person = clean(f"{application.first_name} {application.last_name}", 80) or "Applicant"
    role = clean(application.role_title, 80) or "Role"
    return f"{person} - {role} - {today.isoformat()}.{extension}"


def enquiry_email(enquiry: Enquiry, recipient: str, received: datetime) -> Email:
    rows = [
        ("Name", f"{enquiry.first_name} {enquiry.last_name}"),
        ("E-mail", enquiry.email),
        ("Company", enquiry.company),
        ("Topic", enquiry.topic),
        ("Message", enquiry.message),
        ("Received", _received(received)),
    ]
    body = _page(
        "New website enquiry",
        "Sent from the Let's Connect form on the website. Reply to this e-mail to answer the sender directly.",
        rows,
    )
    return Email(recipient, f"Website enquiry: {_one_line(enquiry.topic)}", body, reply_to=enquiry.email)


def application_email(application: Application, recipient: str, cv_name: str, received: datetime) -> Email:
    details = [(_label(key), value) for key, value in application.details.items()]
    rows = [
        ("Role", f"{application.role_title} ({application.role_id})"),
        ("Name", f"{application.first_name} {application.last_name}"),
        ("E-mail", application.email),
        ("Phone", application.phone),
        ("Location", application.location),
        ("LinkedIn", application.linked_in),
        *details,
        ("Cover note", application.cover_note),
        ("CV", f"Attached: {cv_name}"),
        ("Received", _received(received)),
    ]
    warning = (
        "<b>Do not open the attached CV straight from this e-mail.</b> Save it to your device first and open it from "
        "there, so your security software checks it. The file passed an automated virus scan, but no scan catches "
        "everything and the file comes from a member of the public."
    )
    body = _page(
        "New job application",
        "Sent from the job application form on the website. Reply to this e-mail to contact the candidate directly.",
        rows,
        warning=warning,
    )
    name = _one_line(f"{application.first_name} {application.last_name}")
    subject = f"Job application: {_one_line(application.role_title)} - {name}"
    return Email(recipient, subject, body, reply_to=application.email)


def confirmation_email(application: Application) -> Email:
    name = _safe(application.first_name, _NAME, 40)
    role = _safe(application.role_title, _ROLE, 100)
    applied = (
        f"Thank you for applying for the <b>{html.escape(role)}</b> role at Kiaratech Solutions."
        if role
        else "Thank you for applying to Kiaratech Solutions."
    )
    paragraphs = [
        f"Hi {html.escape(name)}," if name else "Hi,",
        f"{applied} We have received your application and CV.",
        "Our hiring team will review it and will contact you if your experience matches the role.",
        "This is an automated message from an address that is not monitored, so please do not reply to it.",
        "Kiaratech Solutions hiring team",
    ]
    content = "".join(f'<p style="margin:0 0 14px">{text}</p>' for text in paragraphs)
    return Email(application.email, "We have received your application", _frame("Application received", content))


# --- building blocks ---


def _one_line(text: str, limit: int = 120) -> str:
    """Collapses newlines and runs of spaces: subjects must stay on one line."""
    return " ".join(text.split())[:limit]


def _label(key: str) -> str:
    label = DETAIL_FIELDS[key].label
    return label[0].upper() + label[1:]


def _received(moment: datetime) -> str:
    return moment.strftime("%d %b %Y, %H:%M UTC")


def _cell(value: str) -> str:
    return html.escape(value).replace("\n", "<br>") if value else '<span style="color:#64748B">Not given</span>'


def _page(heading: str, intro: str, rows: list[tuple[str, str]], warning: str = "") -> str:
    table_rows = "".join(
        '<tr><td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#475569;width:150px;vertical-align:top">'
        f'{html.escape(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;vertical-align:top">'
        f"{_cell(value)}</td></tr>"
        for label, value in rows
    )
    warning_box = (
        f'<div style="background:#FFF7E6;border-left:3px solid {AMBER};padding:10px 14px;margin:0 0 16px">{warning}</div>'
        if warning
        else ""
    )
    content = (
        f'<p style="margin:0 0 16px;color:#475569">{html.escape(intro)}</p>{warning_box}'
        f'<table style="border-collapse:collapse;width:100%;font-size:14px">{table_rows}</table>'
    )
    return _frame(heading, content)


def _frame(heading: str, content: str) -> str:
    return (
        '<div style="font-family:Segoe UI,Arial,sans-serif;color:#172033;max-width:640px">'
        f'<h2 style="color:{NAVY};margin:0 0 12px;font-size:20px">{html.escape(heading)}</h2>{content}</div>'
    )
