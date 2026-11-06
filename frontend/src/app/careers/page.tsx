import { JobBoard } from "@/components/JobBoard";
import { PageIntro, Section, SectionHeading } from "@/components/ui";
import { jobs } from "@/content/jobs";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Careers",
  description:
    "Careers at Kiaratech Solutions for software engineers, developers, business analysts, Scrum Masters, test engineers, cloud, data and AI specialists.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <>
      <PageIntro
        title="Careers"
        intro="Join a team of more than 110 professionals delivering AI, software, cloud, data and automation work for clients in the UK, Europe, North America and beyond."
        image="/images/heroes/careers-summit.webp"
      />

      <Section aria-labelledby="openings-heading">
        <SectionHeading id="openings-heading" title="Open roles" />
        <JobBoard jobs={jobs} applyEmail={site.careersEmail} />
      </Section>
    </>
  );
}
