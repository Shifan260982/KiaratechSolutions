import { CtaBand } from "@/components/CtaBand";
import { ProjectCard } from "@/components/ProjectCard";
import { PageIntro, Placeholder, Section, SectionHeading } from "@/components/ui";
import { featuredProjects, pendingCaseStudies } from "@/content/caseStudies";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Projects and products from Kiaratech Solutions, including ARECON AI, a real-time factory digital twin and Smart HR.",
  path: "/case-studies",
});

const [lead, ...rest] = featuredProjects;

export default function CaseStudiesPage() {
  return (
    <>
      <PageIntro
        title="Projects"
        intro="Products and platforms our teams have designed and built. Client names are withheld to protect confidentiality."
      />
      <Section aria-label="Featured projects">
        <div className="grid gap-6">
          <ProjectCard project={lead} wide headingLevel="h2" />
          <div className="grid gap-6 md:grid-cols-2">
            {rest.map((p) => (
              <ProjectCard key={p.slug} project={p} headingLevel="h2" />
            ))}
          </div>
        </div>
      </Section>

      {/* Pre-launch only: remove once the pending items are approved or dropped. */}
      <Section aria-labelledby="pending-heading">
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
