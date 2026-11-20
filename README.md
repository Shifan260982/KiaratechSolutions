# Kiaratech Solutions website

The Kiaratech Solutions corporate website (static Next.js on Vercel) and its form API (FastAPI on Azure Container Apps), which e-mails enquiries and job applications. Source of truth: *Internal Requirement Gathering v1.0* (22 Oct 2026).

| Folder | Purpose |
|---|---|
| `frontend/` | Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4 |
| `backend/` | Form API for enquiries and job applications (Python, FastAPI; see `backend/README.md` and `backend/PLAN.md`) |
| `assets/` | Original brand, photo and video sources |
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
| `site.ts` | Company facts (CIN, certifications), e-mail addresses, CTAs, metrics, offices, Our Arsenal |
| `services.ts` | Service pages (template: `src/app/services/[slug]/page.tsx`) |
| `caseStudies.ts` | Portfolio projects (ARECON AI, FactoryFlow, Smart HR) |
| `jobs.ts` | Live vacancies; remove a role as soon as it closes |

Office maps are static files in `frontend/public/images/maps/` (world: Natural Earth, India point-of-view boundaries; streets: OpenStreetMap, credited on the map). Regenerate them if an office moves.

## Deploy the website to Vercel

1. Import the repository into Vercel and set **Root Directory** to `frontend`. The framework preset is detected as Next.js.
2. Add the environment variables from `frontend/.env.example`. All are public and non-secret.
3. Deploy. Security headers (CSP, HSTS, nosniff, referrer and permissions policies) are set in `frontend/vercel.json`.
4. Add the production domain and point DNS at Vercel (DNS owner: Patrick).

## Before launch: required content and approvals

| Item | Owner | Where |
|---|---|---|
| Connect the forms: set `NEXT_PUBLIC_API_URL` (no trailing slash: one silently switches the forms off) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` on Vercel, and keep `connect-src` in `frontend/vercel.json` on the same API host. Until both are set, the forms say "not connected" and send nothing. | Hosting admins | `frontend/.env.example`, `backend/README.md` |
| E-mail: create `noreply@kiaratech.ai` and grant the API `Mail.Send` (and `Mail.ReadWrite` for CVs over 3 MB) on that mailbox only; then set `MAIL_SENDER`, `ENQUIRY_RECIPIENT=BD@kiaratech.ai` and `APPLICATION_RECIPIENT=jobs@kiaratech.ai` | Microsoft 365 admin, hosting admins | GitHub environment `production` variables (see `backend/README.md`) |
| Deploy the API: `infra/foundation.bicep` once, the Turnstile secret into Key Vault, then **Actions > deploy** | Azure admin | `infra/README.md` |
| 6-month deletion of enquiries, applications and CVs, as the Privacy Policy states: retention policies on the BD@ and jobs@ inboxes and the noreply@ Sent Items | Microsoft 365 admin | Exchange |
| Verified outcome for each project (each project page shows a visible "Placeholder" box until one is added) | Delivery team | `outcome` in `caseStudies.ts` |
| Product screenshots, if they should replace the coded product animations | Amey, Atif, Nirupaman | `ProjectVisual.tsx` |
| Full job descriptions for roles that only have a one-line summary | HR | `jobs.ts` |
| ICO registration number, if Kiaratech has one | Legal / Compliance | `src/app/privacy/page.tsx` |
| Legal sign-off: governing law (England and Wales), international transfer wording, Cloudflare Turnstile description, registered office | Legal / Compliance | `privacy`, `terms`, `cookies` pages |
| Confirm the Navi Mumbai pin on the office street map | Office team | `OfficeExplorer.tsx`, `public/images/maps/` |
| Licence for the homepage greeting photo and the supplied hero photos; approved team photos to replace stock photos of identifiable people | Rakhi / HR | `public/images/` |
| Verified WhatsApp number (WhatsApp links stay hidden until set) | Marketing | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Accessibility and modern-slavery statements, if applicable | Legal / Compliance | not built |
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
| `projects/digital-twin.webp` | [34222005](https://www.pexels.com/photo/34222005/) | Freek Wolsink | FactoryFlow slide backdrop |
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

Project visuals (ARECON AI, FactoryFlow, Smart HR) are coded mockups in `frontend/src/components/ProjectVisual.tsx`. They contain no real data.
