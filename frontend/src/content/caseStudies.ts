// Project descriptions supplied by the Kiaratech team (Oct 2026). Client names must stay anonymised.
// Outcomes are published only once verified; until then `outcome` stays undefined and the UI shows a placeholder.
// ARECON AI and Smart HR outcomes come from the team's case study PDFs (Nov 2026), which state them as design targets.
// FactoryFlow copy and outcome were supplied by the team (Nov 2026).
// Do not add technology stacks or metrics that have not been confirmed.

export type ProjectVisual = "arecon" | "digital-twin" | "smart-hr";

export type CaseStudy = {
  slug: string;
  name: string;
  title: string;
  summary: string;
  description: string;
  capabilities: string[];
  tags: string[];
  serviceSlugs: string[];
  visual?: ProjectVisual;
  /** Stock photograph of the problem domain, used as a backdrop. Not a product screenshot. */
  photo?: { src: string; alt: string };
  featured?: boolean;
  outcome?: string;
  /** Case study PDF in /public, shown in the in-page viewer on the portfolio page. */
  pdf?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "arecon-ai",
    name: "ARECON AI",
    title: "AI-Powered Tender Intelligence Platform",
    summary: "Turn tender complexity into clear decisions.",
    description:
      "An AI-powered platform for construction and infrastructure firms that analyses tender documents and generates structured reports covering costs, timelines, eligibility, risks and obligations, with source-page references for every extracted fact.",
    capabilities: [
      "AI-powered document analysis",
      "Tender information extraction",
      "Risk and eligibility assessment",
      "Cost and timeline identification",
      "Source-linked findings",
    ],
    tags: ["AI", "Document intelligence", "Construction & infrastructure"],
    serviceSlugs: ["software-development"],
    visual: "arecon",
    photo: { src: "/images/projects/arecon-ai.webp", alt: "Professional reviewing printed documents beside a laptop showing charts" },
    featured: true,
    outcome:
      "Designed to turn hundreds of pages read by hand into a bid / no-bid snapshot within 5 minutes and a full cited tender report within 30 minutes. Every fact links to the page it came from, and anything that cannot be proven is flagged rather than guessed. The platform is built for 1,000 users at once with 99.9% availability, and keeps each customer's data encrypted and separate.",
    pdf: "/docs/arecon-ai-case-study.pdf",
  },
  {
    slug: "factoryflow",
    name: "FactoryFlow",
    title: "Factory Robot Digital Twin",
    summary: "A live 3D view of every parcel, from inbound dock to outbound pallet.",
    description:
      "A live 3D simulation of a whole parcel-handling factory. It takes stacks from the inbound dock through four automated warehouses, routes each parcel by its own robot telegram to one of five robots, then ships loaded pallets out of a single outlet.",
    capabilities: [
      "Live 3D simulation of the whole factory",
      "Four automated warehouses",
      "Telegram-based routing to five robots",
      "Per-parcel status proof",
      "Event dashboard with CSV export",
    ],
    tags: ["Digital twin", "Real-time 3D", "Logistics & manufacturing"],
    serviceSlugs: ["software-development"],
    visual: "digital-twin",
    photo: { src: "/images/projects/digital-twin.webp", alt: "Automated production line with conveyors and a robotic gantry in a factory" },
    featured: true,
    outcome:
      "A clickable view of where every parcel is, with proof (VALID, SHIPPED, INVALID and so on) that each parcel reached the right robot. Every movement is recorded in a full audit trail, shown in an event dashboard that can be exported to CSV.",
  },
  {
    slug: "smart-hr",
    name: "Smart HR",
    title: "AI-Powered HR Workflow Automation",
    summary: "Less admin for HR teams, faster hiring.",
    description:
      "An intelligent HR solution designed to streamline recruitment and administrative workflows through resume shortlisting, email drafting and interview scheduling, helping HR teams manage hiring activities more efficiently.",
    capabilities: [
      "Resume screening and shortlisting",
      "AI-assisted email drafting",
      "Interview scheduling",
      "Recruitment workflow management",
      "HR task automation",
    ],
    tags: ["AI", "Workflow automation", "HR & recruitment"],
    serviceSlugs: ["software-development"],
    visual: "smart-hr",
    photo: { src: "/images/projects/smart-hr.webp", alt: "Two people in an interview across a desk in a bright office" },
    featured: true,
    outcome:
      "Designed to replace downloading and reading every resume by hand: resumes are collected and read automatically every 2 minutes. Skills are matched by meaning, with a quoted resume line as evidence for each match, and the same checklist gives the same result every time. The AI never sees personal details, and no email is sent without HR approval.",
    pdf: "/docs/smart-hr-case-study.pdf",
  },
];

export const featuredProjects = caseStudies.filter((c) => c.featured);
export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
