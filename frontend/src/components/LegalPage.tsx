import type { ReactNode } from "react";
import { certifications, offices, site } from "@/content/site";
import { Container } from "./ui";

export const legalUpdated = "November 2026";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-[68ch]">
        <h1 className="text-display font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-strong">Last updated: {legalUpdated}</p>
        <div className="prose-legal mt-8">{children}</div>
      </div>
    </Container>
  );
}

const india = offices.find((o) => o.region === "India");
const uk = offices.find((o) => o.region === "United Kingdom");

/** The company's legal identity, shown on the privacy policy and terms. */
export function CompanyDetails() {
  const rows = [
    { label: "Company", value: site.legalName },
    { label: "Corporate Identity Number (CIN)", value: site.cin },
    { label: "Registered office", value: india?.lines.join(", ") },
    { label: "UK office", value: uk?.lines.join(", ") },
    { label: "Certifications", value: certifications.map((c) => `${c.standard} (${c.scope.toLowerCase()})`).join("; ") },
    {
      label: "Data protection contact",
      value: <a href={`mailto:${site.dataProtectionEmail}`}>{site.dataProtectionEmail}</a>,
    },
  ];
  return (
    <dl className="my-6 grid gap-x-6 gap-y-3 rounded-lg border border-line bg-mist p-5 text-[0.9375rem] sm:grid-cols-[minmax(0,13rem)_1fr]">
      {rows.map((r) => (
        <div key={r.label} className="contents">
          <dt className="font-semibold text-navy">{r.label}</dt>
          <dd className="text-muted-strong [&_a]:text-blue-deep [&_a]:underline">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
