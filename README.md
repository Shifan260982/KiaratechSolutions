# Kiaratech Solutions website

Phase 1: a static, frontend-only corporate website. Source of truth: *Internal Requirement Gathering v1.0* (22 Oct 2026).

| Folder | Purpose |
|---|---|
| `frontend/` | Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4 |
| `backend/` | Reserved for Phase 2 (Python, FastAPI; plan in `backend/PLAN.md`). Empty in Phase 1. |
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
| Connect the forms. Enquiries go to `BD@kiaratech.ai` (all company e-mail addresses are on `kiaratech.ai`; the website itself is on `kiaratechs.com`), applications to `jobs@kiaratech.ai`. Forms send nothing until `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set (see `.env.example`, `backend/README.md` and the hosting handover guide, shared privately). | Hosting admins | `ENQUIRY_RECIPIENT` and `APPLICATION_RECIPIENT` on the backend |
| Verified WhatsApp number | Marketing | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Official LinkedIn page URL | Marketing | `NEXT_PUBLIC_LINKEDIN_URL` |
| Product screenshots for ARECON AI, Digital Twin and Smart HR (replace the illustrative mockups in `ProjectVisual.tsx`) | Amey, Atif, Nirupaman | `caseStudies.ts` |
| Verified outcomes for all projects; simulator and AI Academy write-ups | Delivery team, Sunil, Leadership | `caseStudies.ts` |
| Review of all service, industry and homepage copy | Patrick and Amey | `src/content/`, `src/app/page.tsx` |
| Approval of the draft Insights article | Sunil and Ameya | `insights.ts` |
| Hiring steps and equal-opportunity statement | HR | `src/app/careers/page.tsx` |
| Privacy Policy, Terms of Use, Cookie Policy: company number, ICO number, data-protection contact, retention, transfers, governing law | Legal / Compliance | `src/app/privacy`, `terms`, `cookies` |
| Accessibility and modern-slavery statements, if applicable | Legal / Compliance | not built |
| Favicon and brand pack (SVG logo, colour values) | Rakhi | `public/brand/` |
| Team and office photos (with consent) | Rakhi / HR | not used yet |
| Client logos, testimonials, certifications, partnerships | Patrick, HR / Compliance | not shown; do not add unverified items |
| Analytics and Search Console. Add a cookie-consent banner at the same time as any non-essential cookies. | Marketing | not built |

## Image credits

All photographs are from [Pexels](https://www.pexels.com/license/): free for commercial use and modification, with no attribution required. Pexels does not allow identifiable people to be shown in a way that implies they endorse a product. Several photos show identifiable people (the hero slides, the About portrait and the Smart HR backdrop), so never caption them as Kiaratech staff or clients; replace them with approved team photos when available. Project backdrops illustrate each project's domain; they are not product screenshots. Files are resized and converted to WebP in `frontend/public/images/`.

| File | Photo | Photographer | Used on |
|---|---|---|---|
| `hero/engineering-team.webp` | [6804068](https://www.pexels.com/photo/6804068/) | cottonbro studio | Hero slide 1 |
| `hero/software-code.webp` | [6424583](https://www.pexels.com/photo/6424583/) | Nemuel Sereti | Hero slide 2 |
| `hero/cloud-infrastructure.webp` | [17489163](https://www.pexels.com/photo/17489163/) | panumas nikhomkhai | Hero slide 3 |
| `hero/team-collaboration.webp` | [12903168](https://www.pexels.com/photo/12903168/) | Mizuno K | Hero slide 4 (cropped to landscape) |
| `about/greeting.webp` | Supplied by the Kiaratech team (source: `assets/about-greeting-source.png`); licence to be confirmed | | Homepage About greeting |
| `projects/arecon-ai.webp` | [8441814](https://www.pexels.com/photo/8441814/) | Kampus Production | ARECON AI slide backdrop |
| `projects/digital-twin.webp` | [34222005](https://www.pexels.com/photo/34222005/) | Freek Wolsink | Digital Twin slide backdrop |
| `projects/smart-hr.webp` | [5439368](https://www.pexels.com/photo/5439368/) | Tima Miroshnichenko | Smart HR slide backdrop |
| `services/software-development.webp` | [4976712](https://www.pexels.com/photo/4976712/) | Godfrey Atima | Software Development card and page |
| `services/database-administration.webp` | [1148820](https://www.pexels.com/photo/1148820/) | panumas nikhomkhai | Database Administration |
| `services/software-testing-qa.webp` | [34803988](https://www.pexels.com/photo/34803988/) | Daniil Komov | Software Testing & QA |
| `services/technical-support.webp` | [37605911](https://www.pexels.com/photo/37605911/) | panumas nikhomkhai | Technical Support & Maintenance |
| `services/business-analysis.webp` | [7869111](https://www.pexels.com/photo/7869111/) | Pavel Danilyuk | Business Analysis |
| `services/scrum-project-management.webp` | [6804093](https://www.pexels.com/photo/6804093/) | cottonbro studio | Scrum & Project Management |
| `services/automation-testing.webp` | [34804018](https://www.pexels.com/photo/34804018/) | Daniil Komov | Automation Testing |
| `services/azure-devops.webp` | [1181341](https://www.pexels.com/photo/1181341/) | Christina Morillo | Azure DevOps |
| `services/system-architecture.webp` | [1181311](https://www.pexels.com/photo/1181311/) | Christina Morillo | System Architecture |

Project visuals (ARECON AI, FactoryCopilot, Smart HR) are coded mockups in `frontend/src/components/ProjectVisual.tsx`. They contain no real data.
