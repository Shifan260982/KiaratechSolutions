"""Request body size limit, enforced while the body streams in (a missing or false Content-Length cannot bypass it)."""

from fastapi import HTTPException
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

TOO_LARGE = {"title": "This request is too large."}


class BodyTooLarge(HTTPException):
    # An HTTPException, so FastAPI passes it through body parsing unchanged instead of turning it into a 400.
    def __init__(self) -> None:
        super().__init__(status_code=413, detail=TOO_LARGE["title"])


class BodySizeLimit:
    def __init__(self, app: ASGIApp, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        declared = dict(scope["headers"]).get(b"content-length")
        if declared is not None and (not declared.isdigit() or int(declared) > self.max_bytes):
            await JSONResponse(TOO_LARGE, status_code=413)(scope, receive, send)
            return

        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise BodyTooLarge
            return message

        await self.app(scope, limited_receive, send)
