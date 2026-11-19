# Backend (Phase 2)

Phase 2 backend: Python 3.12, FastAPI. Nothing in Phase 1 depends on this folder. See [PLAN.md](PLAN.md).

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
| `GRAPH_SITE_ID` | SharePoint site ID (`host,siteCollectionId,webId`) |
| `MAIL_SENDER` | Mailbox the notifications are sent from |
| `ENQUIRIES_LIST_ID` | ID of the `Enquiries` list |
| `ENQUIRY_RECIPIENT` | Who is told about new enquiries (requirement 8.6) |
| `APPLICATIONS_LIST_ID` | ID of the `Applications` list |
| `CV_DRIVE_ID` | Drive ID of the private `CVs` document library |
| `APPLICATION_RECIPIENT` | Who is told about new applications (jobs@kiaratechs.com) |
| `CLAMAV_HOST`, `CLAMAV_PORT` | ClamAV sidecar (port defaults to 3310) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret. **The only secret**: store it in Key Vault and expose it through a Container Apps secret reference |
| `TRUSTED_PROXY_HOPS` | Proxies in front of the app that append to `X-Forwarded-For` (default 1: Container Apps ingress). Add one per extra proxy, such as Front Door |
| `AZURE_CLIENT_ID` | Only for a user-assigned Managed Identity |

Each group is all-or-none, and the app refuses to start when one is half set: `GRAPH_SITE_ID` + `MAIL_SENDER`; the two enquiry variables; the three application variables. A feature left unset answers `503`. Submissions also answer `503` without `TURNSTILE_SECRET_KEY`, and applications without `CLAMAV_HOST`: nothing is accepted unverified or unscanned.

Graph needs no secret: the app's Managed Identity is granted the application permissions `Sites.Selected` (write access to this one site) and `Mail.Send`, restricted to `MAIL_SENDER` by an Exchange application access policy.

For local development, use Cloudflare's test secret `1x0000000000000000000000000000000AA` (always passes) with `APP_ENV=development`. Outside production the action and hostname checks are skipped, because test keys do not report them.

## API

Both endpoints return:

| Status | Meaning |
|---|---|
| `202` | Saved (or honeypot triggered: nothing is saved) |
| `400` | `{"title", "errors": {field: message}}`, keyed by form field name. A failed captcha is reported under `captchaToken` |
| `413` | Body too large |
| `429` | Rate limited; `Retry-After` gives the seconds to wait |
| `503` | SharePoint, the scanner or Cloudflare unavailable or not configured; nothing was kept, the visitor should retry |

**`POST /api/v1/enquiries`**: JSON with `firstName`, `lastName`, `email`, `company`, `topic`, `message`, `captchaToken` and the hidden honeypot `website`. Limit 32 KB; 5 per IP per 10 minutes.

**`POST /api/v1/applications`**: `multipart/form-data` with `roleId`, `roleTitle`, `firstName`, `lastName`, `email`, `phone`, `location`, `linkedIn`, `coverNote`, any of the role-detail fields (`totalExperience`, `relevantExperience`, `currentCtc`, `expectedCtc`, `noticePeriod`, `teamSize`, `primaryTechnology`, `itilCertification`), `captchaToken`, the honeypot `website`, and one file `cv`. Limit 5 MB for the CV plus 64 KB; 5 per IP per hour.

Order of checks: rate limit (before the body is read), size, field rules, CV type, captcha, malware scan, SharePoint. Field errors come before the captcha so a typo does not spend the visitor's single-use token. The captcha comes before the scan so bots never reach the expensive step.

The CV is checked from its bytes (PDF, legacy Word, or Word without macros; the extension must match), scanned by ClamAV, then uploaded to SharePoint under a readable name built from the validated fields, for example `Jane Doe - Senior Backend Engineer - 2026-11-17 - 3f9c1a2b.pdf` (the short code keeps applicants with the same name apart; the applicant's own file name is never used). If the list item then fails, the CV is deleted again.

Rate-limit counts live in each replica's memory, so with N replicas a visitor gets up to N times the limit. Move them to Azure Cache for Redis if the app scales past a couple of replicas.

## Cloudflare Turnstile

Create a Turnstile widget in a Cloudflare account (free) for the site's production hostnames. The frontend renders it with `data-action="enquiry"` or `data-action="application"` and sends the token as `captchaToken`; the frontend CSP must allow `https://challenges.cloudflare.com` in `script-src` and `frame-src` (plan step 5).

## SharePoint (one site, set up by an admin)

- List `Enquiries`, BD access only. Columns (internal names): `Title` (topic), `FirstName`, `LastName`, `Email`, `Company`, `Message` (multiple lines, plain text), `Status` (choice: New, Contacted, Qualified, Closed).
- List `Applications`, HR access only. Columns: `Title` (role), `RoleId`, `FirstName`, `LastName`, `Email`, `Phone`, `Location`, `LinkedIn`, `Details` and `CoverNote` (multiple lines, plain text), `CvUrl`, `Status` (choice: New, Screening, Interview, Rejected, Hired).
- Document library `CVs`, HR access only.

## ClamAV

Run the official `clamav/clamav` image as a sidecar in the same Container App (port 3310, not exposed outside the app). It updates its signatures itself. Allow it about 2 GB of memory.

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

## Frontend integration points

Integration points already prepared in the frontend:

- `frontend/src/lib/enquiry.ts`: `submitEnquiry()` currently returns `not-connected`. Replace it with a POST to `/api/v1/enquiries` and add the hidden `website` honeypot field to the form.
- `frontend/src/lib/validation.ts`: client-side rules for the enquiry form, mirrored server-side in `app/validation.py`. Keep both in step.
- Discovery-call booking CTAs currently link to `/contact?type=discovery`.
- After adding an API origin, update `connect-src` in `frontend/vercel.json` (Content-Security-Policy).
