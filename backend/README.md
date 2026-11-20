# Backend (Phase 2)

Form API for the website: Python 3.12, FastAPI. It receives enquiries and job applications from the website's forms and e-mails them; nothing is stored. Deployment: [`infra/`](../infra/README.md). Plan and decisions: [PLAN.md](PLAN.md).

## Run locally

```bash
py -3.12 -m venv .venv            # macOS/Linux: python3.12 -m venv .venv
.venv/Scripts/pip install --require-hashes -r requirements.txt -r requirements-dev.txt
APP_ENV=development .venv/Scripts/uvicorn app.main:app --reload   # docs at http://localhost:8000/docs
```

## Settings (environment variables)

| Name | Purpose |
|---|---|
| `APP_ENV` | Defaults to `production`, which hides the API docs |
| `ALLOWED_ORIGINS` | Comma-separated exact `https://` origins allowed by CORS |
| `MAIL_SENDER` | Mailbox every e-mail is sent from (noreply@kiaratech.ai) |
| `ENQUIRY_RECIPIENT` | Who receives enquiries (BD@kiaratech.ai) |
| `APPLICATION_RECIPIENT` | Who receives applications with the CV attached (jobs@kiaratech.ai) |
| `CLAMAV_HOST`, `CLAMAV_PORT` | ClamAV sidecar (port defaults to 3310) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret. **The only secret**: store it in Key Vault and expose it through a Container Apps secret reference |
| `TRUSTED_PROXY_HOPS` | Proxies in front of the app that append to `X-Forwarded-For` (default 1: Container Apps ingress). Add one per extra proxy, such as Front Door |
| `AZURE_CLIENT_ID` | Only for a user-assigned Managed Identity |

A recipient without `MAIL_SENDER` stops the app at start-up. A form whose recipient is unset answers `503`, so the forms stay safe while the mailbox is being set up. Submissions also answer `503` without `TURNSTILE_SECRET_KEY`, and applications without `CLAMAV_HOST`: nothing is accepted unverified or unscanned.

Graph needs no secret: the app's Managed Identity is granted the application permissions `Mail.Send` and `Mail.ReadWrite` (the second only for CVs over 3 MB, which go through a draft), both restricted to the `MAIL_SENDER` mailbox in Exchange Online (RBAC for Applications or an application access policy).

For local development, use Cloudflare's test secret `1x0000000000000000000000000000000AA` (always passes) with `APP_ENV=development`. Outside production the action and hostname checks are skipped, because test keys do not report them.

## API

Both endpoints return:

| Status | Meaning |
|---|---|
| `202` | Sent (or honeypot triggered: nothing is sent) |
| `400` | `{"title", "errors": {field: message}}`, keyed by form field name. A failed captcha is reported under `captchaToken` |
| `413` | Body too large |
| `429` | Rate limited; `Retry-After` gives the seconds to wait |
| `503` | E-mail, the scanner or Cloudflare unavailable or not configured; nothing was sent, the visitor should retry |

**`POST /api/v1/enquiries`**: JSON with `firstName`, `lastName`, `email`, `company`, `topic`, `message`, `captchaToken` and the hidden honeypot `website`. Limit 32 KB; 5 per IP per 10 minutes.

**`POST /api/v1/applications`**: `multipart/form-data` with `roleId`, `roleTitle`, `firstName`, `lastName`, `email`, `phone`, `location`, `linkedIn`, `coverNote`, any of the role-detail fields (`totalExperience`, `relevantExperience`, `currentCtc`, `expectedCtc`, `noticePeriod`, `teamSize`, `primaryTechnology`, `itilCertification`), `captchaToken`, the honeypot `website`, and one file `cv`. Limit 5 MB for the CV plus 64 KB; 5 per IP per hour.

Order of checks: rate limit (before the body is read), size, field rules, CV type, captcha, malware scan, e-mail. Field errors come before the captcha so a typo does not spend the visitor's single-use token. The captcha comes before the scan so bots never reach the expensive step.

The CV is checked from its bytes (PDF, legacy Word, or Word without macros; the extension must match), scanned by ClamAV, then attached to the HR e-mail under a readable name built from the validated fields, for example `Jane Doe - Senior Backend Engineer - 2026-11-20.pdf`. The applicant's own file name is never used.

Rate-limit counts live in each replica's memory, so with N replicas a visitor gets up to N times the limit. Move them to Azure Cache for Redis if the app scales past a couple of replicas.

## Cloudflare Turnstile

Create a Turnstile widget in a Cloudflare account (free) for the site's production hostnames. The frontend renders it with `data-action="enquiry"` or `data-action="application"` and sends the token as `captchaToken`; the frontend CSP must allow `https://challenges.cloudflare.com` in `script-src` and `frame-src` (plan step 5).

## E-mails (templates in `app/emails.py`, sent by `app/mailer.py`)

Nothing is stored: each submission becomes e-mail, sent from `MAIL_SENDER` through Microsoft Graph.

| Form | E-mail | To | Reply goes to |
|---|---|---|---|
| Enquiry | "Website enquiry: <topic>": every field in a table | `ENQUIRY_RECIPIENT` (BD) | the enquirer |
| Application | "Job application: <role> - <name>": every field, the CV attached, and a warning not to open the CV straight from the e-mail | `APPLICATION_RECIPIENT` (HR) | the candidate |
| Application | "We have received your application": "Hi <first name>, thank you for applying for the <role> role…". The name and role appear only if they look like a real name and job title and contain nothing link-like; otherwise it says "Hi," and "applying to Kiaratech Solutions", so the form cannot send our e-mail with arbitrary text or links to strangers | the candidate | (not monitored) |

All visitor input is HTML-escaped and subjects are kept on one line. If the BD or HR e-mail fails, the visitor gets `503` and can retry; nothing has been sent. If only the candidate's confirmation fails, HR already has the application, so the visitor still gets `202` and the error is logged.

CVs up to 3 MB are attached directly (`sendMail`, not saved in Sent Items). Larger CVs, up to the 5 MB limit, go through a draft with an upload session; Exchange keeps those in the noreply mailbox's Sent Items, so give that mailbox a retention policy. A draft is deleted again if anything fails.

## ClamAV

Runs as a sidecar in the same Container App (`infra/app.bicep`, port 3310, not exposed outside the app). Its image (`infra/clamav/Dockerfile`) is the official `clamav/clamav` image with `AlertOLE2Macros yes`, so any Office file with macros, including old Word `.doc` files, comes back as `FOUND` and is refused. It updates its signatures itself. It has 3 GB of memory, because signature reloads briefly need about twice the resting amount.

## Checks

CI (`.github/workflows/backend.yml`) blocks merging on any failure: ruff, pytest, Bandit, pip-audit, Semgrep, Gitleaks, and Trivy (image and Dockerfile, high and critical). Locally:

```bash
ruff check . && ruff format --check . && pytest -q && bandit -c pyproject.toml -r app && pip-audit -r requirements.txt --require-hashes --disable-pip
```

## Dependencies

Add direct dependencies to `requirements.in` / `requirements-dev.in`, then regenerate the hashed pins:

```bash
pip-compile --generate-hashes --strip-extras requirements.in
pip-compile --generate-hashes --allow-unsafe --strip-extras requirements-dev.in
```

## Frontend connection

- The website calls this API from `frontend/src/lib/api.ts` (`submitEnquiry()` in `enquiry.ts`, `submitApplication()` in `application.ts`).
- On Vercel, set `NEXT_PUBLIC_API_URL` (a trailing slash is fine) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Until both are set, the forms show "not connected" with the BD@ or jobs@ address to copy, and send nothing.
- `connect-src` in `frontend/vercel.json` must name the same API host (currently `https://api.kiaratechs.com`).
- Field rules exist twice: `frontend/src/lib/validation.ts` and `application.ts` in the browser, `app/validation.py` and `app/application_rules.py` here. Change both together.
