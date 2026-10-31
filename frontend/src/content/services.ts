// Service scope follows section 2 of the requirements document. Order = promotion priority.
// Use cases describe the kind of work each service covers; they are not claims about past clients.

export type Service = {
  slug: string;
  name: string;
  summary: string;
  metaDescription: string;
  intro: string;
  capabilities: { title: string; detail: string }[];
  problems: string[];
  useCases: { title: string; detail: string }[];
  technologies?: string[];
  caseStudySlugs: string[];
  secondary?: boolean;
};

export const services: Service[] = [
  {
    slug: "ai-solutions",
    name: "AI & Intelligent Automation",
    summary: "GenAI solutions, copilots, AI agents, machine learning and document intelligence, designed around measurable outcomes.",
    metaDescription:
      "AI consulting, GenAI solutions, copilots, AI agents, machine learning, document intelligence and predictive analytics from Kiaratech Solutions.",
    intro:
      "We help organisations move AI from experiment to production. Every engagement starts with a defined business goal, the data available to support it and the success criteria it must meet.",
    capabilities: [
      { title: "AI strategy and discovery sprints", detail: "Assess use cases, data readiness and risk, then prioritise the opportunities worth building." },
      { title: "Generative AI ", detail: "Assistants grounded in your own documents and systems, with access controls and evaluation built in." },
      { title: "AI agents", detail: "Agents that complete multi-step tasks across your tools, with human approval where it matters." },
      { title: "Machine learning and predictive analytics", detail: "Forecasting, classification and anomaly detection models, deployed and monitored." },
      { title: "Document intelligence", detail: "Extract, classify and validate data from invoices, forms, contracts and operational documents." },
      { title: "RPA and intelligent automation", detail: "Combine rules-based automation with AI to handle high-volume, repetitive work." },
    ],
    problems: [
      "AI pilots that never reach production or show a return",
      "Knowledge spread across documents and systems that teams cannot find quickly",
      "Manual review of high volumes of documents and data",
      "Decisions made on lagging reports instead of forward-looking signals",
    ],
    useCases: [
      { title: "Operations copilot", detail: "Answer staff questions from procedures, product data and system records." },
      { title: "Document processing", detail: "Capture data from purchase orders, delivery notes and invoices into core systems." },
      { title: "Demand and inventory forecasting", detail: "Predict stock and production needs for logistics, FMCG and manufacturing teams." },
      { title: "Service desk agents", detail: "Triage, route and resolve routine requests across IT and business functions." },
    ],
    technologies: ["Python", "Azure", "AWS", "Google Cloud", "APIs"],
    caseStudySlugs: [],
  },
  {
    slug: "software-development",
    name: "Software Engineering",
    summary: "Web, mobile and enterprise applications, APIs, integration, testing and QA.",
    metaDescription:
      "Custom software development and product engineering: web, mobile and enterprise applications, APIs, system integration, testing and QA.",
    intro:
      "We design, build and maintain business-critical software. Delivery runs in short, visible milestones, with automated testing and documentation as standard.",
    capabilities: [
      { title: "Enterprise applications", detail: "Line-of-business systems for operations, finance and production teams." },
      { title: "Web and mobile applications", detail: "Customer and staff-facing products built for performance and accessibility." },
      { title: "APIs and system integration", detail: "Connect ERP, warehouse, CRM and third-party platforms reliably." },
      { title: "Testing and QA", detail: "Automated and end-to-end testing that keeps releases predictable." },
      { title: "Product engineering teams", detail: "Dedicated cross-functional teams that own a product roadmap with you." },
      { title: "Managed support", detail: "Ongoing maintenance, enhancements and continuous improvement." },
    ],
    problems: [
      "Legacy systems that slow down change and are costly to maintain",
      "Disconnected systems that force manual re-keying of data",
      "Releases that break existing functionality",
      "Product roadmaps that outpace in-house engineering capacity",
    ],
    useCases: [
      { title: "Warehouse and production platforms", detail: "Inventory, production planning and integrations in one system." },
      { title: "Customer and partner portals", detail: "Self-service access to orders, documents and account information." },
      { title: "Integration layers", detail: "APIs that synchronise data between core business systems." },
      { title: "Modernising legacy applications", detail: "Incremental re-platforming without disrupting operations." },
    ],
    technologies: [".NET / C#", "Java", "Node.js", "Python", "React", "Angular", "Vue.js"],
    caseStudySlugs: ["warehouse-production-platform"],
  },
  {
    slug: "cloud-data",
    name: "Cloud & Data",
    summary: "Azure, AWS and Google Cloud, DevOps, data engineering, analytics and modernisation.",
    metaDescription:
      "Cloud and data services: Azure, AWS and Google Cloud, DevOps, data engineering, Power BI, Tableau and Looker analytics, and modernisation.",
    intro:
      "We build the cloud and data foundations that AI and modern applications depend on: secure, observable and cost-aware.",
    capabilities: [
      { title: "Cloud architecture and migration", detail: "Azure, AWS and Google Cloud platforms designed for security and cost control." },
      { title: "DevOps and automation", detail: "CI/CD pipelines, infrastructure as code and environment management." },
      { title: "Data engineering", detail: "Pipelines and models that bring operational data into one trusted source." },
      { title: "Analytics and reporting", detail: "Power BI, Tableau and Looker dashboards built on governed data." },
      { title: "Application modernisation", detail: "Move workloads from on-premises and legacy hosting to managed services." },
    ],
    problems: [
      "Reporting that relies on spreadsheets and manual extracts",
      "Rising cloud costs without clear ownership",
      "Slow, manual deployments",
      "Data that is not ready for AI use",
    ],
    useCases: [
      { title: "Operational dashboards", detail: "Single view of orders, stock and production performance." },
      { title: "Data platform for AI", detail: "Clean, governed data ready for analytics and machine learning." },
      { title: "Release automation", detail: "Repeatable deployments with automated testing gates." },
    ],
    technologies: ["Azure", "AWS", "Google Cloud", "Power BI", "Tableau", "Looker"],
    caseStudySlugs: [],
  },
  {
    slug: "automation",
    name: "Automation",
    summary: "Process, workflow and test automation that removes repetitive work and manual hand-offs.",
    metaDescription:
      "Business process automation, RPA, workflow integration and automated testing from Kiaratech Solutions.",
    intro:
      "We automate the repetitive work that slows teams down, from back-office processes to software testing, and combine it with AI where judgement is needed.",
    capabilities: [
      { title: "Robotic process automation", detail: "Automate rules-based tasks across existing applications." },
      { title: "Workflow and integration automation", detail: "Remove manual hand-offs between systems and teams." },
      { title: "Intelligent document workflows", detail: "Route, validate and approve documents with AI-assisted checks." },
      { title: "Test automation", detail: "Automated regression and end-to-end testing for faster, safer releases." },
    ],
    problems: [
      "Teams spending hours on copy-and-paste between systems",
      "Error-prone manual processes in finance and operations",
      "Long manual regression cycles before each release",
    ],
    useCases: [
      { title: "Finance operations", detail: "Invoice matching, reconciliations and reporting." },
      { title: "Order and fulfilment workflows", detail: "Order capture and status updates across logistics systems." },
      { title: "Regression testing", detail: "Automated test suites run on every release." },
    ],
    caseStudySlugs: ["warehouse-production-platform"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    summary: "Zero Trust, identity and access management, risk and compliance.",
    metaDescription:
      "Cybersecurity and advisory services: Zero Trust architecture, identity and access management, risk and compliance.",
    intro:
      "We help organisations reduce risk across applications, cloud platforms and identities, and build security into delivery rather than adding it at the end.",
    capabilities: [
      { title: "Zero Trust architecture", detail: "Verify every user, device and service before granting access." },
      { title: "Identity and access management", detail: "Single sign-on, role-based access and privileged access controls." },
      { title: "Risk and compliance", detail: "Assess controls against regulatory and contractual requirements." },
      { title: "Secure engineering", detail: "Security reviews and tooling embedded in the software lifecycle." },
    ],
    problems: [
      "Inconsistent access controls across cloud and on-premises systems",
      "Security reviews that delay releases",
      "Unclear exposure to regulatory and client security requirements",
    ],
    useCases: [
      { title: "Identity consolidation", detail: "Move users to a single, governed identity platform." },
      { title: "Security assessment", detail: "Review applications and infrastructure against agreed controls." },
      { title: "AI governance", detail: "Controls for data access and model use in AI solutions." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "talent-solutions",
    name: "Talent Solutions",
    summary: "Contract and permanent technology specialists to extend your team.",
    metaDescription:
      "Contract and permanent technology specialists: software engineers, business analysts, Scrum Masters, test engineers, cloud, data and AI roles.",
    intro:
      "When you need to add capacity to an existing team, we provide contract and permanent specialists drawn from the same disciplines we deliver in.",
    capabilities: [
      { title: "Staff augmentation", detail: "Specialists who join your team under your delivery leadership." },
      { title: "Permanent placement", detail: "Technology hires for long-term roles." },
      { title: "Dedicated teams", detail: "Cross-functional teams managed by Kiaratech, aligned to your goals." },
    ],
    problems: [
      "Hiring timelines that delay delivery",
      "Short-term demand for specialist skills",
    ],
    useCases: [
      { title: "Engineering capacity", detail: "Software, full-stack and frontend developers." },
      { title: "Delivery roles", detail: "Business analysts and Scrum Masters." },
      { title: "Specialist skills", detail: "Automation test engineers, cloud, data and AI specialists." },
    ],
    caseStudySlugs: [],
    secondary: true,
  },
];

export const coreServices = services.filter((s) => !s.secondary);
export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const engagementModels = [
  { title: "Discovery and AI strategy sprints", detail: "A short, fixed-scope assessment that defines goals, options and a delivery plan." },
  { title: "Fixed-price delivery", detail: "Defined outcomes, milestones and acceptance criteria agreed up front." },
  { title: "Dedicated product teams", detail: "Cross-functional teams that build and evolve a product with you." },
  { title: "Staff augmentation", detail: "Specialists who join your team to add capacity or skills." },
  { title: "Managed support", detail: "Ongoing maintenance and continuous improvement after launch." },
];
