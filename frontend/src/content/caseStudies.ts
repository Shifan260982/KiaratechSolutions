// Client names must stay anonymised (requirements 2.2). Outcomes are published only once verified
// by the delivery team; until then `outcome` stays undefined and the UI shows a placeholder.

export type CaseStudy = {
  slug: string;
  title: string;
  sector: string;
  serviceSlugs: string[];
  problem: string;
  solution: string;
  scope: string[];
  outcome?: string;
};

export type PendingCaseStudy = {
  title: string;
  owner: string;
  needed: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "warehouse-production-platform",
    title: "Integrated warehouse and production management platform",
    sector: "Warehousing and production",
    serviceSlugs: ["software-development", "automation"],
    problem:
      "The client needed its warehouse and production operations to run reliably and efficiently on one integrated platform, rather than across disconnected processes.",
    solution:
      "We develop and maintain an integrated warehouse and production management platform, covering inventory control, production planning, system integrations, .NET backend services, UI enhancements and end-to-end testing.",
    scope: [
      "Inventory control",
      "Production planning",
      "System integrations",
      ".NET backend services",
      "UI enhancements",
      "End-to-end testing",
    ],
  },
];

// Shown on the Case Studies page as clearly marked placeholders until content is approved.
export const pendingCaseStudies: PendingCaseStudy[] = [
  { title: "Arecon AI", owner: "Amey (description: Atif and Nirupaman)", needed: "Product description, problem, solution and verified outcome" },
  { title: "Anonymised client engagement A", owner: "Atif and Nirupaman", needed: "Problem, solution and verified outcome, with client name removed" },
  { title: "Anonymised client engagement B", owner: "Atif and Nirupaman", needed: "Problem, solution and verified outcome, with client name removed" },
  { title: "Simulator project", owner: "Sunil", needed: "Problem, solution and verified outcome" },
  { title: "AI Academy", owner: "Leadership", needed: "Programme description and verified outcome" },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
