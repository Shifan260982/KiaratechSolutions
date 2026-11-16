import json
import logging

import httpx2
import pytest

from app.sharepoint import GraphStore, StoreUnavailable
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
        enquiries_list_id="list-1",
        mail_sender="noreply@kiaratechs.com",
        enquiry_recipient="bd@kiaratechs.com",
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

    assert mail.url.path == "/v1.0/users/noreply@kiaratechs.com/sendMail"
    message = json.loads(mail.content)["message"]
    assert message["toRecipients"] == [{"emailAddress": {"address": "bd@kiaratechs.com"}}]
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
