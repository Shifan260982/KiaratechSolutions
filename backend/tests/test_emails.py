import dataclasses
import re
from datetime import UTC, date, datetime

import pytest

from app.application_rules import Application
from app.emails import application_email, confirmation_email, cv_file_name, enquiry_email
from app.validation import Enquiry

RECEIVED = datetime(2026, 11, 20, 14, 3, tzinfo=UTC)
TODAY = date(2026, 11, 20)

ENQUIRY = Enquiry(
    first_name="John",
    last_name="Doe",
    email="john@example.com",
    company="Example Ltd",
    topic="Invoice automation",
    message="Three sites.\nAbout 4,000 invoices a month.",
)

APPLICATION = Application(
    role_id="senior-backend-engineer",
    role_title="Senior Backend Engineer",
    first_name="Jane",
    last_name="Doe",
    email="jane@example.com",
    phone="+44 20 7946 0000",
    location="London",
    linked_in="",
    cover_note="Available from January.",
    details={"noticePeriod": "30", "currentCtc": "10 LPA"},
)

HOSTILE = '<script>alert("x")</script><img src=x onerror=alert(1)>'


def test_enquiry_email_for_bd():
    email = enquiry_email(ENQUIRY, "BD@kiaratech.ai", RECEIVED)
    assert email.to == "BD@kiaratech.ai"
    assert email.reply_to == "john@example.com"  # BD replies straight to the sender
    assert email.subject == "Website enquiry: Invoice automation"
    for text in ("John Doe", "john@example.com", "Example Ltd", "Invoice automation", "20 Nov 2026, 14:03 UTC"):
        assert text in email.html
    assert "Three sites.<br>About 4,000 invoices a month." in email.html


def test_application_email_for_hr():
    email = application_email(APPLICATION, "jobs@kiaratech.ai", "Jane Doe - Senior Backend Engineer - 2026-11-20.pdf", RECEIVED)
    assert email.to == "jobs@kiaratech.ai"
    assert email.reply_to == "jane@example.com"
    assert email.subject == "Job application: Senior Backend Engineer - Jane Doe"
    expected = [
        "Senior Backend Engineer (senior-backend-engineer)",
        "+44 20 7946 0000",
        "London",
        "Notice period",
        "Current CTC",
        "10 LPA",
        "Available from January.",
        "Attached: Jane Doe - Senior Backend Engineer - 2026-11-20.pdf",
    ]
    for text in expected:
        assert text in email.html
    assert "Do not open the attached CV straight from this e-mail" in email.html
    assert "Not given" in email.html  # empty LinkedIn is shown as such, not as a blank


def test_candidate_confirmation_greets_by_name_and_role():
    email = confirmation_email(APPLICATION)
    assert email.to == "jane@example.com"
    assert email.reply_to is None
    assert email.subject == "We have received your application"
    assert "Hi Jane," in email.html
    assert "applying for the <b>Senior Backend Engineer</b> role" in email.html
    assert "hiring team will review it" in email.html
    for private in ("Doe", "+44", "London", "Available from January."):  # only first name and role are repeated
        assert private not in email.html


# Every live job title (frontend/src/content/jobs.ts) must be accepted, or candidates get the generic wording.
REAL_TITLES = [
    "Senior Support Manager – Application & Production Support",
    "Product Support Engineer – C# / .NET / Java, SQL",
    "Senior Backend Engineer",
    "Senior Solution Architect",
    "Software Engineer – C# / .NET",
    "Scrum Master",
    "UX Engineer",
    "Manual Tester",
    "AI Intern",
    "Business Development Administrator / MBA HR Intern",
    "LinkedIn Marketing Executive",
]


@pytest.mark.parametrize("title", REAL_TITLES)
def test_real_job_titles_appear_in_the_confirmation(title):
    html_body = confirmation_email(dataclasses.replace(APPLICATION, role_title=title)).html
    assert "applying for the <b>" in html_body


@pytest.mark.parametrize("first_name", ["Zoë", "Jean-Luc", "O'Doe", "Mary Ann", "Анна", "李"])
def test_real_names_are_used(first_name):
    assert f"Hi {first_name}," in confirmation_email(dataclasses.replace(APPLICATION, first_name=first_name)).html.replace(
        "&#x27;", "'"
    )


@pytest.mark.parametrize(
    "first_name",
    ["Win a prize at evil.example", "Visit www", "jane@evil.example", "Jane2", "J. Doe", "x" * 41, HOSTILE, "https"],
)
def test_suspicious_names_fall_back_to_a_plain_greeting(first_name):
    html_body = confirmation_email(dataclasses.replace(APPLICATION, first_name=first_name)).html
    assert "Hi," in html_body
    assert "evil" not in html_body and "www" not in html_body and "script" not in html_body


@pytest.mark.parametrize(
    "role_title",
    [
        "Claim your prize at evil.example",
        "Apply at https://evil.example",
        "Visit www dot evil",
        "Email boss@evil.example",
        HOSTILE,
        "Role " * 30,  # too long
        "Role‮esrever",  # control/format characters
    ],
)
def test_suspicious_roles_fall_back_to_generic_wording(role_title):
    html_body = confirmation_email(dataclasses.replace(APPLICATION, role_title=role_title)).html
    assert "Thank you for applying to Kiaratech Solutions." in html_body
    assert "applying for the <b>" not in html_body
    for bad in ("evil", "https", "www", "script", "boss@"):
        assert bad not in html_body


def test_visitor_input_is_escaped_everywhere():
    enquiry = ENQUIRY.model_copy(update={"first_name": HOSTILE, "company": HOSTILE, "topic": HOSTILE, "message": HOSTILE})
    application = dataclasses.replace(APPLICATION, first_name=HOSTILE, role_title=HOSTILE, cover_note=HOSTILE, location=HOSTILE)
    for email in (
        enquiry_email(enquiry, "bd@kiaratech.ai", RECEIVED),
        application_email(application, "jobs@kiaratech.ai", "cv.pdf", RECEIVED),
    ):
        assert "<script" not in email.html and "<img" not in email.html
        assert "&lt;script&gt;" in email.html


def test_subjects_stay_on_one_line():
    enquiry = ENQUIRY.model_copy(update={"topic": "Line one\r\nBcc: someone@evil.example\n\nmore"})
    subject = enquiry_email(enquiry, "bd@kiaratech.ai", RECEIVED).subject
    assert "\n" not in subject and "\r" not in subject
    assert subject == "Website enquiry: Line one Bcc: someone@evil.example more"
    assert len(enquiry_email(ENQUIRY.model_copy(update={"topic": "x" * 500}), "b", RECEIVED).subject) <= 140


# --- CV attachment name ---


def named(first="Jane", last="Doe", role="Senior Backend Engineer") -> Application:
    return dataclasses.replace(APPLICATION, first_name=first, last_name=last, role_title=role)


def test_cv_file_name_is_readable():
    assert cv_file_name(named(), "pdf", TODAY) == "Jane Doe - Senior Backend Engineer - 2026-11-20.pdf"
    accented = cv_file_name(named(first="Zoë", last="O'Doe"), "docx", TODAY)
    assert accented == "Zoë O'Doe - Senior Backend Engineer - 2026-11-20.docx"


@pytest.mark.parametrize(
    ("first", "last", "role", "expected_person", "expected_role"),
    [
        ("../../etc", "passwd", "Role", "etc passwd", "Role"),  # no path tricks
        ('Ja"ne*', "<Doe>?", "QA|Lead: #1 %", "Ja ne Doe", "QA Lead 1"),  # characters unsafe in file names
        ("  Jane  ", "\x00Doe\x07", "  Data   Analyst  ", "Jane Doe", "Data Analyst"),  # whitespace and control chars
        ("...", "...", "...", "Applicant", "Role"),  # nothing usable left
    ],
)
def test_cv_file_name_strips_unsafe_input(first, last, role, expected_person, expected_role):
    name = cv_file_name(named(first, last, role), "pdf", TODAY)
    assert name == f"{expected_person} - {expected_role} - 2026-11-20.pdf"
    assert not re.search(r'["*:<>?/\\|#%~&{}\x00-\x1f]', name)


def test_cv_file_name_length_is_bounded():
    assert len(cv_file_name(named("A" * 60, "B" * 60, "R" * 200), "docx", TODAY)) <= 181
