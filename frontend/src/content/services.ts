// Service list supplied by the Kiaratech team (Oct 2026 brief), replacing the earlier categorisation.
// Use cases describe the kind of work each service covers; they are not claims about past clients.
// Images: Pexels licence, see README "Image credits".

export type Service = {
  slug: string;
  name: string;
  summary: string;
  metaDescription: string;
  intro: string;
  image: { src: string; alt: string };
  capabilities: { title: string; detail: string }[];
  problems: string[];
  useCases: { title: string; detail: string }[];
  technologies?: string[];
  caseStudySlugs: string[];
};

export const services: Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    summary: "Web, mobile and enterprise applications built for performance, security and long-term maintainability.",
    metaDescription: "Custom software development: web, mobile and enterprise applications, APIs and integrations from Kiaratech Solutions.",
    intro:
      "We design, build and maintain business-critical software. Delivery runs in short, visible milestones, with code review, automated testing and documentation as standard.",
    image: { src: "/images/services/software-development.webp", alt: "Source code with syntax highlighting on a monitor" },
    capabilities: [
      { title: "Enterprise applications", detail: "Line-of-business systems for operations, finance and production teams." },
      { title: "Web and mobile applications", detail: "Customer and staff-facing products built for speed and accessibility." },
      { title: "APIs and integration", detail: "Connect ERP, CRM, warehouse and third-party platforms reliably." },
      { title: "AI-enabled features", detail: "Document intelligence, assistants and automation built into your products." },
    ],
    problems: [
      "Legacy systems that slow down change and are costly to maintain",
      "Disconnected systems that force manual re-keying of data",
      "Product roadmaps that outpace in-house engineering capacity",
    ],
    useCases: [
      { title: "Operations platforms", detail: "Inventory, planning and workflow systems in one application." },
      { title: "Customer and partner portals", detail: "Self-service access to orders, documents and account data." },
      { title: "Legacy modernisation", detail: "Incremental re-platforming without disrupting operations." },
    ],
    technologies: [".NET / C#", "Java", "Node.js", "Python", "React", "Angular", "Vue.js"],
    caseStudySlugs: ["arecon-ai", "factorypall", "smart-hr"],
  },
  {
    slug: "database-administration",
    name: "Database Administration",
    summary: "Design, tuning, backup and monitoring that keep business data fast, secure and available.",
    metaDescription: "Database administration (DBA) services: performance tuning, backup and recovery, security, monitoring and migration.",
    intro:
      "We look after the databases your applications depend on, from schema design and performance tuning to backup, recovery and security.",
    image: { src: "/images/services/database-administration.webp", alt: "Rack of storage drives in a blue-lit data centre" },
    capabilities: [
      { title: "Performance tuning", detail: "Query, index and configuration optimisation for faster applications." },
      { title: "Backup and recovery", detail: "Tested backup routines and recovery plans that meet your targets." },
      { title: "Security and access", detail: "Least-privilege access, auditing and encryption of sensitive data." },
      { title: "Migration and upgrades", detail: "Move databases to new versions or cloud platforms with minimal downtime." },
    ],
    problems: [
      "Slow queries that degrade application performance",
      "Untested backups and unclear recovery times",
      "Database access that is broader than it needs to be",
    ],
    useCases: [
      { title: "Health checks", detail: "Assess performance, capacity and risk across your estate." },
      { title: "Managed DBA support", detail: "Ongoing monitoring, patching and maintenance." },
      { title: "Cloud database migration", detail: "Move on-premises databases to managed cloud services." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "software-testing-qa",
    name: "Software Testing & Quality Assurance",
    summary: "Functional, regression and end-to-end testing that keeps every release predictable.",
    metaDescription: "Software testing and quality assurance: functional, regression, integration and end-to-end testing.",
    intro:
      "We build quality into delivery with structured test planning, functional and regression testing, and clear reporting on release readiness.",
    image: { src: "/images/services/software-testing-qa.webp", alt: "Code editor showing a project's unit test files" },
    capabilities: [
      { title: "Test strategy and planning", detail: "Risk-based test plans aligned to business priorities." },
      { title: "Functional and regression testing", detail: "Confirm new features work and existing ones still do." },
      { title: "Integration and end-to-end testing", detail: "Validate complete workflows across connected systems." },
      { title: "Release readiness reporting", detail: "Clear defect and coverage reporting for go/no-go decisions." },
    ],
    problems: [
      "Releases that break existing functionality",
      "Defects found by users instead of testers",
      "No clear view of whether a release is ready",
    ],
    useCases: [
      { title: "Independent QA", detail: "A dedicated test team alongside your developers." },
      { title: "User acceptance support", detail: "Plan and run UAT with business users." },
      { title: "Test process improvement", detail: "Introduce standards, tooling and metrics." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "technical-support",
    name: "Technical Support & Maintenance",
    summary: "Monitoring, incident resolution and continuous improvement for systems already in production.",
    metaDescription: "Technical support and application maintenance: monitoring, incident management, fixes and enhancements.",
    intro:
      "We keep production systems healthy after launch with monitoring, incident handling, fixes and planned enhancements.",
    image: { src: "/images/services/technical-support.webp", alt: "IT technician working at a computer in a server room" },
    capabilities: [
      { title: "Application support", detail: "Incident triage, diagnosis and resolution against agreed service levels." },
      { title: "Monitoring and alerting", detail: "Detect issues before users report them." },
      { title: "Maintenance and patching", detail: "Keep frameworks, dependencies and platforms current and secure." },
      { title: "Enhancements", detail: "Small improvements delivered continuously from a managed backlog." },
    ],
    problems: [
      "Recurring incidents with no root-cause fix",
      "Systems running on outdated, unsupported components",
      "Support knowledge held by one or two people",
    ],
    useCases: [
      { title: "Managed application support", detail: "Ongoing support for business-critical systems." },
      { title: "Support handover", detail: "Take over systems from an outgoing supplier." },
      { title: "Stabilisation", detail: "Reduce incident volume on a troubled system." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "business-analysis",
    name: "Business Analysis",
    summary: "Requirements, process mapping and analysis that turn business goals into buildable plans.",
    metaDescription: "Business analysis services: requirements gathering, process mapping, user stories and solution analysis.",
    intro:
      "Our business analysts work with your stakeholders to understand the problem, map current processes and define requirements your delivery team can build from.",
    image: { src: "/images/services/business-analysis.webp", alt: "Colleagues discussing charts on a whiteboard in a meeting" },
    capabilities: [
      { title: "Requirements gathering", detail: "Workshops and interviews that capture what the business needs." },
      { title: "Process mapping", detail: "Document current and future-state workflows." },
      { title: "User stories and acceptance criteria", detail: "Clear, testable requirements for agile teams." },
      { title: "Data and reporting analysis", detail: "Define the information each team needs to make decisions." },
    ],
    problems: [
      "Projects that start before the problem is understood",
      "Requirements that change late and drive rework",
      "Stakeholders with different views of the goal",
    ],
    useCases: [
      { title: "Discovery phases", detail: "Define scope, options and priorities before build." },
      { title: "Process improvement", detail: "Identify delays and manual steps to remove." },
      { title: "System selection", detail: "Compare options against documented requirements." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "scrum-project-management",
    name: "Scrum & Project Management",
    summary: "Scrum Masters and project managers who keep delivery visible, on scope and on time.",
    metaDescription: "Scrum Masters and project management: agile delivery, sprint planning, risk management and reporting.",
    intro:
      "We provide Scrum Masters and project managers who run predictable delivery: clear priorities, regular releases and transparent reporting.",
    image: { src: "/images/services/scrum-project-management.webp", alt: "Task board with sticky notes in columns from backlog to complete" },
    capabilities: [
      { title: "Scrum facilitation", detail: "Sprint planning, stand-ups, reviews and retrospectives." },
      { title: "Project and programme management", detail: "Plans, milestones, dependencies and budgets." },
      { title: "Risk and issue management", detail: "Identify, track and resolve delivery risks early." },
      { title: "Stakeholder reporting", detail: "Concise progress reporting for leadership." },
    ],
    problems: [
      "Delivery dates that slip without warning",
      "Teams working on competing priorities",
      "Little visibility of progress for leadership",
    ],
    useCases: [
      { title: "Agile adoption", detail: "Introduce Scrum practices to an existing team." },
      { title: "Delivery recovery", detail: "Reset scope, plan and cadence on a struggling project." },
      { title: "Programme coordination", detail: "Align multiple teams and suppliers." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "automation-testing",
    name: "Automation Testing",
    summary: "Automated UI, API and regression suites that run on every build.",
    metaDescription: "Test automation services: automated UI, API and regression testing integrated into CI/CD pipelines.",
    intro:
      "We design and maintain automated test suites that run on every change, shortening regression cycles and catching defects early.",
    image: { src: "/images/services/automation-testing.webp", alt: "Code editor showing automated test cases and debugging tools" },
    capabilities: [
      { title: "Automation framework setup", detail: "Maintainable frameworks suited to your stack." },
      { title: "UI and API automation", detail: "Automated checks for user journeys and service contracts." },
      { title: "CI/CD integration", detail: "Tests that run automatically on every build and release." },
      { title: "Suite maintenance", detail: "Keep tests reliable as the application changes." },
    ],
    problems: [
      "Manual regression cycles that delay every release",
      "Flaky tests that teams no longer trust",
      "Defects found late, when they cost most to fix",
    ],
    useCases: [
      { title: "Regression automation", detail: "Automate the repetitive checks run before each release." },
      { title: "API contract testing", detail: "Catch breaking changes between services." },
      { title: "Pipeline quality gates", detail: "Block releases that fail agreed checks." },
    ],
    caseStudySlugs: [],
  },
  {
    slug: "azure-devops",
    name: "Azure DevOps",
    summary: "CI/CD pipelines, infrastructure as code and cloud environments on Microsoft Azure.",
    metaDescription: "Azure DevOps services: CI/CD pipelines, infrastructure as code, release management and Azure cloud environments.",
    intro:
      "We automate how software is built, tested and released, using Azure DevOps and Azure cloud services to make deployments repeatable and safe.",
    image: { src: "/images/services/azure-devops.webp", alt: "Engineer working on a laptop in a data centre" },
    capabilities: [
      { title: "CI/CD pipelines", detail: "Automated build, test and release pipelines." },
      { title: "Infrastructure as code", detail: "Version-controlled, repeatable cloud environments." },
      { title: "Release management", detail: "Approvals, environments and rollback built into delivery." },
      { title: "Boards and repos", detail: "Set up Azure Boards and Repos around your delivery process." },
    ],
    problems: [
      "Slow, manual deployments that depend on individuals",
      "Environments that drift and behave differently",
      "No easy way to roll back a bad release",
    ],
    useCases: [
      { title: "Pipeline modernisation", detail: "Replace manual or legacy release processes." },
      { title: "Cloud environment setup", detail: "Provision development, test and production on Azure." },
      { title: "DevOps practices", detail: "Introduce branching, review and release standards." },
    ],
    technologies: ["Azure DevOps", "Azure", "Git", "Infrastructure as code"],
    caseStudySlugs: [],
  },
  {
    slug: "system-architecture",
    name: "System Architecture",
    summary: "Architecture design and review for scalable, secure and maintainable systems.",
    metaDescription: "System architecture services: solution design, architecture review, integration and cloud architecture.",
    intro:
      "We design architectures that meet today's needs and scale with the business, and review existing systems to reduce risk and technical debt.",
    image: { src: "/images/services/system-architecture.webp", alt: "Hand drawing a system flow diagram on a whiteboard" },
    capabilities: [
      { title: "Solution architecture", detail: "Design systems around business, security and performance needs." },
      { title: "Architecture review", detail: "Assess existing systems for risk, scalability and technical debt." },
      { title: "Integration architecture", detail: "APIs and messaging that connect systems reliably." },
      { title: "Cloud architecture", detail: "Secure, cost-aware designs on Azure, AWS and Google Cloud." },
    ],
    problems: [
      "Systems that struggle as usage grows",
      "Tightly coupled components that make change risky",
      "Architecture decisions that are undocumented",
    ],
    useCases: [
      { title: "New platform design", detail: "Define the architecture before build starts." },
      { title: "Technical due diligence", detail: "Independent review of an existing system." },
      { title: "Modernisation roadmap", detail: "Plan the path from legacy to target architecture." },
    ],
    technologies: ["Azure", "AWS", "Google Cloud", "APIs"],
    caseStudySlugs: [],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const engagementModels = [
  { title: "Discovery and AI strategy sprints", detail: "A short, fixed-scope assessment that defines goals, options and a delivery plan." },
  { title: "Fixed-price delivery", detail: "Defined outcomes, milestones and acceptance criteria agreed up front." },
  { title: "Dedicated product teams", detail: "Cross-functional teams that build and evolve a product with you." },
  { title: "Staff augmentation", detail: "Specialists who join your team to add capacity or skills." },
  { title: "Managed support", detail: "Ongoing maintenance and continuous improvement after launch." },
];
