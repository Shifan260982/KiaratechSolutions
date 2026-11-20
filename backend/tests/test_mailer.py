import base64
import json
import logging

import httpx2
import pytest

from app.mailer import INLINE_ATTACHMENT_LIMIT, UPLOAD_CHUNK, GraphMailer, MailUnavailable
from tests.test_emails import APPLICATION, ENQUIRY

pytestmark = pytest.mark.anyio

MAILBOX = "/v1.0/users/noreply@kiaratech.ai"
MAILBOX_RAW = "/v1.0/users/noreply%40kiaratech.ai"  # as sent: the address is URL-encoded
UPLOAD_URL = "https://outlook.office.com/upload/session-1"
SMALL_CV = b"%PDF-1.7 small"
LARGE_CV = b"%PDF-" + b"x" * (INLINE_ATTACHMENT_LIMIT + UPLOAD_CHUNK)  # needs the draft route, two chunks


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


async def token() -> str:
    return "test-token"


def graph(fail_on: str | None = None, fail_status: int = 500):
    """Fake Graph. `fail_on` is a fragment of the URL (or 'PUT') whose request fails."""

    def handler(request: httpx2.Request) -> httpx2.Response:
        url = str(request.url)
        if fail_on and (fail_on in url or fail_on == request.method):
            return httpx2.Response(fail_status)
        if url.endswith("/messages") and request.method == "POST":
            return httpx2.Response(201, json={"id": "draft/1"})
        if url.endswith("/createUploadSession"):
            return httpx2.Response(201, json={"uploadUrl": UPLOAD_URL})
        if request.method == "PUT":
            return httpx2.Response(200)
        return httpx2.Response(202)

    return handler


def make_mailer(handler, enquiry_to="BD@kiaratech.ai", application_to="jobs@kiaratech.ai"):
    seen: list[httpx2.Request] = []

    def record(request: httpx2.Request) -> httpx2.Response:
        seen.append(request)
        return handler(request)

    mailer = GraphMailer(
        httpx2.AsyncClient(transport=httpx2.MockTransport(record)),
        token,
        sender="noreply@kiaratech.ai",
        enquiry_recipient=enquiry_to,
        application_recipient=application_to,
    )
    return mailer, seen


def message(request: httpx2.Request) -> dict:
    return json.loads(request.content)["message"]


async def test_enquiry_goes_to_bd_from_noreply():
    mailer, seen = make_mailer(graph())
    await mailer.send_enquiry(ENQUIRY)
    (request,) = seen
    assert request.url.path == f"{MAILBOX}/sendMail"
    assert request.headers["Authorization"] == "Bearer test-token"
    body = json.loads(request.content)
    assert body["saveToSentItems"] is False
    msg = body["message"]
    assert msg["toRecipients"] == [{"emailAddress": {"address": "BD@kiaratech.ai"}}]
    assert msg["replyTo"] == [{"emailAddress": {"address": "john@example.com"}}]
    assert msg["body"]["contentType"] == "HTML" and "Invoice automation" in msg["body"]["content"]
    assert "attachments" not in msg


async def test_application_sends_hr_the_cv_then_confirms_to_the_candidate():
    mailer, seen = make_mailer(graph())
    await mailer.send_application(APPLICATION, SMALL_CV, "pdf")
    hr, candidate = seen
    hr_msg = message(hr)
    assert hr_msg["toRecipients"] == [{"emailAddress": {"address": "jobs@kiaratech.ai"}}]
    (attachment,) = hr_msg["attachments"]
    assert base64.b64decode(attachment["contentBytes"]) == SMALL_CV
    assert attachment["contentType"] == "application/pdf"
    assert attachment["name"].startswith("Jane Doe - Senior Backend Engineer - ") and attachment["name"].endswith(".pdf")
    assert json.loads(hr.content)["saveToSentItems"] is False

    candidate_msg = message(candidate)
    assert candidate_msg["toRecipients"] == [{"emailAddress": {"address": "jane@example.com"}}]
    assert "attachments" not in candidate_msg


async def test_word_cv_gets_the_word_content_type():
    mailer, seen = make_mailer(graph())
    await mailer.send_application(APPLICATION, b"PK\x03\x04 docx", "docx")
    assert message(seen[0])["attachments"][0]["contentType"].endswith("wordprocessingml.document")


async def test_large_cv_goes_through_a_draft_and_upload_session():
    mailer, seen = make_mailer(graph())
    await mailer.send_application(APPLICATION, LARGE_CV, "pdf")

    draft, session, *chunks, send, candidate = seen
    assert draft.method == "POST" and draft.url.path == f"{MAILBOX}/messages"
    assert "attachments" not in json.loads(draft.content)
    assert session.url.raw_path.decode() == f"{MAILBOX_RAW}/messages/draft%2F1/attachments/createUploadSession"
    item = json.loads(session.content)["AttachmentItem"]
    assert item["size"] == len(LARGE_CV) and item["attachmentType"] == "file"

    assert [c.method for c in chunks] == ["PUT", "PUT"]
    assert all("Authorization" not in c.headers for c in chunks)  # never send our token to the upload URL
    assert b"".join(c.content for c in chunks) == LARGE_CV
    assert chunks[-1].headers["Content-Range"].endswith(f"-{len(LARGE_CV) - 1}/{len(LARGE_CV)}")

    assert send.method == "POST" and send.url.raw_path.decode() == f"{MAILBOX_RAW}/messages/draft%2F1/send"
    assert message(candidate)["toRecipients"] == [{"emailAddress": {"address": "jane@example.com"}}]


async def test_failed_large_upload_deletes_the_draft_and_sends_nothing_else():
    mailer, seen = make_mailer(graph(fail_on="PUT"))
    with pytest.raises(MailUnavailable):
        await mailer.send_application(APPLICATION, LARGE_CV, "pdf")
    assert seen[-1].method == "DELETE" and seen[-1].url.raw_path.decode() == f"{MAILBOX_RAW}/messages/draft%2F1"
    assert not [r for r in seen if r.url.path.endswith("/send") or r.url.path.endswith("/sendMail")]


async def test_undeletable_draft_is_logged_for_manual_removal(caplog):
    def handler(request):
        if request.method in ("PUT", "DELETE"):
            return httpx2.Response(500)
        return graph()(request)

    mailer, _ = make_mailer(handler)
    with caplog.at_level(logging.ERROR), pytest.raises(MailUnavailable):
        await mailer.send_application(APPLICATION, LARGE_CV, "pdf")
    assert "draft with a CV left in the noreply mailbox" in caplog.text


async def test_failed_hr_email_raises_and_the_candidate_gets_nothing():
    mailer, seen = make_mailer(graph(fail_on="sendMail"))
    with pytest.raises(MailUnavailable):
        await mailer.send_application(APPLICATION, SMALL_CV, "pdf")
    assert len(seen) == 1  # only the failed HR attempt


async def test_failed_confirmation_is_logged_not_raised(caplog):
    calls = []

    def handler(request):
        calls.append(request)
        return httpx2.Response(202 if len(calls) == 1 else 500)  # HR succeeds, the confirmation fails

    mailer, _ = make_mailer(handler)
    with caplog.at_level(logging.ERROR):
        await mailer.send_application(APPLICATION, SMALL_CV, "pdf")  # no exception: HR has the application
    assert "candidate confirmation failed" in caplog.text
    assert "jane@example.com" not in caplog.text and "Jane" not in caplog.text


@pytest.mark.parametrize("status", [400, 401, 403, 429, 500, 503])
async def test_graph_errors_become_mail_unavailable(status):
    mailer, _ = make_mailer(graph(fail_on="sendMail", fail_status=status))
    with pytest.raises(MailUnavailable):
        await mailer.send_enquiry(ENQUIRY)


async def test_network_failure_becomes_mail_unavailable():
    def down(request):
        raise httpx2.ConnectError("down")

    mailer, _ = make_mailer(down)
    with pytest.raises(MailUnavailable):
        await mailer.send_enquiry(ENQUIRY)


async def test_unconfigured_recipient_refuses_without_calling_graph():
    mailer, seen = make_mailer(graph(), enquiry_to=None, application_to=None)
    with pytest.raises(MailUnavailable):
        await mailer.send_enquiry(ENQUIRY)
    with pytest.raises(MailUnavailable):
        await mailer.send_application(APPLICATION, SMALL_CV, "pdf")
    assert seen == []
