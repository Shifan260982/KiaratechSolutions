import io
import zipfile

import pytest

from app.application_rules import CV_MAX_BYTES, WRONG_TYPE, cv_error, validate_application

VALID = {
    "roleId": "support-manager",
    "roleTitle": "Senior Support Manager",
    "firstName": "Priya",
    "lastName": "Shah",
    "email": "priya@example.com",
    "phone": "+91 98765 43210",
    "location": "Pune",
    "linkedIn": "",
    "coverNote": "",
    "totalExperience": "15.5",
    "currentCtc": "30 LPA",
    "expectedCtc": "36 LPA",
    "noticePeriod": "60",
    "teamSize": "12",
    "itilCertification": "ITIL 4",
}


def errors(**changes) -> dict[str, str]:
    return validate_application({**VALID, **changes})[1]


def test_accepts_a_complete_application():
    application, found = validate_application(VALID)
    assert found == {}
    assert application.details["itilCertification"] == "ITIL 4"


def test_sanitises_values():
    application, _ = validate_application({**VALID, "firstName": " Pri\x00ya ", "email": " PRIYA@Example.com"})
    assert application.first_name == "Priya"
    assert application.email == "priya@example.com"


def test_details_are_optional_when_not_sent():
    basic = {
        key: value
        for key, value in VALID.items()
        if key not in ("totalExperience", "currentCtc", "expectedCtc", "noticePeriod", "teamSize", "itilCertification")
    }
    assert validate_application(basic)[1] == {}


def test_sent_details_must_not_be_empty():
    assert set(errors(totalExperience="", itilCertification="")) == {"totalExperience", "itilCertification"}


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("noticePeriod", "30.5"),
        ("totalExperience", "-1"),
        ("totalExperience", "51"),
        ("teamSize", "abc"),
        ("teamSize", "nan"),
        ("teamSize", "inf"),
        ("currentCtc", "x" * 41),
        ("itilCertification", "<b>x</b>"),
    ],
)
def test_rejects_bad_details(field, value):
    assert field in errors(**{field: value})


def test_requires_basic_fields():
    found = validate_application({})[1]
    assert set(found) == {"roleId", "firstName", "lastName", "email", "phone", "location"}


@pytest.mark.parametrize("phone", ["12ab", "123", "+", "1" * 21])
def test_rejects_bad_phones(phone):
    assert "phone" in errors(phone=phone)


@pytest.mark.parametrize("url", ["javascript:alert(1)", "http://www.linkedin.com/in/x", "https://x y", "https://" + "a" * 200])
def test_rejects_bad_linkedin(url):
    assert "linkedIn" in errors(linkedIn=url)


def test_accepts_https_linkedin():
    assert "linkedIn" not in errors(linkedIn="https://www.linkedin.com/in/example")


def test_limits_role_and_text_lengths():
    assert "roleId" in errors(roleId="x" * 101)
    assert "location" in errors(location="x" * 101)
    assert "coverNote" in errors(coverNote="x" * 2001)


# --- CV files ---


def docx(*names: str) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        for name in names:
            archive.writestr(name, "<x/>")
    return buffer.getvalue()


WORD = docx("[Content_Types].xml", "word/document.xml")
PDF = b"%PDF-1.7\n..."
DOC = bytes.fromhex("d0cf11e0a1b11ae1") + b"\0" * 100


@pytest.mark.parametrize(("name", "content"), [("cv.pdf", PDF), ("CV.PDF", PDF), ("cv.doc", DOC), ("my cv.docx", WORD)])
def test_accepts_real_documents(name, content):
    assert cv_error(name, content) is None


@pytest.mark.parametrize(
    ("name", "content"),
    [
        ("cv.exe", PDF),
        ("cv", PDF),
        ("cv.pdf", b"MZ\x90\x00 not a pdf"),
        ("cv.pdf", WORD),
        ("cv.doc", PDF),
        ("cv.docx", b"PK\x03\x04 broken zip"),
        ("cv.docx", docx("[Content_Types].xml", "xl/workbook.xml")),
        ("cv.docx", docx("[Content_Types].xml", "word/document.xml", "word/vbaProject.bin")),
    ],
)
def test_rejects_disguised_or_unsafe_files(name, content):
    assert cv_error(name, content) == WRONG_TYPE


def test_rejects_empty_and_oversized_files():
    assert "empty" in cv_error("cv.pdf", b"")
    assert "5 MB" in cv_error("cv.pdf", b"%PDF-" + b"x" * CV_MAX_BYTES)
