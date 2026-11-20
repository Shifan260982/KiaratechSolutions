"""POST /api/v1/applications: job application form with CV (multipart/form-data)."""

import logging

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from starlette.datastructures import UploadFile
from starlette.formparsers import MultiPartParser

from app import captcha
from app.application_rules import CV_MAX_BYTES, FORM_FIELDS, HONEYPOT, cv_error, validate_application
from app.captcha import CaptchaUnavailable, captcha_passed
from app.mailer import MailUnavailable
from app.scanner import ScanUnavailable

logger = logging.getLogger("kiaratech.applications")

router = APIRouter(prefix="/api/v1")

# Whole request: the CV plus about 10 KB of text fields and multipart overhead.
MAX_REQUEST_BYTES = CV_MAX_BYTES + 64 * 1024
# Keep uploads in memory: the container's filesystem is read-only, and the request limit caps the size.
MultiPartParser.spool_max_size = MAX_REQUEST_BYTES

UNAVAILABLE = {"title": "We could not send your application just now. Please try again in a few minutes."}
INVALID = "This value is not valid."
REJECTED_FILE = "We could not accept this file. Save your CV again as a new PDF or Word document and try again."


def _bad_request(errors: dict[str, str]) -> JSONResponse:
    return JSONResponse({"title": "Check the highlighted fields.", "errors": errors}, status_code=400)


@router.post("/applications", status_code=202, response_class=Response)
async def submit_application(request: Request) -> Response:
    if not request.headers.get("content-type", "").startswith("multipart/form-data"):
        return JSONResponse({"title": "The request is not valid.", "errors": {}}, status_code=400)

    async with request.form(max_files=1, max_fields=len(FORM_FIELDS), max_part_size=16 * 1024) as form:
        items = form.multi_items()
        names = [name for name, _ in items]
        odd = {name: INVALID for name in names if name not in FORM_FIELDS or names.count(name) > 1}
        odd |= {name: INVALID for name, value in items if (name == "cv") != isinstance(value, UploadFile)}
        if odd:
            return _bad_request(odd)

        if form.get(HONEYPOT):
            # Almost certainly a bot. Pretend success so it learns nothing, and keep nothing.
            logger.info("honeypot triggered request_id=%s", request.state.request_id)
            return Response(status_code=202)

        application, errors = validate_application({name: value for name, value in items if name != "cv"})
        cv = form.get("cv")
        content = b""
        if not isinstance(cv, UploadFile):
            errors["cv"] = "Attach your CV."
        else:
            content = await cv.read(CV_MAX_BYTES + 1)
            if message := cv_error(cv.filename or "", content):
                errors["cv"] = message
        if errors:
            return _bad_request(errors)
        extension = cv.filename.rsplit(".", 1)[-1].lower()
        token = str(form.get(captcha.FIELD, ""))

    mailer, scanner = request.app.state.mailer, request.app.state.scanner
    if mailer is None or scanner is None:
        return JSONResponse(UNAVAILABLE, status_code=503)
    try:
        # Captcha before the scan: scanning is the expensive step, so bots never reach it.
        if not await captcha_passed(request, token, "application"):
            return JSONResponse({"title": captcha.FAILED, "errors": {captcha.FIELD: captcha.FAILED}}, status_code=400)
        if not await scanner.is_clean(content):
            return _bad_request({"cv": REJECTED_FILE})
        await mailer.send_application(application, content, extension)
    except (CaptchaUnavailable, ScanUnavailable, MailUnavailable):
        return JSONResponse(UNAVAILABLE, status_code=503)
    return Response(status_code=202)
