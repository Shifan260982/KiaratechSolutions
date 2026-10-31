import { CaseStudySummary } from "@/components/CaseStudySummary";
import { CtaBand } from "@/components/CtaBand";
import { PageIntro, Placeholder, Section, SectionHeading } from "@/components/ui";
import { caseStudies, pendingCaseStudies } from "@/content/caseStudies";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Case Studies",
  description: "Anonymised client projects from Kiaratech Solutions, each described by the problem, the solution and the verified outcome.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  return (
    <>
      <PageIntro
        title="Case studies"
        intro="Client names are withheld to protect confidentiality. Each project is described by the problem, our solution and the verified outcome."
      />
      <Section aria-label="Published case studies">
        <div className="space-y-14">
          {caseStudies.map((study) => (
            <CaseStudySummary key={study.slug} study={study} headingLevel="h2" />
          ))}
        </div>
      </Section>

      {/* Pre-launch only: remove this section once the pending case studies are approved or dropped. */}
      <Section tone="mist" aria-labelledby="pending-heading">
        <SectionHeading id="pending-heading" title="In preparation" />
        <ul className="grid gap-4 md:grid-cols-2">
          {pendingCaseStudies.map((p) => (
            <li key={p.title}>
              <Placeholder>
                <span className="font-medium text-ink">{p.title}.</span> Needed: {p.needed}. Owner: {p.owner}.
              </Placeholder>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand />
    </>
  );
}
