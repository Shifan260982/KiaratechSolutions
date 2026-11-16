"""Kiaratech website API. Phase 2: enquiry and job-application endpoints (see PLAN.md)."""

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings, load_settings

logger = logging.getLogger("kiaratech.api")

# An API returns no HTML, so lock the response down completely.
SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "Cross-Origin-Resource-Policy": "same-site",
}


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    docs = None if settings.is_production else "/docs"
    app = FastAPI(
        title="Kiaratech API",
        docs_url=docs,
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_methods=["POST"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
        max_age=600,
    )

    @app.middleware("http")
    async def request_context(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        try:
            response = await call_next(request)
        except Exception:
            # Log the request ID and exception only; never the body, which holds personal data.
            logger.exception("unhandled error request_id=%s path=%s", request_id, request.url.path)
            response = JSONResponse(
                {"title": "Something went wrong. Please try again later.", "requestId": request_id}, status_code=500
            )
        response.headers.update(SECURITY_HEADERS)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "request_id=%s method=%s path=%s status=%s", request_id, request.method, request.url.path, response.status_code
        )
        return response

    @app.get("/health", include_in_schema=False)
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
