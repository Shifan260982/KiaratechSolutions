// Project descriptions supplied by the Kiaratech team (Oct 2026). Client names must stay anonymised.
// Outcomes are published only once verified; until then `outcome` stays undefined and the UI shows a placeholder.
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
  },
  {
    slug: "factorycopilot",
    name: "FactoryCopilot",
    title: "AI-Based Factory Simulator",
    summary: "End-to-end visibility of every parcel on the factory floor.",
    description:
      "A real-time 3D factory interface that tracks every parcel across inbound docks, warehouses, conveyors, robotic picking and outbound dispatch, providing end-to-end visibility into factory operations.",
    capabilities: [
      "Real-time 3D factory visualisation",
      "Parcel tracking",
      "Warehouse and conveyor monitoring",
      "Robotic picking visibility",
      "End-to-end operational tracking",
    ],
    tags: ["Digital twin", "Real-time 3D", "Logistics & manufacturing"],
    serviceSlugs: ["software-development"],
    visual: "digital-twin",
    photo: { src: "/images/projects/digital-twin.webp", alt: "Automated production line with conveyors and a robotic gantry in a factory" },
    featured: true,
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
  },
  {
    slug: "warehouse-production-platform",
    name: "Warehouse platform",
    title: "Integrated warehouse and production management platform",
    summary: "One platform for warehouse and production operations.",
    description:
      "We develop and maintain an integrated warehouse and production management platform, covering inventory control, production planning, system integrations, .NET backend services, UI enhancements and end-to-end testing, to support reliable, efficient business operations.",
    capabilities: [
      "Inventory control",
      "Production planning",
      "System integrations",
      ".NET backend services",
      "UI enhancements",
      "End-to-end testing",
    ],
    tags: ["Warehousing", "Production", ".NET"],
    serviceSlugs: ["software-development", "software-testing-qa", "technical-support"],
  },
];

export const featuredProjects = caseStudies.filter((c) => c.featured);
export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
