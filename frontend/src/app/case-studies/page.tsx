import { CaseStudyViewer } from "@/components/CaseStudyViewer";
import { ProjectCard } from "@/components/ProjectCard";
import { PageIntro, Section, SectionHeading } from "@/components/ui";
import { caseStudies, featuredProjects, type CaseStudy } from "@/content/caseStudies";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Portfolio",
  description: "Projects and products from Kiaratech Solutions, including ARECON AI, FactoryFlow and Smart HR.",
  path: "/case-studies",
});

const [lead, ...rest] = featuredProjects;
const studiesWithPdf = caseStudies.filter((c): c is CaseStudy & { pdf: string } => !!c.pdf);

export default function CaseStudiesPage() {
  return (
    <>
      <PageIntro
        title="Portfolio"
        intro="Products and platforms our teams have designed and built. Client names are withheld to protect confidentiality."
        image="/images/heroes/portfolio-code.webp"
        highlight
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
      <Section tone="mist" aria-labelledby="case-studies-heading">
        <SectionHeading
          id="case-studies-heading"
          title="Case studies"
          intro="The challenge, our approach, the solution and the results, written up by the delivery team."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {studiesWithPdf.map((s) => (
            <CaseStudyViewer key={s.slug} study={s} />
          ))}
        </div>
      </Section>
    </>
  );
}
