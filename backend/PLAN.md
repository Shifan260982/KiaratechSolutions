# Phase 2 backend plan

Status: built and tested; waiting for Azure hosting and the noreply mailbox. Decisions: Python (FastAPI), no .NET or Node.js; submissions are sent by e-mail from noreply@kiaratech.ai, nothing is stored.

## Scope

Two endpoints, called by the website's two forms. No admin UI, no own database, no CRM.

| Endpoint | Frontend hook | Body |
|---|---|---|
| `POST /api/v1/enquiries` | `submitEnquiry()` in `frontend/src/lib/enquiry.ts` | JSON |
| `POST /api/v1/applications` | `submitApplication()` in `frontend/src/lib/application.ts` | multipart: fields + CV |
| `GET /health` | | |

Responses: `202` sent; `400` with field errors keyed by the form's field names (the form focuses the first one); `413` file too large; `429` rate limited; `503` e-mail, scanner or captcha unavailable or not configured (nothing sent, the visitor can retry).

## Stack

- Python 3.12, FastAPI, Pydantic v2, pytest.
- Azure Container Apps, UK South, with a ClamAV sidecar. Managed Identity, Key Vault, Log Analytics (logs and the error alert).
- Microsoft Graph to send e-mail from the noreply mailbox.

## Operating model

The API is stateless and stores nothing: it validates each submission and turns it into e-mail, sent from noreply@kiaratech.ai. Staff work from their inboxes.

| | Enquiry | Job application |
|---|---|---|
| E-mailed to | BD@kiaratech.ai: every field in a structured table | jobs@kiaratech.ai: every field, the CV attached, and a warning not to open the CV straight from the e-mail |
| Reply goes to | The enquirer | The candidate |
| Visitor also gets | - | "Hi <first name>, we have received your application for the <role> role; our hiring team will contact you". Name and role are repeated only if they pass a strict check (no links), otherwise a generic greeting |
| Retention | 6 months, as the Privacy Policy states: a retention policy on the BD@ inbox | 6 months on the jobs@ inbox and the noreply Sent Items, which keeps CVs over 3 MB |

- Graph application permissions: `Mail.Send`, and `Mail.ReadWrite` for CVs over 3 MB, both restricted to the noreply mailbox.
- Templates: `backend/app/emails.py`; sending: `backend/app/mailer.py`.

## Security

Target: OWASP ASVS Level 2. CI fails on any high or critical finding.

| Check | Tool |
|---|---|
| Static analysis | Bandit, Semgrep |
| Dependencies | pip-audit (pinned, hashed requirements), Dependabot |
| Secrets | gitleaks |
| Container | Trivy; slim/distroless image, non-root, read-only filesystem |
| Tests | pytest, including abuse cases |

In the service:

- Pydantic models mirror every frontend rule (`frontend/src/lib/validation.ts`, `application.ts`); unknown fields rejected; control characters stripped.
- CV: PDF, Word (.docx) or older Word (.doc), up to 5 MB, enforced while streaming; type checked from the file's bytes; macro-enabled Word (.docm, even renamed) refused; malware scan by a ClamAV sidecar before it is e-mailed, which also refuses any Office file with macros, including old .doc files (`AlertOLE2Macros`, `infra/clamav/Dockerfile`); attached under a readable name built from validated fields, e.g. `Jane Doe - Senior Backend Engineer - 2026-11-20.pdf`, never the applicant's own file name.
- Abuse: Cloudflare Turnstile verified server-side, honeypot field, rate limit per IP, request size limits.
- CORS restricted to the production domain; HTTPS only; security headers; generic errors, no stack traces.
- No secrets in code or config; Managed Identity to Key Vault and Graph.
- Logs hold request ID, outcome and timing only. No personal data.
- If e-mail to BD or HR fails, return `503` so the visitor can retry; nothing is held in the API.
- Before launch: independent penetration test.

## Build order

1. Service scaffold and CI security gates. **Done.**
2. Enquiry endpoint. **Done.**
3. Application endpoint and CV handling. **Done.**
4. Turnstile and rate limits. **Done.**
5. Frontend forms wired; API and Turnstile origins in the CSP (`frontend/vercel.json`). **Done.**
6. Azure hosting, penetration test, go live. **Next.** Bicep templates are in `infra/`, and the manual, approval-gated deploy workflow (`.github/workflows/deploy.yml`) reruns the backend CI before every release. Hosting steps for the admins are in the hosting handover guide (PDF, shared privately). Not used: Application Insights and an automated ZAP scan (the penetration test covers dynamic testing).

## Blockers

- noreply@kiaratech.ai mailbox and its Graph permissions (Microsoft 365 admin, in progress).
- Azure resources (Azure admin), Turnstile keys, and DNS for `api.kiaratechs.com`.
- 6-month retention policies on the BD@ and jobs@ inboxes and the noreply Sent Items (Microsoft 365 admin).
