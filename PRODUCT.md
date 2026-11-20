# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Website: Next.js (App Router, static export) + React + TypeScript + Tailwind CSS, hosted on Vercel, in `frontend/`.
Form API: Python (FastAPI) on Azure Container Apps with a ClamAV sidecar, in `backend/` (deployment in `infra/`). It e-mails each enquiry and job application from noreply@kiaratech.ai, with the CV attached for applications, and stores nothing. See `backend/PLAN.md`.

## Users

Decision-makers at mid-market and enterprise organisations in the UK, Europe, North America and India, especially in automation, logistics, manufacturing, FMCG, technology, finance and professional services. Key buyers: CEO/COO, CTO/CIO, Head of AI/Data, Digital Transformation Director, Engineering Director, Product Leader, and Procurement/HR leaders seeking specialist teams. Secondary audience: job candidates.

## Product Purpose

The corporate website for Kiaratech Solutions. Primary goal: generate qualified AI and software-development opportunities. Secondary: credibility through evidence, clear capability explanation, recruitment, and thought leadership. The homepage must make the value proposition, proof and next action clear within seconds.

Success measures: qualified enquiries, conversion rate, portfolio engagement, careers applications, organic search growth.

## Positioning

"Kiaratech Solutions is an AI-driven technology partner that turns business challenges into intelligent, scalable software powered by specialists." The site moves the positioning from recruitment-led to AI and software outcomes. Talent solutions stay available as a secondary path and must not overshadow technology delivery.

## Operating Context

- Founded in India in 2022; UK presence established in 2025. 110+ professionals; 30+ projects; 12+ clients; 4 years of growth; operations in India and the UK; clients across the UK, Europe, North America and international markets.
- Legal entity: Kiaratech Solutions Private Limited, CIN U62099MR2026PTC480845. Certified to ISO/IEC 27001:2022 (information security, Ranalysis Certification) and ISO 9001:2015 (quality, ACPL Audittech Certification); certificate numbers not published.
- E-mail (all on kiaratech.ai): business enquiries BD@kiaratech.ai; careers jobs@kiaratech.ai; data protection cybersecurity@kiaratech.ai; form e-mails sent from noreply@kiaratech.ai.
- Offices: UK — 60 Tottenham Court Road, Office 250, Fitzrovia, London, W1T 2EW. India — Office No. 1106, Haware Infotech Park, Sector 30A, Vashi (Opposite Inorbit Mall), Navi Mumbai, Maharashtra 400703.
- Mission: Turn ambitious ideas into secure, intelligent and scalable digital solutions that create measurable value. Vision: Become the trusted partner for AI innovation, software engineering and technology transformation. Values: customer impact, integrity, innovation, engineering excellence, collaboration, continuous learning.
- Services (owner list, 31 Oct 2026; replaces the requirements-document categorisation): Software Development, Database Administration, Software Testing & QA, Technical Support & Maintenance, Business Analysis, Scrum & Project Management, Automation Testing, Azure DevOps, System Architecture.
- Featured projects: ARECON AI (AI tender intelligence), FactoryFlow (factory robot digital twin), Smart HR (AI HR workflow automation). Descriptions supplied by the owner; outcomes, clients and tech stacks unverified.
- Engagement models: discovery and AI strategy sprints; fixed-price delivery; dedicated cross-functional teams; staff augmentation; managed support.
- Stack to highlight ("Our Arsenal" navbar menu, owner list, 20 Nov 2026): AI; robotics and industrial automation; cloud and infrastructure; data and analytics; cybersecurity and compliance; enterprise integration; languages and frameworks. Item lists live in `frontend/src/content/site.ts`.

## Capabilities and Constraints

- CTA: one call to action, "Let's Connect", leading to the contact page. No proposal, talent or booking buttons.
- Enquiry form: first name, last name, e-mail, company, topic, "What outcome are you looking for?". Job application form (one page per role): basic details, the role's own questions (experience, CTC, notice period and so on), CV (PDF or Word, up to 5 MB). Both validate in the browser and again in the API.
- Until the API is connected (Vercel settings), both forms show "not connected" with the BD@ or jobs@ address to copy, and send nothing.
- LinkedIn: https://www.linkedin.com/company/kiaratechsolutions (footer icon). WhatsApp: hidden until a verified number is set.
- Legal: Privacy Policy, Terms of Use and Cookie Policy approved (November 2026), under UK GDPR. Retention: 6 months for enquiries and applications. No analytics or advertising cookies, so no consent banner; adding any non-essential cookie needs a consent banner first.
- No leadership section.
- Undecided: analytics, client logos, testimonials.

## Brand Commitments

- Logo: the 2026 K-mark wordmark (source `assets/brand-sources/kiaratech-logo-2026.jpg`), used as supplied; the K mark alone is the favicon.
- Palette (owner brand sheet, Nov 2026): White #FEFEFE, Deep Navy #022162, Electric Blue #0071FD, with light blue #EAF2FF, alternate #F5F8FC, text #172033, secondary text #64748B and borders #E2E8F0. White navbar with navy text; Capabilities and Our Arsenal menus open as deep navy panels. Never an all-dark site.
- Relevant imagery is expected: Pexels photography for services and hero, product screenshots or accurate mockups for projects.
- Voice: concise, professional UK business English. Avoid robot and handshake imagery.

## Evidence on Hand

- Company figures above (approved in the requirements document).
- Featured projects: ARECON AI, FactoryFlow and Smart HR (owner descriptions). Shown with coded product animations until product screenshots are approved.
- Supplied by the company: the two ISO certificates, the CIN, the team photo and the company film (Our Story).
- Pending: product screenshots and verified outcomes for all projects.
- No approved client names, logos, testimonials or partnerships yet. Do not fabricate any of these.

## Product Principles

1. Outcomes before staffing: lead with AI and software delivery.
2. Evidence over claims: publish only verified facts, and mark gaps as placeholders.
3. Value, proof and next step visible within seconds.
4. Concise and scannable: put detail on dedicated pages, not the homepage.

## Accessibility & Inclusion

Mobile-first, fast and accessible by default (WCAG 2.2 AA target). Keyboard navigation and visible focus. Must work fully with animations disabled.
