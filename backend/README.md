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
| `ENQUIRIES_LIST_ID` | ID of the `Enquiries` list |
| `MAIL_SENDER` | Mailbox the notification is sent from |
| `ENQUIRY_RECIPIENT` | Who is told about new enquiries (requirement 8.6) |
| `AZURE_CLIENT_ID` | Only for a user-assigned Managed Identity |

Set all four SharePoint variables or none. With none, the API starts but answers submissions with `503`. There are no secrets: the app's Managed Identity is granted the Graph application permissions `Sites.Selected` (write access to this one site) and `Mail.Send`, restricted to `MAIL_SENDER` by an Exchange application access policy.

## API

`POST /api/v1/enquiries`, JSON body with `firstName`, `lastName`, `email`, `company`, `topic`, `message` and the hidden honeypot `website`.

| Status | Meaning |
|---|---|
| `202` | Saved (or honeypot triggered: nothing is saved) |
| `400` | `{"title", "errors": {field: message}}`, keyed by form field name |
| `413` | Body over 32 KB |
| `503` | SharePoint unavailable or not configured; nothing was kept, the visitor should retry |

Do not expose this publicly until captcha and rate limiting (plan step 4) are in place.

## SharePoint list `Enquiries`

Columns (internal names): `Title` (topic), `FirstName`, `LastName`, `Email`, `Company`, `Message` (multiple lines, plain text), `Status` (choice: New, Contacted, Qualified, Closed). Give BD access to this list only.

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
