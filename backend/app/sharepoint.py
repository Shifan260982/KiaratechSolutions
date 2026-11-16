"""Writes submissions to SharePoint and notifies staff through Outlook, both via Microsoft Graph.

The API keeps nothing itself. Auth is the app's Managed Identity, granted Sites.Selected (the one site)
and Mail.Send (restricted to the sender mailbox by an Exchange application access policy).
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Protocol
from urllib.parse import quote

import httpx2

from app.validation import Enquiry

logger = logging.getLogger("kiaratech.sharepoint")

GRAPH = "https://graph.microsoft.com/v1.0"
GRAPH_SCOPE = "https://graph.microsoft.com/.default"


class StoreUnavailable(Exception):
    """Storage failed, so the visitor must retry. Nothing was kept."""


class SubmissionStore(Protocol):
    async def save_enquiry(self, enquiry: Enquiry) -> None: ...


class GraphStore:
    def __init__(
        self,
        client: httpx2.AsyncClient,
        get_token: Callable[[], Awaitable[str]],
        *,
        site_id: str,
        enquiries_list_id: str,
        mail_sender: str,
        enquiry_recipient: str,
    ) -> None:
        self._client = client
        self._get_token = get_token
        self._enquiries_url = f"{GRAPH}/sites/{quote(site_id, safe=',')}/lists/{quote(enquiries_list_id)}/items"
        self._send_mail_url = f"{GRAPH}/users/{quote(mail_sender)}/sendMail"
        self._enquiry_recipient = enquiry_recipient

    async def save_enquiry(self, enquiry: Enquiry) -> None:
        item = await self._post(
            self._enquiries_url,
            {
                "fields": {
                    "Title": enquiry.topic,
                    "FirstName": enquiry.first_name,
                    "LastName": enquiry.last_name,
                    "Email": enquiry.email,
                    "Company": enquiry.company,
                    "Message": enquiry.message,
                    "Status": "New",
                }
            },
        )
        # The enquiry is saved. A failed email must not make the visitor resubmit and create a duplicate.
        # shortcut: no automatic resend; staff also work from the list, and the error log raises an alert.
        try:
            await self._notify(self._enquiry_recipient, "New website enquiry", item.get("webUrl", ""))
        except StoreUnavailable:
            logger.error("enquiry saved but notification failed item_id=%s", item.get("id"))

    async def _notify(self, recipient: str, subject: str, link: str) -> None:
        # The email carries a link only: personal data stays in SharePoint, behind its permissions.
        body = f"A new submission arrived from the website.\n\nOpen it in SharePoint: {link}"
        await self._post(
            self._send_mail_url,
            {
                "message": {
                    "subject": subject,
                    "body": {"contentType": "Text", "content": body},
                    "toRecipients": [{"emailAddress": {"address": recipient}}],
                },
                "saveToSentItems": False,
            },
        )

    async def _post(self, url: str, payload: dict) -> dict:
        try:
            token = await self._get_token()
            response = await self._client.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
        except Exception as error:
            # Token or network failure. Log the type only; messages can echo request data.
            logger.error("graph request failed error=%s", type(error).__name__)
            raise StoreUnavailable from error
        if response.status_code >= 400:
            logger.error(
                "graph request rejected status=%s request_id=%s", response.status_code, response.headers.get("request-id")
            )
            raise StoreUnavailable
        return response.json() if response.content else {}


def managed_identity_token(client_id: str | None) -> Callable[[], Awaitable[str]]:
    """Graph token from the app's Managed Identity. The credential caches and refreshes tokens."""
    import anyio
    from azure.identity import ManagedIdentityCredential

    credential = ManagedIdentityCredential(client_id=client_id)

    async def get_token() -> str:
        token = await anyio.to_thread.run_sync(credential.get_token, GRAPH_SCOPE)
        return token.token

    return get_token
