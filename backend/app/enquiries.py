"""POST /api/v1/enquiries: the contact and discovery-call form."""

import logging

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app import captcha
from app.captcha import CaptchaUnavailable, captcha_passed
from app.sharepoint import StoreUnavailable
from app.validation import EnquiryIn, validate_enquiry

logger = logging.getLogger("kiaratech.enquiries")

router = APIRouter(prefix="/api/v1")

UNAVAILABLE = {"title": "We could not send your enquiry just now. Please try again in a few minutes."}


@router.post("/enquiries", status_code=202, response_class=Response)
async def submit_enquiry(body: EnquiryIn, request: Request) -> Response:
    if body.website:
        # Honeypot filled: almost certainly a bot. Pretend success so it learns nothing, and keep nothing.
        logger.info("honeypot triggered request_id=%s", request.state.request_id)
        return Response(status_code=202)

    enquiry, errors = validate_enquiry(body)
    if errors:
        return JSONResponse({"title": "Check the highlighted fields.", "errors": errors}, status_code=400)

    store = request.app.state.store
    if store is None:
        return JSONResponse(UNAVAILABLE, status_code=503)
    try:
        # After field checks, so a typo does not spend the visitor's single-use token.
        if not await captcha_passed(request, body.captchaToken, "enquiry"):
            return JSONResponse({"title": captcha.FAILED, "errors": {captcha.FIELD: captcha.FAILED}}, status_code=400)
        await store.save_enquiry(enquiry)
    except (CaptchaUnavailable, StoreUnavailable):
        return JSONResponse(UNAVAILABLE, status_code=503)
    return Response(status_code=202)
