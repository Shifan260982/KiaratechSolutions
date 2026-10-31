import { JobBoard } from "@/components/JobBoard";
import { PageIntro, Placeholder, Section, SectionHeading } from "@/components/ui";
import { jobs } from "@/content/jobs";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Careers",
  description:
    "Careers at Kiaratech Solutions for software engineers, developers, business analysts, Scrum Masters, test engineers, cloud, data and AI specialists.",
  path: "/careers",
});

// shortcut: draft hiring steps, HR to confirm before launch (requirements 4.3 asks for clear steps but does not define them).
const hiringSteps = [
  { title: "Apply", text: `Email your CV to ${site.careersEmail} with the role in the subject line.` },
  { title: "Initial conversation", text: "A short call about your experience and what you are looking for." },
  { title: "Technical or role assessment", text: "A practical discussion or exercise relevant to the role." },
  { title: "Final interview", text: "Meet the team you would work with." },
  { title: "Offer", text: "We confirm the role, terms and start date." },
];

export default function CareersPage() {
  return (
    <>
      <PageIntro
        title="Careers"
        intro="Join a team of more than 110 professionals delivering AI, software, cloud, data and automation work for clients in the UK, Europe, North America and beyond."
      />

      <Section aria-labelledby="openings-heading">
        <SectionHeading id="openings-heading" title="Open roles" />
        <JobBoard jobs={jobs} applyEmail={site.careersEmail} />
      </Section>

      <Section tone="mist" aria-labelledby="process-heading">
        <SectionHeading id="process-heading" title="How we hire" />
        <ol className="grid gap-px border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-5">
          {hiringSteps.map((step, i) => (
            <li key={step.title} className="bg-mist p-5">
              <h3 className="font-semibold">
                <span className="mr-2 tabular-nums text-muted-strong">{i + 1}</span>
                {step.title}
              </h3>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-strong">{step.text}</p>
            </li>
          ))}
        </ol>
        <Placeholder className="mt-4">hiring steps to be confirmed by HR before launch.</Placeholder>
      </Section>

      <Section aria-labelledby="eo-heading">
        <div className="max-w-3xl">
          <h2 id="eo-heading" className="text-title font-semibold">
            Equal opportunity
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-strong">
            Kiaratech Solutions is an equal opportunity employer. We welcome applications from everyone and make hiring decisions
            based on skills, experience and potential, regardless of age, disability, gender identity, marital or civil partnership
            status, pregnancy or maternity, race, religion or belief, sex or sexual orientation. If you need adjustments during the
            recruitment process, tell us when you apply.
          </p>
          <Placeholder className="mt-4">equal opportunity statement to be approved by HR and legal.</Placeholder>
        </div>
      </Section>
    </>
  );
}
