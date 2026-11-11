import { ProjectCard } from "@/components/ProjectCard";
import { PageIntro, Section } from "@/components/ui";
import { featuredProjects } from "@/content/caseStudies";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Portfolio",
  description: "Projects and products from Kiaratech Solutions, including ARECON AI, a real-time factory digital twin and Smart HR.",
  path: "/case-studies",
});

const [lead, ...rest] = featuredProjects;

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
    </>
  );
}
