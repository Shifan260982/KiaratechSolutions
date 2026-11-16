// Company facts sourced from the Internal Requirement Gathering document (v1.0, 22 Oct 2026).
// Do not add figures, contacts or claims here that are not approved by Patrick or Amey.

const env = (value: string | undefined) => value?.trim() || undefined;
// Rendered into href attributes, so only https URLs are accepted (blocks javascript: and similar schemes).
const httpsUrl = (value: string | undefined) => (value && /^https:\/\/[^\s"'<>]+$/i.test(value) ? value : undefined);

export const site = {
  name: "Kiaratech Solutions",
  legalName: "Kiaratech Solutions Private Limited",
  url: httpsUrl(env(process.env.NEXT_PUBLIC_SITE_URL)) ?? "https://kiaratechs.com",
  positioning:
    "Kiaratech Solutions is an AI-driven technology partner that turns business challenges into intelligent, scalable software powered by specialists.",
  careersEmail: "jobs@kiaratechs.com",
  // Unverified until supplied: features that depend on these stay hidden while unset.
  linkedInUrl: httpsUrl(env(process.env.NEXT_PUBLIC_LINKEDIN_URL)),
  whatsappNumber: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, ""),
} as const;

export const ctas = {
  discovery: { label: "Let's Connect", short: "Let's Connect", href: "/contact" },
} as const;

export const metrics = [
  { value: "110+", label: "Professionals across AI, software, cloud, data and security" },
  { value: "30+", label: "Projects" },
  { value: "12+", label: "Clients across the UK, Europe, North America and international markets" },
  { value: "UK & India", label: "Offices in London and Navi Mumbai" },
] as const;

export const offices = [
  {
    region: "United Kingdom",
    lines: ["60 Tottenham Court Road, Office 250", "Fitzrovia, London", "W1T 2EW"],
  },
  {
    region: "India",
    lines: [
      "Office No. 1106, Haware Infotech Park",
      "Sector 30A, Vashi (Opposite Inorbit Mall)",
      "Navi Mumbai, Maharashtra 400703",
    ],
  },
] as const;

// "Our Arsenal" navbar menu: the engineering stack, display only (no pages behind it).
export const arsenal = [
  { group: "Languages and frameworks", items: "Python, .NET / C#, Java, Node.js, React, Angular, Vue.js" },
  { group: "Cloud", items: "Microsoft Azure, AWS, Google Cloud" },
  { group: "Data and analytics", items: "Power BI, Tableau, Looker" },
  { group: "Engineering practice", items: "DevOps, APIs, databases, automated testing, cybersecurity tooling" },
] as const;

export function whatsappHref(message?: string) {
  if (!site.whatsappNumber) return undefined;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsappNumber}${text}`;
}
