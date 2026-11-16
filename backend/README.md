# Backend (Phase 2)

Reserved for the Phase 2 backend (Python, FastAPI). Nothing in Phase 1 depends on this folder. See [PLAN.md](PLAN.md).

Integration points already prepared in the frontend:

- `frontend/src/lib/enquiry.ts`: `submitEnquiry()` currently returns `not-connected`. Replace it with a POST to the enquiry API.
- `frontend/src/lib/validation.ts`: client-side rules for the enquiry form. The API must re-validate every field server-side, and add spam protection and rate limiting.
- Discovery-call booking CTAs currently link to `/contact?type=discovery`.
- After adding an API origin, update `connect-src` in `frontend/vercel.json` (Content-Security-Policy).
