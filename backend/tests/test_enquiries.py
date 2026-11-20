import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.mailer import MailUnavailable
from app.main import create_app
from app.validation import Enquiry
from tests.fakes import GOOD_TOKEN, FakeCaptcha

URL = "/api/v1/enquiries"
VALID = {
    "firstName": "Alex",
    "lastName": "Morgan",
    "email": "alex@example.com",
    "company": "Example Ltd",
    "topic": "Invoice automation",
    "message": "We want to automate invoice processing across three sites.",
    "captchaToken": GOOD_TOKEN,
}


class FakeMailer:
    def __init__(self, fail: bool = False) -> None:
        self.sent: list[Enquiry] = []
        self.fail = fail

    async def send_enquiry(self, enquiry: Enquiry) -> None:
        if self.fail:
            raise MailUnavailable
        self.sent.append(enquiry)


def make_client(mailer, captcha=None) -> TestClient:
    settings = Settings(environment="production", allowed_origins=("https://www.kiaratechs.com",))
    app = create_app(settings, mailer=mailer, captcha=captcha or FakeCaptcha())
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def mailer() -> FakeMailer:
    return FakeMailer()


@pytest.fixture
def client(mailer) -> TestClient:
    return make_client(mailer)


def test_accepts_a_valid_enquiry(client, mailer):
    response = client.post(URL, json=VALID)
    assert response.status_code == 202
    assert response.content == b""
    assert mailer.sent[0].email == "alex@example.com"


def test_sanitises_before_sending(client, mailer):
    payload = {**VALID, "firstName": "  Al\u0000ex ", "email": " ALEX@Example.com ", "message": VALID["message"] + "\n\u0007ok"}
    assert client.post(URL, json=payload).status_code == 202
    saved = mailer.sent[0]
    assert saved.first_name == "Alex"
    assert saved.email == "alex@example.com"
    assert saved.message.endswith("\nok")


def test_reports_every_missing_field_by_form_name(client, mailer):
    response = client.post(URL, json={key: "" for key in VALID})
    assert response.status_code == 400
    assert sorted(response.json()["errors"]) == sorted(key for key in VALID if key != "captchaToken")
    assert mailer.sent == []


def test_whitespace_only_counts_as_empty(client):
    errors = client.post(URL, json={**VALID, "firstName": "   ", "message": " \n\t "}).json()["errors"]
    assert set(errors) == {"firstName", "message"}


@pytest.mark.parametrize("email", ["alex", "alex@", "alex@example", "a b@example.com", "alex@@example.com"])
def test_rejects_malformed_emails(client, email):
    assert "email" in client.post(URL, json={**VALID, "email": email}).json()["errors"]


@pytest.mark.parametrize(
    ("field", "length"),
    [("firstName", 61), ("lastName", 61), ("company", 121), ("topic", 121), ("message", 2001), ("email", 255)],
)
def test_enforces_maximum_lengths(client, field, length):
    value = "a" * (length - len("@example.com")) + "@example.com" if field == "email" else "x" * length
    assert field in client.post(URL, json={**VALID, field: value}).json()["errors"]


def test_message_minimum_length(client):
    assert "message" in client.post(URL, json={**VALID, "message": "x" * 19}).json()["errors"]


def test_rejects_unknown_fields_without_echoing_them(client, mailer):
    response = client.post(URL, json={**VALID, "isAdmin": "<script>alert(1)</script>"})
    assert response.status_code == 400
    assert "isAdmin" in response.json()["errors"]
    assert "<script>" not in response.text
    assert mailer.sent == []


@pytest.mark.parametrize("payload", [{**VALID, "email": 123}, {**VALID, "message": ["x"]}, ["not", "an", "object"]])
def test_rejects_wrong_types(client, payload):
    assert client.post(URL, json=payload).status_code == 400


def test_rejects_malformed_json(client):
    response = client.post(URL, content=b'{"firstName": ', headers={"Content-Type": "application/json"})
    assert response.status_code == 400


def test_rejects_non_json_content_type(client, mailer):
    response = client.post(URL, content=b"firstName=Alex", headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert response.status_code == 400
    assert mailer.sent == []


def test_honeypot_pretends_success_and_sends_nothing(client, mailer):
    assert client.post(URL, json={**VALID, "website": "http://spam.example"}).status_code == 202
    assert mailer.sent == []


def test_rejects_oversized_body_by_header(client, mailer):
    response = client.post(URL, json={**VALID, "message": "x" * 40_000})
    assert response.status_code == 413
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert mailer.sent == []


def test_rejects_oversized_body_without_content_length(client, mailer):
    def chunks():
        yield b'{"message": "'
        for _ in range(40):
            yield b"x" * 1024
        yield b'"}'

    response = client.post(URL, content=chunks(), headers={"Content-Type": "application/json"})
    assert response.status_code == 413
    assert mailer.sent == []


def test_storage_failure_asks_visitor_to_retry():
    response = make_client(FakeMailer(fail=True)).post(URL, json=VALID)
    assert response.status_code == 503
    assert "try again" in response.json()["title"]


def test_not_configured_refuses_submissions():
    assert make_client(None).post(URL, json=VALID).status_code == 503


def test_only_post_is_allowed(client):
    assert client.get(URL).status_code == 405


def test_missing_or_bad_captcha_is_refused_after_field_checks(mailer):
    captcha = FakeCaptcha()
    client = make_client(mailer, captcha)
    response = client.post(URL, json={**VALID, "captchaToken": "forged"})
    assert response.status_code == 400
    assert "captchaToken" in response.json()["errors"]
    assert mailer.sent == []
    assert captcha.calls[0][1] == "enquiry"

    client.post(URL, json={**VALID, "email": "bad", "captchaToken": "forged"})
    assert len(captcha.calls) == 1  # invalid fields never spend the visitor's single-use token


def test_captcha_down_or_unconfigured_fails_closed(mailer):
    assert make_client(mailer, FakeCaptcha(fail=True)).post(URL, json=VALID).status_code == 503
    app = create_app(Settings(environment="production", allowed_origins=()), mailer=mailer)
    assert TestClient(app).post(URL, json=VALID).status_code == 503
    assert mailer.sent == []


def test_sixth_enquiry_in_ten_minutes_is_rate_limited(client):
    statuses = [client.post(URL, json=VALID).status_code for _ in range(6)]
    assert statuses == [202] * 5 + [429]
