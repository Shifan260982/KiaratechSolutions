"""Kiaratech website API. Phase 2: enquiry and job-application endpoints (see PLAN.md)."""

import logging
import time
import uuid
from collections.abc import Callable
from contextlib import asynccontextmanager

import httpx2
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import applications, enquiries
from app.captcha import CaptchaVerifier, TurnstileVerifier
from app.config import Settings, load_settings
from app.limits import BodySizeLimit
from app.ratelimit import Limit, RateLimit
from app.scanner import ClamAvScanner, Scanner
from app.sharepoint import GraphStore, SubmissionStore, managed_identity_token

logger = logging.getLogger("kiaratech.api")

# Largest valid enquiry is about 10 KB of JSON. Only the CV upload route gets more.
MAX_BODY_BYTES = 32 * 1024

# Per visitor IP. Generous for people correcting a mistake; useless for scripts.
RATE_LIMITS = {
    "/api/v1/enquiries": Limit(requests=5, window_seconds=10 * 60),
    "/api/v1/applications": Limit(requests=5, window_seconds=60 * 60),
}

# An API returns no HTML, so lock the response down completely.
SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "Cross-Origin-Resource-Policy": "same-site",
}


def create_app(
    settings: Settings | None = None,
    store: SubmissionStore | None = None,
    scanner: Scanner | None = None,
    captcha: CaptchaVerifier | None = None,
    clock: Callable[[], float] = time.monotonic,
) -> FastAPI:
    """Dependencies are injected by tests; otherwise they are built from settings when configured."""
    settings = settings or load_settings()
    if scanner is None and settings.scanner is not None:
        scanner = ClamAvScanner(settings.scanner.host, settings.scanner.port)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with httpx2.AsyncClient(timeout=30) as client:  # a CV chunk upload can take a while
            if app.state.store is None and settings.graph is not None:
                app.state.store = GraphStore(
                    client,
                    managed_identity_token(settings.graph.client_id),
                    site_id=settings.graph.site_id,
                    mail_sender=settings.graph.mail_sender,
                    enquiries=settings.graph.enquiries,
                    applications=settings.graph.applications,
                )
            if app.state.captcha is None and settings.turnstile_secret:
                app.state.captcha = TurnstileVerifier(client, settings.turnstile_secret, settings.captcha_hostnames)
            yield

    docs = None if settings.is_production else "/docs"
    app = FastAPI(
        title="Kiaratech API",
        docs_url=docs,
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
        lifespan=lifespan,
    )
    app.state.store = store
    app.state.scanner = scanner
    app.state.captcha = captcha
    app.state.trusted_proxy_hops = settings.trusted_proxy_hops
    app.include_router(enquiries.router)
    app.include_router(applications.router)

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, error: RequestValidationError) -> JSONResponse:
        # Wrong types, missing or unknown fields, or malformed JSON. Never echo the submitted values back.
        fields = {str(e["loc"][1]): "This value is not valid." for e in error.errors() if len(e["loc"]) > 1}
        return JSONResponse({"title": "The request is not valid.", "errors": fields}, status_code=400)

    app.add_middleware(BodySizeLimit, max_bytes=MAX_BODY_BYTES, per_path={"/api/v1/applications": applications.MAX_REQUEST_BYTES})
    # Inside CORS, so a 429 still carries CORS headers and the form can show the message.
    app.add_middleware(RateLimit, limits=RATE_LIMITS, trusted_proxy_hops=settings.trusted_proxy_hops, clock=clock)
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
