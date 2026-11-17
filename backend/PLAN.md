# Phase 2 backend plan

Status: agreed direction, not built. Decisions: Python (FastAPI), no .NET or Node.js; submissions are operated in SharePoint and Outlook.

## Scope

Two endpoints behind the two frontend stubs. No admin UI, no own database, no CRM.

| Endpoint | Frontend hook | Body |
|---|---|---|
| `POST /api/v1/enquiries` | `submitEnquiry()` in `frontend/src/lib/enquiry.ts` | JSON |
| `POST /api/v1/applications` | `submitApplication()` in `frontend/src/lib/application.ts` | multipart: fields + CV |
| `GET /health` | | |

Responses: `202` accepted; `400` with field errors keyed by the form's field names (the form focuses the first one); `413` file too large; `429` rate limited.

## Stack

- Python 3.12, FastAPI, Pydantic v2, pytest.
- Azure Container Apps, UK South. Managed Identity, Key Vault, Application Insights.
- Microsoft Graph for SharePoint lists and document library, and for notification email.

## Operating model

The API is stateless: it validates, writes to SharePoint, and sends a notification. Staff work in tools they already have.

| | Enquiry | Job application |
|---|---|---|
| Stored in | SharePoint list `Enquiries` | SharePoint list `Applications`; CV in a private document library |
| Notified | BD@kiaratechs.ai (confirmed in the content document) | jobs@kiaratechs.com |
| Worked by | BD, `Status`: New → Contacted → Qualified / Closed | HR, `Status`: New → Screening → Interview → Rejected / Hired |
| Retention | Microsoft 365 retention policy (period from Legal) | Same, for items and CVs |

- Notification emails carry a link to the item only, never form contents or the CV.
- Graph app registration uses `Sites.Selected` (write to the one site only) and `Mail.Send` limited to the sending mailbox with an application access policy.
- SharePoint permissions: BD sees `Enquiries` only; HR sees `Applications` and CVs only.

## Security

Target: OWASP ASVS Level 2. CI fails on any high or critical finding.

| Check | Tool |
|---|---|
| Static analysis | Bandit, Semgrep |
| Dependencies | pip-audit (pinned, hashed requirements), Dependabot |
| Secrets | gitleaks |
| Container | Trivy; slim/distroless image, non-root, read-only filesystem |
| Dynamic scan (staging) | OWASP ZAP |
| Tests | pytest, including abuse cases |

In the service:

- Pydantic models mirror every frontend rule (`frontend/src/lib/validation.ts`, `application.ts`); unknown fields rejected; control characters stripped.
- CV: PDF, Word (.docx) or older Word (.doc), up to 5 MB, enforced while streaming; type checked from the file's bytes; macro-enabled Word (.docm, even renamed) refused; malware scan by a ClamAV sidecar before upload (Safe Attachments, if licensed, is only a second layer: it scans after storage); stored under a readable name built from validated fields, e.g. `Priya Shah - Senior Backend Engineer - 2026-11-17 - 3f9c1a2b.pdf`, never the applicant's own file name.
- Abuse: Cloudflare Turnstile verified server-side, honeypot field, rate limit per IP, request size limits.
- CORS restricted to the production domain; HTTPS only; security headers; generic errors, no stack traces.
- No secrets in code or config; Managed Identity to Key Vault and Graph.
- Logs hold request ID, outcome and timing only. No personal data.
- If SharePoint is unavailable, return `503` so the user can retry; nothing is held in the API.
- Before launch: independent penetration test; privacy notice updated (Legal).

## Build order

1. Scaffold service, CI security gates. **Done, on main.** (Staging deploy moved to step 6.)
2. Enquiry endpoint. **Done, on main.**
3. Application endpoint and CV handling. **Done, on main.**
4. Turnstile and rate limits. **Done, on main.**
5. Wire frontend forms; add API and Turnstile origins to the CSP in `frontend/vercel.json`. **Done, on main.**
6. Azure hosting, ZAP scan, penetration test, go live. Hosting steps for the admins: `handover/Kiaratech-Hosting-Handover.pdf`.
   Development side still open: infrastructure as code (Bicep) and a deploy workflow, Application Insights, automated ZAP scan against staging.

## Blockers

- Retention period and data-protection contact, Legal.
- SharePoint site, lists, CV library and Graph permissions, Microsoft 365 admin; Azure resources, Azure admin; Turnstile keys; `api.kiaratechs.com` DNS records.
