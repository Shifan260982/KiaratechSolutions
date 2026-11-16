# Backend (Phase 2)

Phase 2 backend: Python 3.12, FastAPI. Nothing in Phase 1 depends on this folder. See [PLAN.md](PLAN.md).

## Run locally

```bash
py -3.12 -m venv .venv            # macOS/Linux: python3.12 -m venv .venv
.venv/Scripts/pip install --require-hashes -r requirements.txt -r requirements-dev.txt
APP_ENV=development .venv/Scripts/uvicorn app.main:app --reload   # docs at http://localhost:8000/docs
```

Settings (environment variables): `APP_ENV` (defaults to `production`, which hides the API docs) and `ALLOWED_ORIGINS` (comma-separated exact `https://` origins).

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

- `frontend/src/lib/enquiry.ts`: `submitEnquiry()` currently returns `not-connected`. Replace it with a POST to the enquiry API.
- `frontend/src/lib/validation.ts`: client-side rules for the enquiry form. The API must re-validate every field server-side, and add spam protection and rate limiting.
- Discovery-call booking CTAs currently link to `/contact?type=discovery`.
- After adding an API origin, update `connect-src` in `frontend/vercel.json` (Content-Security-Policy).
