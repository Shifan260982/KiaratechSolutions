# Kiaratech Solutions website

Phase 1: a static, frontend-only corporate website. Source of truth: *Internal Requirement Gathering v1.0* (22 Oct 2026).

| Folder | Purpose |
|---|---|
| `frontend/` | Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4 |
| `backend/` | Reserved for Phase 2 (Node.js and FastAPI). Empty in Phase 1. |
| `assets/` | Original brand assets (logo source) |
| `PRODUCT.md` / `DESIGN.md` | Product facts and the design system |

## Run locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Checks (run before every merge):

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

`npm run build` writes the static site to `frontend/out/`.

## Editing content

All copy and data live in `frontend/src/content/`. Pages render from these files.

| File | Contents |
|---|---|
| `site.ts` | Company facts, CTAs, metrics, offices, contact settings |
| `services.ts` | Service pages (template: `src/app/services/[slug]/page.tsx`) |
| `caseStudies.ts` | Published case studies and pending placeholders |
| `industries.ts` | Industries page |
| `jobs.ts` | Live vacancies (leave empty when none are open) |
| `insights.ts` | Articles (template: `src/app/insights/[slug]/page.tsx`) |

Anything awaiting approval is rendered with the `<Placeholder>` component. Search the code for `Placeholder` and `Required` to find every open item.

## Deploy to Vercel

1. Import the repository into Vercel and set **Root Directory** to `frontend`. The framework preset is detected as Next.js.
2. Add the environment variables from `frontend/.env.example`. All are public and non-secret.
3. Deploy. Security headers (CSP, HSTS, nosniff, referrer and permissions policies) are set in `frontend/vercel.json`.
4. Add the production domain and point DNS at Vercel (DNS owner: Patrick).

## Before launch: required content and approvals

| Item | Owner (per requirements) | Where |
|---|---|---|
| Contact-form destination (8.6 is TBD). Form validates but sends nothing. | Patrick | `src/lib/enquiry.ts` (Phase 2) |
| Verified WhatsApp number | Marketing | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Official LinkedIn page URL | Marketing | `NEXT_PUBLIC_LINKEDIN_URL` |
| Verified outcome for the warehouse and production case study | Delivery team | `caseStudies.ts` |
| Case studies: Arecon AI, two anonymised engagements, simulator, AI Academy | Amey, Atif, Nirupaman, Sunil | `caseStudies.ts` |
| Review of all service, industry and homepage copy | Patrick and Amey | `src/content/`, `src/app/page.tsx` |
| Approval of the draft Insights article | Sunil and Ameya | `insights.ts` |
| Hiring steps and equal-opportunity statement | HR | `src/app/careers/page.tsx` |
| Privacy Policy, Terms of Use, Cookie Policy: company number, ICO number, data-protection contact, retention, transfers, governing law | Legal / Compliance | `src/app/privacy`, `terms`, `cookies` |
| Accessibility and modern-slavery statements, if applicable | Legal / Compliance | not built |
| Favicon and brand pack (SVG logo, colour values) | Rakhi | `public/brand/` |
| Team and office photos (with consent) | Rakhi / HR | not used yet |
| Client logos, testimonials, certifications, partnerships | Patrick, HR / Compliance | not shown; do not add unverified items |
| Analytics and Search Console. Add a cookie-consent banner at the same time as any non-essential cookies. | Marketing | not built |
| Note: the requirements list `BD@kiaratechs.ai` while the site domain is `kiaratechs.com`. No business email is shown on the site, by decision. | Patrick | |
