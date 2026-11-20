"""Sends form submissions by e-mail through Microsoft Graph, from the noreply mailbox. Nothing is stored.

Auth is the app's managed identity: no password. It needs the Graph application permissions Mail.Send, and
Mail.ReadWrite for CVs over 3 MB (sent through a draft with an upload session), both restricted to the noreply
mailbox in Exchange Online.
"""

import base64
import logging
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime
from typing import Protocol
from urllib.parse import quote

import httpx2

from app.application_rules import Application
from app.emails import Email, application_email, confirmation_email, cv_file_name, enquiry_email
from app.validation import Enquiry

logger = logging.getLogger("kiaratech.mailer")

GRAPH = "https://graph.microsoft.com/v1.0"
GRAPH_SCOPE = "https://graph.microsoft.com/.default"
# sendMail accepts attachments up to 3 MB; larger ones need a draft and an upload session.
INLINE_ATTACHMENT_LIMIT = 3 * 1024 * 1024
UPLOAD_CHUNK = 12 * 320 * 1024  # under Graph's 4 MB per request, in multiples of 320 KiB
CONTENT_TYPES = {
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class MailUnavailable(Exception):
    """The e-mail could not be sent, so the visitor must retry. Nothing was kept."""


class Mailer(Protocol):
    async def send_enquiry(self, enquiry: Enquiry) -> None: ...

    async def send_application(self, application: Application, cv: bytes, extension: str) -> None: ...


class GraphMailer:
    def __init__(
        self,
        client: httpx2.AsyncClient,
        get_token: Callable[[], Awaitable[str]],
        *,
        sender: str,
        enquiry_recipient: str | None,
        application_recipient: str | None,
    ) -> None:
        self._client = client
        self._get_token = get_token
        self._mailbox = f"{GRAPH}/users/{quote(sender)}"
        self._enquiry_recipient = enquiry_recipient
        self._application_recipient = application_recipient

    async def send_enquiry(self, enquiry: Enquiry) -> None:
        if not self._enquiry_recipient:
            logger.error("enquiry refused: ENQUIRY_RECIPIENT is not configured")
            raise MailUnavailable
        await self._send(enquiry_email(enquiry, self._enquiry_recipient, datetime.now(UTC)))

    async def send_application(self, application: Application, cv: bytes, extension: str) -> None:
        if not self._application_recipient:
            logger.error("application refused: APPLICATION_RECIPIENT is not configured")
            raise MailUnavailable
        now = datetime.now(UTC)
        name = cv_file_name(application, extension, now.date())
        # HR first: if this fails, the visitor is asked to retry and nothing has been sent anywhere.
        await self._send(application_email(application, self._application_recipient, name, now), (name, extension, cv))
        try:
            await self._send(confirmation_email(application))
        except MailUnavailable:
            # HR already has the application; failing now would make the visitor resubmit and duplicate it.
            logger.error("application sent to HR but the candidate confirmation failed")

    async def _send(self, email: Email, attachment: tuple[str, str, bytes] | None = None) -> None:
        message: dict = {
            "subject": email.subject,
            "body": {"contentType": "HTML", "content": email.html},
            "toRecipients": [{"emailAddress": {"address": email.to}}],
        }
        if email.reply_to:
            message["replyTo"] = [{"emailAddress": {"address": email.reply_to}}]

        if attachment is None or len(attachment[2]) <= INLINE_ATTACHMENT_LIMIT:
            if attachment:
                name, extension, data = attachment
                message["attachments"] = [
                    {
                        "@odata.type": "#microsoft.graph.fileAttachment",
                        "name": name,
                        "contentType": CONTENT_TYPES[extension],
                        "contentBytes": base64.b64encode(data).decode("ascii"),
                    }
                ]
            await self._request("POST", f"{self._mailbox}/sendMail", json={"message": message, "saveToSentItems": False})
            return
        await self._send_with_large_attachment(message, *attachment)

    async def _send_with_large_attachment(self, message: dict, name: str, extension: str, data: bytes) -> None:
        draft = await self._request("POST", f"{self._mailbox}/messages", json=message)
        draft_url = f"{self._mailbox}/messages/{quote(draft.get('id', ''), safe='')}"
        item = {"attachmentType": "file", "name": name, "size": len(data), "contentType": CONTENT_TYPES[extension]}
        try:
            session = await self._request("POST", f"{draft_url}/attachments/createUploadSession", json={"AttachmentItem": item})
            upload_url = session.get("uploadUrl", "")
            if not upload_url.startswith("https://"):
                logger.error("graph returned an unusable upload URL")
                raise MailUnavailable
            for start in range(0, len(data), UPLOAD_CHUNK):
                chunk = data[start : start + UPLOAD_CHUNK]
                headers = {"Content-Range": f"bytes {start}-{start + len(chunk) - 1}/{len(data)}"}
                # The upload URL carries its own authorisation; sending our token to it is a documented mistake.
                await self._request("PUT", upload_url, content=chunk, headers=headers, auth=False)
            await self._request("POST", f"{draft_url}/send")
        except MailUnavailable:
            # The draft holds the CV: never leave it behind in the noreply mailbox.
            try:
                await self._request("DELETE", draft_url)
            except MailUnavailable:
                logger.error("draft with a CV left in the noreply mailbox, delete it by hand")
            raise

    async def _request(self, method: str, url: str, *, auth: bool = True, **kwargs) -> dict:
        try:
            headers = kwargs.pop("headers", {})
            if auth:
                headers["Authorization"] = f"Bearer {await self._get_token()}"
            response = await self._client.request(method, url, headers=headers, **kwargs)
        except Exception as error:
            # Token or network failure. Log the type only; messages can echo request data.
            logger.error("graph request failed error=%s", type(error).__name__)
            raise MailUnavailable from error
        if response.status_code >= 400:
            logger.error(
                "graph request rejected status=%s request_id=%s", response.status_code, response.headers.get("request-id")
            )
            raise MailUnavailable
        return response.json() if response.content else {}


def managed_identity_token(client_id: str | None) -> Callable[[], Awaitable[str]]:
    """Graph token from the app's managed identity. The credential caches and refreshes tokens."""
    import anyio
    from azure.identity import ManagedIdentityCredential

    credential = ManagedIdentityCredential(client_id=client_id)

    async def get_token() -> str:
        token = await anyio.to_thread.run_sync(credential.get_token, GRAPH_SCOPE)
        return token.token

    return get_token
