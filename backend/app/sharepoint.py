"""Writes submissions to SharePoint and notifies staff through Outlook, both via Microsoft Graph.

The API keeps nothing itself. Auth is the app's Managed Identity, granted Sites.Selected (the one site)
and Mail.Send (restricted to the sender mailbox by an Exchange application access policy).
"""

import logging
import re
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import UTC, date, datetime
from typing import Protocol
from urllib.parse import quote

import httpx2

from app.application_rules import DETAIL_FIELDS, Application
from app.validation import Enquiry

logger = logging.getLogger("kiaratech.sharepoint")

GRAPH = "https://graph.microsoft.com/v1.0"
GRAPH_SCOPE = "https://graph.microsoft.com/.default"
UPLOAD_CHUNK = 12 * 320 * 1024  # Graph requires upload chunks in multiples of 320 KiB


# Characters SharePoint rejects in file names, characters that change a path, and control characters.
_UNSAFE_IN_FILE_NAME = re.compile(r'["*:<>?/\\|#%~&{}\x00-\x1f\x7f]+')


def cv_file_name(application: Application, extension: str, today: date, suffix: str) -> str:
    """A readable, unique CV name, e.g. 'Priya Shah - Senior Backend Engineer - 2026-11-17 - 3f9c1a2b.pdf'.

    Built only from validated fields, never from the applicant's own file name. The extension comes from the
    content check, and the suffix keeps two applicants with the same name apart. At most about 200 characters,
    well inside SharePoint's 255-character limit.
    """

    def clean(text: str, limit: int) -> str:
        text = " ".join(_UNSAFE_IN_FILE_NAME.sub(" ", text).split())
        return text[:limit].strip(" .")

    person = clean(f"{application.first_name} {application.last_name}", 80) or "Applicant"
    role = clean(application.role_title, 80) or "Role"
    return f"{person} - {role} - {today.isoformat()} - {suffix}.{extension}"


class StoreUnavailable(Exception):
    """Storage failed, so the visitor must retry. Nothing was kept."""


class SubmissionStore(Protocol):
    async def save_enquiry(self, enquiry: Enquiry) -> None: ...

    async def save_application(self, application: Application, cv: bytes, extension: str) -> None: ...


@dataclass(frozen=True)
class EnquiriesTarget:
    list_id: str
    recipient: str


@dataclass(frozen=True)
class ApplicationsTarget:
    list_id: str
    cv_drive_id: str  # the private document library that holds CVs
    recipient: str


class GraphStore:
    def __init__(
        self,
        client: httpx2.AsyncClient,
        get_token: Callable[[], Awaitable[str]],
        *,
        site_id: str,
        mail_sender: str,
        enquiries: EnquiriesTarget | None,
        applications: ApplicationsTarget | None,
    ) -> None:
        self._client = client
        self._get_token = get_token
        self._site_url = f"{GRAPH}/sites/{quote(site_id, safe=',')}"
        self._send_mail_url = f"{GRAPH}/users/{quote(mail_sender)}/sendMail"
        self._enquiries = enquiries
        self._applications = applications

    async def save_enquiry(self, enquiry: Enquiry) -> None:
        if self._enquiries is None:
            logger.error("enquiry refused: enquiries are not configured")
            raise StoreUnavailable
        item = await self._request(
            "POST",
            f"{self._site_url}/lists/{quote(self._enquiries.list_id)}/items",
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
        await self._notify_saved(self._enquiries.recipient, "New website enquiry", item)

    async def save_application(self, application: Application, cv: bytes, extension: str) -> None:
        target = self._applications
        if target is None:
            logger.error("application refused: applications are not configured")
            raise StoreUnavailable
        name = cv_file_name(application, extension, datetime.now(UTC).date(), uuid.uuid4().hex[:8])
        file = await self._upload(target.cv_drive_id, name, cv)
        labels = {key: DETAIL_FIELDS[key].label for key in application.details}
        details = "\n".join(f"{labels[key][0].upper()}{labels[key][1:]}: {value}" for key, value in application.details.items())
        try:
            item = await self._request(
                "POST",
                f"{self._site_url}/lists/{quote(target.list_id)}/items",
                {
                    "fields": {
                        "Title": application.role_title,
                        "RoleId": application.role_id,
                        "FirstName": application.first_name,
                        "LastName": application.last_name,
                        "Email": application.email,
                        "Phone": application.phone,
                        "Location": application.location,
                        "LinkedIn": application.linked_in,
                        "Details": details,
                        "CoverNote": application.cover_note,
                        "CvUrl": file.get("webUrl", ""),
                        "Status": "New",
                    }
                },
            )
        except StoreUnavailable:
            # Without its list item nobody would find this CV, so remove it rather than keep personal data unseen.
            await self._delete_file(target.cv_drive_id, file.get("id", ""))
            raise
        await self._notify_saved(target.recipient, "New job application", item)

    async def _upload(self, drive_id: str, name: str, content: bytes) -> dict:
        """Resumable upload: Graph's simple upload stops at 4 MB and CVs may be 5 MB."""
        session = await self._request(
            "POST",
            f"{GRAPH}/drives/{quote(drive_id)}/root:/{quote(name, safe='')}:/createUploadSession",
            {"item": {"@microsoft.graph.conflictBehavior": "fail"}},
        )
        upload_url = session.get("uploadUrl", "")
        if not upload_url.startswith("https://"):
            logger.error("graph returned an unusable upload URL")
            raise StoreUnavailable
        total = len(content)
        result: dict = {}
        for start in range(0, total, UPLOAD_CHUNK):
            chunk = content[start : start + UPLOAD_CHUNK]
            headers = {"Content-Range": f"bytes {start}-{start + len(chunk) - 1}/{total}"}
            try:
                # The upload URL carries its own authorisation; sending our token to it is a documented mistake.
                result = await self._send("PUT", upload_url, content=chunk, headers=headers, auth=False)
            except StoreUnavailable:
                await self._send_quietly("DELETE", upload_url, auth=False)  # cancel the session
                raise
        return result

    async def _delete_file(self, drive_id: str, item_id: str) -> None:
        if not await self._send_quietly("DELETE", f"{GRAPH}/drives/{quote(drive_id)}/items/{quote(item_id)}"):
            logger.error("orphaned CV left in SharePoint, delete it by hand item_id=%s", item_id)

    async def _notify_saved(self, recipient: str, subject: str, item: dict) -> None:
        # The submission is saved. A failed email must not make the visitor resubmit and create a duplicate.
        # shortcut: no automatic resend; staff also work from the list, and the error log raises an alert.
        # The email carries a link only: personal data stays in SharePoint, behind its permissions.
        body = f"A new submission arrived from the website.\n\nOpen it in SharePoint: {item.get('webUrl', '')}"
        try:
            await self._request(
                "POST",
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
        except StoreUnavailable:
            logger.error("submission saved but notification failed item_id=%s", item.get("id"))

    async def _request(self, method: str, url: str, payload: dict) -> dict:
        return await self._send(method, url, json=payload)

    async def _send_quietly(self, method: str, url: str, auth: bool = True) -> bool:
        try:
            await self._send(method, url, auth=auth)
        except StoreUnavailable:
            return False
        return True

    async def _send(self, method: str, url: str, *, auth: bool = True, **kwargs) -> dict:
        try:
            headers = kwargs.pop("headers", {})
            if auth:
                headers["Authorization"] = f"Bearer {await self._get_token()}"
            response = await self._client.request(method, url, headers=headers, **kwargs)
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
