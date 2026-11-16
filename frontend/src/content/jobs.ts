// Live vacancies only, taken from the approved job adverts (openpos.txt). Remove a role as soon as it closes.
import type { ApplicationFieldKey } from "@/lib/application";

export const roleFamilies = [
  "Software engineering",
  "Application support",
  "Analysis and delivery",
  "Design and testing",
  "Industrial automation",
  "AI",
  "Business and marketing",
] as const;

export type RoleFamily = (typeof roleFamilies)[number];

export type Job = {
  id: string;
  title: string;
  family: RoleFamily;
  type: "Permanent" | "Contract" | "Internship";
  experience: string;
  workMode: "Onsite" | "Hybrid" | "Remote";
  location?: string;
  /** Short facts shown on the listing, e.g. "6-month contract" or "UK shift". */
  facts: string[];
  summary: string;
  about?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  /** The role-specific details the advert asks candidates to mention. */
  ask: ApplicationFieldKey[];
};

const standardAsk: ApplicationFieldKey[] = ["totalExperience", "currentCtc", "expectedCtc", "noticePeriod"];
const freshAsk: ApplicationFieldKey[] = ["expectedCtc", "noticePeriod"];
const ukShiftNote = "Selected roles may involve working UK business hours, depending on client and project requirements.";

export const jobs: Job[] = [
  {
    id: "support-manager",
    title: "Senior Support Manager – Application & Production Support",
    family: "Application support",
    type: "Permanent",
    experience: "15+ years",
    workMode: "Remote",
    facts: ["ITIL 4 certified", "Team of 10–15", "UK / Europe clients", "Immediate or short notice preferred"],
    summary:
      "Lead a remote team of 10–15 application and product support professionals supporting a critical international product across UK and European markets.",
    about: [
      "Lead the support function, manage day-to-day service delivery, mentor the support team, own escalations and ensure agreed SLAs, KPIs and service standards are consistently achieved.",
      "You will be the key bridge between the support team, technical teams and international clients, driving accountability, stability and continuous improvement.",
    ],
    requirements: [
      "15+ years' experience in application, product, production or technical support",
      "Proven experience managing, mentoring and developing teams of 10–15+ people",
      "ITIL 4 certified, with strong IT service management knowledge",
      "Excellent incident, problem and change management experience",
      "Strong experience in SLAs, KPIs, service delivery, escalation management and RCA",
      "Proven ability to manage P1/P2 incidents and critical production escalations",
      "Understanding of C#, .NET or Java applications and SQL databases",
      "Good understanding of application monitoring, logs, debugging and troubleshooting",
      "Experience with ITSM tools, ticketing systems and support processes",
      "Strong client, stakeholder and escalation management skills",
      "Excellent English communication and leadership",
      "Ability to drive continuous improvement, process optimisation and operational excellence",
    ],
    responsibilities: [
      "Build and manage a high-performing support team",
      "Take ownership of critical incidents and escalations",
      "Drive SLA adherence and service excellence",
      "Communicate confidently with senior stakeholders",
      "Improve support processes and operational efficiency",
      "Create a culture of ownership, accountability and continuous improvement",
    ],
    ask: ["totalExperience", "currentCtc", "expectedCtc", "noticePeriod", "teamSize", "primaryTechnology", "itilCertification"],
  },
  {
    id: "product-support-engineer",
    title: "Product Support Engineer – C# / .NET / Java, SQL",
    family: "Application support",
    type: "Permanent",
    experience: "3–6 years",
    workMode: "Onsite",
    location: "Navi Mumbai / Pune",
    facts: ["4 openings", "24×7 rotational shifts (9 hours)", "Immediate joiners"],
    summary:
      "Troubleshoot and support an international product used across manufacturing and industrial environments for UK and European clients.",
    requirements: [
      "Strong hands-on knowledge of C#/.NET or Java (mandatory)",
      "3+ years in product, application or production support, or software development",
      "Good SQL and database knowledge",
      "Strong debugging, troubleshooting and root-cause analysis skills",
      "Ability to understand application code, logs and technical issues",
      "Fluent English with excellent verbal and written communication (mandatory)",
      "Comfortable working 24×7 rotational shifts",
    ],
    benefits: [
      "Work on an international product supporting UK and European clients",
      "Competitive compensation and perks",
      "Night shift allowance and eligible overtime",
      "Medical insurance and EPF",
      "24 days' paid holiday a year",
      "Bonus and performance incentives",
      "Training, upskilling and career growth",
      "Exposure to manufacturing, automation and industrial technology",
    ],
    ask: ["relevantExperience", "currentCtc", "expectedCtc", "noticePeriod", "primaryTechnology"],
  },
  {
    id: "senior-backend-engineer",
    title: "Senior Backend Engineer",
    family: "Software engineering",
    type: "Contract",
    experience: "10+ years",
    workMode: "Hybrid",
    facts: ["C#, .NET", "4 openings", "6-month contract", "Project starts in about 2 months"],
    summary: "Senior C# and .NET backend engineering on projects supporting our UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "senior-solution-architect",
    title: "Senior Solution Architect",
    family: "Software engineering",
    type: "Permanent",
    experience: "15+ years",
    workMode: "Hybrid",
    facts: ["Solution architecture", "1 opening"],
    summary: "Lead solution architecture for technology projects supporting our UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "software-engineer-dotnet",
    title: "Software Engineer – C# / .NET",
    family: "Software engineering",
    type: "Permanent",
    experience: "4–6 years",
    workMode: "Hybrid",
    facts: ["C#, .NET", "10 openings", "Project starts in about 2 months"],
    summary: "Build C# and .NET software as part of a growing team working on projects for UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "scrum-master",
    title: "Scrum Master",
    family: "Analysis and delivery",
    type: "Permanent",
    experience: "8–10 years",
    workMode: "Hybrid",
    facts: ["Azure DevOps", "PSM or equivalent certification", "SDLC", "1 opening"],
    summary: "Lead Scrum delivery with Azure DevOps on projects supporting our UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "ux-engineer",
    title: "UX Engineer",
    family: "Design and testing",
    type: "Permanent",
    experience: "5–6 years",
    workMode: "Hybrid",
    facts: ["Figma, Adobe XD, Sketch or similar", "1 opening"],
    summary: "Design user experiences for technology projects supporting our UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "manual-tester",
    title: "Manual Tester",
    family: "Design and testing",
    type: "Permanent",
    experience: "3–4 years",
    workMode: "Hybrid",
    facts: ["API and database testing", "C# and Playwright preferred", "2 openings", "Immediate joiners"],
    summary: "API and database testing on projects supporting our UK-based clients.",
    about: [ukShiftNote],
    ask: standardAsk,
  },
  {
    id: "ai-intern",
    title: "AI Intern",
    family: "AI",
    type: "Internship",
    experience: "Fresher",
    workMode: "Onsite",
    facts: ["AI and technology", "6 openings", "6-month internship", "Immediate joiners"],
    summary: "A six-month internship working on AI and technology projects supporting our UK-based clients.",
    ask: freshAsk,
  },
  {
    id: "hr-intern",
    title: "Business Development Administrator / MBA HR Intern",
    family: "Business and marketing",
    type: "Internship",
    experience: "Fresher",
    workMode: "Onsite",
    location: "Navi Mumbai",
    facts: ["2 openings", "6-month contract", "Immediate joiners", "Potential to become permanent"],
    summary:
      "Gain hands-on experience across recruitment, HR operations, payroll support and employee engagement. Candidates based in or near Navi Mumbai are preferred.",
    requirements: [
      "MBA in HR, pursuing or recently completed",
      "Excellent communication and interpersonal skills",
      "Good knowledge of MS Excel, Word and email",
      "Strong attention to detail and organisational skills",
      "Positive attitude, willingness to learn and ability to take initiative",
      "Comfortable working onsite",
    ],
    responsibilities: [
      "Assist with end-to-end recruitment, including job postings, sourcing, screening and interview coordination",
      "Support employee onboarding, documentation, attendance and leave management",
      "Collect and review weekly timesheets and maintain HR records",
      "Assist with payroll-related activities, HR reports and MIS",
      "Support employee engagement, internal communication and HR initiatives",
      "Conduct basic research on HR practices and compliance",
      "Maintain confidentiality and accuracy in all employee information",
    ],
    benefits: [
      "Real-world HR exposure on live HR and recruitment activities",
      "Learn payroll and HR operations",
      "Mentorship and professional development",
      "Opportunity to grow with the organisation",
    ],
    ask: [],
  },
  {
    id: "linkedin-marketing-executive",
    title: "LinkedIn Marketing Executive",
    family: "Business and marketing",
    type: "Contract",
    experience: "Fresher – 2 years",
    workMode: "Onsite",
    facts: ["LinkedIn and digital marketing", "1 opening", "6-month contract", "Potential to become permanent"],
    summary: "Run LinkedIn and digital marketing activity for Kiaratech Solutions.",
    ask: standardAsk,
  },
];

export const getJob = (id: string) => jobs.find((j) => j.id === id);

/** "Product Support Engineer – C# / .NET" → name and specialism, so the specialism can sit on its own quieter line. */
export function splitTitle(title: string) {
  const [name, ...rest] = title.split(" – ");
  return { name, specialism: rest.join(" – ") };
}
