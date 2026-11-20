import dataclasses
import json
import logging
import re
from datetime import date

import httpx2
import pytest

from app.application_rules import Application
from app.sharepoint import UPLOAD_CHUNK, ApplicationsTarget, EnquiriesTarget, GraphStore, StoreUnavailable, cv_file_name
from app.validation import Enquiry

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


ENQUIRY = Enquiry(
    first_name="Alex",
    last_name="Morgan",
    email="alex@example.com",
    company="Example Ltd",
    topic="Invoice automation",
    message="We want to automate invoice processing across three sites.",
)


async def token() -> str:
    return "test-token"


def make_store(handler) -> tuple[GraphStore, list[httpx2.Request]]:
    seen: list[httpx2.Request] = []

    def record(request: httpx2.Request) -> httpx2.Response:
        seen.append(request)
        return handler(request)

    client = httpx2.AsyncClient(transport=httpx2.MockTransport(record))
    store = GraphStore(
        client,
        token,
        site_id="contoso.sharepoint.com,1111,2222",
        mail_sender="noreply@kiaratech.ai",
        enquiries=EnquiriesTarget("list-1", "bd@kiaratech.ai"),
        applications=ApplicationsTarget("apps-list", "cv-drive", "jobs@kiaratech.ai"),
    )
    return store, seen


def ok(request: httpx2.Request) -> httpx2.Response:
    if request.url.path.endswith("/items"):
        return httpx2.Response(201, json={"id": "7", "webUrl": "https://contoso.sharepoint.com/item/7"})
    return httpx2.Response(202)


async def test_creates_list_item_then_emails_a_link_only():
    store, seen = make_store(ok)
    await store.save_enquiry(ENQUIRY)

    create, mail = seen
    assert create.url.path == "/v1.0/sites/contoso.sharepoint.com,1111,2222/lists/list-1/items"
    assert create.headers["Authorization"] == "Bearer test-token"
    fields = json.loads(create.content)["fields"]
    assert fields["Email"] == "alex@example.com"
    assert fields["Status"] == "New"

    assert mail.url.path == "/v1.0/users/noreply@kiaratech.ai/sendMail"
    message = json.loads(mail.content)["message"]
    assert message["toRecipients"] == [{"emailAddress": {"address": "bd@kiaratech.ai"}}]
    assert "https://contoso.sharepoint.com/item/7" in message["body"]["content"]
    # Personal data stays in SharePoint, never in the email.
    for value in ("Alex", "alex@example.com", "Example Ltd", ENQUIRY.message):
        assert value not in mail.content.decode()


@pytest.mark.parametrize("status", [400, 401, 403, 429, 500, 503])
async def test_failed_save_raises_and_sends_no_email(status):
    store, seen = make_store(lambda request: httpx2.Response(status, json={"error": {"message": "nope"}}))
    with pytest.raises(StoreUnavailable):
        await store.save_enquiry(ENQUIRY)
    assert len(seen) == 1


async def test_network_failure_raises():
    def boom(request):
        raise httpx2.ConnectError("down")

    store, _ = make_store(boom)
    with pytest.raises(StoreUnavailable):
        await store.save_enquiry(ENQUIRY)


async def test_failed_email_still_counts_as_saved(caplog):
    def mail_fails(request):
        return ok(request) if request.url.path.endswith("/items") else httpx2.Response(500)

    store, seen = make_store(mail_fails)
    with caplog.at_level(logging.ERROR):
        await store.save_enquiry(ENQUIRY)  # no exception: the visitor must not resubmit
    assert len(seen) == 2
    assert "notification failed item_id=7" in caplog.text
    assert "alex@example.com" not in caplog.text


# --- Job applications ---

APPLICATION = Application(
    role_id="senior-backend-engineer",
    role_title="Senior Backend Engineer",
    first_name="Priya",
    last_name="Shah",
    email="priya@example.com",
    phone="+91 98765 43210",
    location="Pune",
    linked_in="",
    cover_note="",
    details={"noticePeriod": "60", "currentCtc": "30 LPA"},
)
UPLOAD_URL = "https://contoso.sharepoint.com/upload/session-1"


def graph(*, list_status: int = 201, chunk_status: int | None = None, delete_status: int = 204):
    """Fake Graph for the application flow. `chunk_status` overrides the upload chunk response."""

    def handler(request: httpx2.Request) -> httpx2.Response:
        path = request.url.path
        if path.endswith("/createUploadSession"):
            return httpx2.Response(200, json={"uploadUrl": UPLOAD_URL})
        if str(request.url) == UPLOAD_URL and request.method == "PUT":
            if chunk_status:
                return httpx2.Response(chunk_status)
            end, total = request.headers["Content-Range"].split(" ")[1].split("-")[1].split("/")
            if int(end) + 1 < int(total):
                return httpx2.Response(202, json={"nextExpectedRanges": [f"{int(end) + 1}-"]})
            return httpx2.Response(201, json={"id": "file-9", "webUrl": "https://contoso.sharepoint.com/cvs/file-9.pdf"})
        if request.method == "DELETE":
            return httpx2.Response(delete_status)
        if path.endswith("/items"):
            return httpx2.Response(list_status, json={"id": "12", "webUrl": "https://contoso.sharepoint.com/apps/12"})
        return httpx2.Response(202)

    return handler


def by(seen, method, fragment):
    return [r for r in seen if r.method == method and fragment in str(r.url)]


async def test_uploads_cv_under_descriptive_name_then_creates_item_and_emails_link():
    store, seen = make_store(graph())
    cv = b"%PDF-" + b"x" * (UPLOAD_CHUNK + 1000)  # forces two chunks
    await store.save_application(APPLICATION, cv, "pdf")

    (session,) = by(seen, "POST", "createUploadSession")
    assert re.fullmatch(
        r"/v1\.0/drives/cv-drive/root:/"
        r"Priya Shah - Senior Backend Engineer - \d{4}-\d{2}-\d{2} - [0-9a-f]{8}\.pdf:/createUploadSession",
        session.url.path,
    )
    assert "%20" in session.url.raw_path.decode()  # spaces are encoded in the request itself

    chunks = by(seen, "PUT", UPLOAD_URL)
    assert [c.headers["Content-Range"] for c in chunks] == [
        f"bytes 0-{UPLOAD_CHUNK - 1}/{len(cv)}",
        f"bytes {UPLOAD_CHUNK}-{len(cv) - 1}/{len(cv)}",
    ]
    assert all("Authorization" not in c.headers for c in chunks)  # never send our token to the upload URL
    assert b"".join(c.content for c in chunks) == cv

    (item,) = by(seen, "POST", "/lists/apps-list/items")
    fields = json.loads(item.content)["fields"]
    assert fields["CvUrl"] == "https://contoso.sharepoint.com/cvs/file-9.pdf"
    assert fields["Details"] == "Notice period: 60\nCurrent CTC: 30 LPA"
    assert fields["Status"] == "New"

    (mail,) = by(seen, "POST", "sendMail")
    body = mail.content.decode()
    assert "jobs@kiaratech.ai" in body and "https://contoso.sharepoint.com/apps/12" in body
    assert "priya@example.com" not in body and "Priya" not in body


async def test_failed_list_item_deletes_the_uploaded_cv():
    store, seen = make_store(graph(list_status=500))
    with pytest.raises(StoreUnavailable):
        await store.save_application(APPLICATION, b"%PDF-1", "pdf")
    assert by(seen, "DELETE", "/drives/cv-drive/items/file-9")
    assert not by(seen, "POST", "sendMail")


async def test_failed_cleanup_is_logged_for_manual_removal(caplog):
    store, _ = make_store(graph(list_status=500, delete_status=500))
    with caplog.at_level(logging.ERROR), pytest.raises(StoreUnavailable):
        await store.save_application(APPLICATION, b"%PDF-1", "pdf")
    assert "orphaned CV" in caplog.text and "file-9" in caplog.text


async def test_failed_chunk_cancels_the_upload_session():
    store, seen = make_store(graph(chunk_status=500))
    with pytest.raises(StoreUnavailable):
        await store.save_application(APPLICATION, b"%PDF-1", "pdf")
    (cancel,) = by(seen, "DELETE", UPLOAD_URL)
    assert "Authorization" not in cancel.headers
    assert not by(seen, "POST", "/items")


async def test_refuses_when_applications_are_not_configured():
    store = GraphStore(
        httpx2.AsyncClient(transport=httpx2.MockTransport(lambda r: httpx2.Response(500))),
        token,
        site_id="s",
        mail_sender="noreply@kiaratech.ai",
        enquiries=None,
        applications=None,
    )
    with pytest.raises(StoreUnavailable):
        await store.save_application(APPLICATION, b"%PDF-1", "pdf")
    with pytest.raises(StoreUnavailable):
        await store.save_enquiry(ENQUIRY)


TODAY = date(2026, 11, 17)


def named(first="Priya", last="Shah", role="Senior Backend Engineer") -> Application:
    return dataclasses.replace(APPLICATION, first_name=first, last_name=last, role_title=role)


def test_cv_file_name_is_readable_and_unique():
    assert cv_file_name(named(), "pdf", TODAY, "3f9c1a2b") == "Priya Shah - Senior Backend Engineer - 2026-11-17 - 3f9c1a2b.pdf"
    accented = cv_file_name(named(first="Zoë", last="O'Brien"), "docx", TODAY, "a1")
    assert accented == "Zoë O'Brien - Senior Backend Engineer - 2026-11-17 - a1.docx"


@pytest.mark.parametrize(
    ("first", "last", "role", "expected_person", "expected_role"),
    [
        ("../../etc", "passwd", "Role", "etc passwd", "Role"),  # no path tricks
        ('Al"ex*', "<Morgan>?", "QA|Lead: #1 %", "Al ex Morgan", "QA Lead 1"),  # SharePoint-invalid characters
        ("  Ann  ", "\x00Lee\x07", "  Data   Analyst  ", "Ann Lee", "Data Analyst"),  # whitespace and control chars
        ("...", "...", "...", "Applicant", "Role"),  # nothing usable left
        ("~$Ann", "Lee.", "Dev", "$Ann Lee", "Dev"),  # no leading ~ (SharePoint temp-file prefix), no trailing dot
    ],
)
def test_cv_file_name_strips_unsafe_input(first, last, role, expected_person, expected_role):
    name = cv_file_name(named(first, last, role), "pdf", TODAY, "ab12")
    assert name == f"{expected_person} - {expected_role} - 2026-11-17 - ab12.pdf"
    assert not re.search(r'["*:<>?/\|#%~&{}\x00-\x1f]', name)


def test_cv_file_name_stays_within_sharepoint_limits():
    name = cv_file_name(named("A" * 60, "B" * 60, "R" * 200), "docx", TODAY, "3f9c1a2b")
    assert len(name) <= 255
    assert name.endswith(" - 2026-11-17 - 3f9c1a2b.docx")
