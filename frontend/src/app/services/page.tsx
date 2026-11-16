import { ServiceCard } from "@/components/ServiceCard";
import { PageIntro, Section } from "@/components/ui";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Capabilities",
  description:
    "Software development, database administration, testing and QA, technical support, business analysis, Scrum and project management, automation testing, Azure DevOps and system architecture.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        title="Capabilities"
        intro="Specialist teams for every stage of the software lifecycle: analysis, architecture, development, testing, DevOps and ongoing support."
        image="/images/heroes/capabilities.webp"
        highlight
      />
      <Section aria-label="All services">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((s) => (
            <li key={s.slug} className="flex">
              <ServiceCard service={s} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
