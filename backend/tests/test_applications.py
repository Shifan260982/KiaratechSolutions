import pytest
from fastapi.testclient import TestClient

from app.application_rules import CV_MAX_BYTES, Application
from app.config import Settings
from app.mailer import MailUnavailable
from app.main import create_app
from app.scanner import ScanUnavailable
from tests.fakes import GOOD_TOKEN, FakeCaptcha

URL = "/api/v1/applications"
FIELDS = {
    "roleId": "senior-backend-engineer",
    "roleTitle": "Senior Backend Engineer",
    "firstName": "Priya",
    "lastName": "Shah",
    "email": "priya@example.com",
    "phone": "+91 98765 43210",
    "location": "Pune",
    "noticePeriod": "60",
    "captchaToken": GOOD_TOKEN,
}
PDF = b"%PDF-1.7\nhello"


class FakeMailer:
    def __init__(self, fail: bool = False) -> None:
        self.sent: list[tuple[Application, bytes, str]] = []
        self.fail = fail

    async def send_enquiry(self, enquiry) -> None:  # pragma: no cover - not used here
        raise AssertionError

    async def send_application(self, application: Application, cv: bytes, extension: str) -> None:
        if self.fail:
            raise MailUnavailable
        self.sent.append((application, cv, extension))


class FakeScanner:
    def __init__(self, clean: bool = True, fail: bool = False) -> None:
        self.clean, self.fail, self.scanned = clean, fail, 0

    async def is_clean(self, content: bytes) -> bool:
        self.scanned += 1
        if self.fail:
            raise ScanUnavailable
        return self.clean


def make_client(mailer=None, scanner=None, captcha=None) -> TestClient:
    settings = Settings(environment="production", allowed_origins=("https://www.kiaratechs.com",))
    app = create_app(settings, mailer=mailer, scanner=scanner, captcha=captcha or FakeCaptcha())
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def mailer() -> FakeMailer:
    return FakeMailer()


@pytest.fixture
def scanner() -> FakeScanner:
    return FakeScanner()


@pytest.fixture
def client(mailer, scanner) -> TestClient:
    return make_client(mailer, scanner)


def post(client, data=None, cv=("My CV.pdf", PDF, "application/pdf"), **kwargs):
    files = {"cv": cv} if cv else None
    return client.post(URL, data=FIELDS if data is None else data, files=files, **kwargs)


def test_accepts_a_valid_application(client, mailer, scanner):
    response = post(client)
    assert response.status_code == 202
    application, content, extension = mailer.sent[0]
    assert application.role_id == "senior-backend-engineer"
    assert application.details == {"noticePeriod": "60"}
    assert content == PDF
    assert extension == "pdf"
    assert scanner.scanned == 1


def test_reports_field_errors_by_form_name(client, mailer, scanner):
    response = post(client, data={**FIELDS, "email": "nope", "noticePeriod": "30.5"})
    assert response.status_code == 400
    assert set(response.json()["errors"]) == {"email", "noticePeriod"}
    assert mailer.sent == [] and scanner.scanned == 0


def test_requires_a_cv(client):
    # A text-only multipart body, as a browser sends when no file is chosen.
    response = client.post(URL, files={name: (None, value) for name, value in FIELDS.items()})
    assert response.json()["errors"] == {"cv": "Attach your CV."}


@pytest.mark.parametrize(
    "cv",
    [("cv.pdf", b"MZ not a pdf", "application/pdf"), ("cv.exe", PDF, "application/pdf"), ("cv.pdf", b"", "application/pdf")],
)
def test_rejects_bad_cv_files_before_scanning(client, scanner, cv):
    response = post(client, cv=cv)
    assert response.status_code == 400
    assert "cv" in response.json()["errors"]
    assert scanner.scanned == 0


def test_rejects_unknown_and_duplicate_fields(client, mailer):
    assert "isAdmin" in post(client, data={**FIELDS, "isAdmin": "1"}).json()["errors"]
    duplicate = [(name, (None, value)) for name, value in FIELDS.items()]
    duplicate += [("email", (None, "other@example.com")), ("cv", ("cv.pdf", PDF, "application/pdf"))]
    assert "email" in client.post(URL, files=duplicate).json()["errors"]
    assert mailer.sent == []


def test_rejects_a_second_file_or_a_file_in_a_text_field(client, mailer):
    files = [("cv", ("a.pdf", PDF, "application/pdf")), ("firstName", ("b.pdf", PDF, "application/pdf"))]
    assert client.post(URL, data=FIELDS, files=files).status_code == 400
    assert mailer.sent == []


def test_rejects_non_multipart_requests(client, mailer):
    assert client.post(URL, json=FIELDS).status_code == 400
    assert mailer.sent == []


def test_honeypot_pretends_success_and_sends_nothing(client, mailer, scanner):
    assert post(client, data={**FIELDS, "website": "http://spam.example"}).status_code == 202
    assert mailer.sent == [] and scanner.scanned == 0


def test_infected_file_is_rejected_and_not_sent(mailer):
    response = post(make_client(mailer, FakeScanner(clean=False)))
    assert response.status_code == 400
    assert "could not accept this file" in response.json()["errors"]["cv"]
    assert mailer.sent == []


def test_scanner_down_fails_closed(mailer):
    assert post(make_client(mailer, FakeScanner(fail=True))).status_code == 503
    assert mailer.sent == []


def test_no_scanner_configured_refuses_applications(mailer):
    assert post(make_client(mailer, None)).status_code == 503
    assert mailer.sent == []


def test_storage_failure_asks_visitor_to_retry(scanner):
    response = post(make_client(FakeMailer(fail=True), scanner))
    assert response.status_code == 503
    assert "try again" in response.json()["title"]


def test_rejects_oversized_upload(client, mailer, scanner):
    response = post(client, cv=("cv.pdf", b"%PDF-" + b"x" * (CV_MAX_BYTES + 70 * 1024), "application/pdf"))
    assert response.status_code == 413
    assert mailer.sent == [] and scanner.scanned == 0


def test_cv_just_over_5mb_is_rejected_with_a_field_error(client, scanner):
    response = post(client, cv=("cv.pdf", b"%PDF-" + b"x" * CV_MAX_BYTES, "application/pdf"))
    assert response.status_code == 400
    assert "5 MB" in response.json()["errors"]["cv"]
    assert scanner.scanned == 0


def test_enquiry_route_keeps_its_small_limit(client):
    assert (
        client.post("/api/v1/enquiries", content=b"x" * 40_000, headers={"Content-Type": "application/json"}).status_code == 413
    )


def test_bad_captcha_is_refused_before_scanning(mailer, scanner):
    captcha = FakeCaptcha()
    response = post(make_client(mailer, scanner, captcha), data={**FIELDS, "captchaToken": "forged"})
    assert response.status_code == 400
    assert "captchaToken" in response.json()["errors"]
    assert scanner.scanned == 0 and mailer.sent == []
    assert captcha.calls[0][1] == "application"


def test_captcha_down_fails_closed(mailer, scanner):
    assert post(make_client(mailer, scanner, FakeCaptcha(fail=True))).status_code == 503
    assert scanner.scanned == 0 and mailer.sent == []


def test_sixth_application_in_an_hour_is_rate_limited(client):
    statuses = [post(client).status_code for _ in range(6)]
    assert statuses == [202] * 5 + [429]
