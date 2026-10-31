import { CtaBand } from "@/components/CtaBand";
import { PageIntro, Section, SectionHeading } from "@/components/ui";
import { engagementModels } from "@/content/services";
import { metrics, offices } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Founded in India in 2022 with a UK presence since 2025, Kiaratech Solutions is a 110+ person AI-driven software partner.",
  path: "/about",
});

const values = ["Customer impact", "Integrity", "Innovation", "Engineering excellence", "Collaboration", "Continuous learning"];

const technologies = [
  { group: "Languages and frameworks", items: "Python, .NET / C#, Java, Node.js, React, Angular, Vue.js" },
  { group: "Cloud", items: "Microsoft Azure, AWS, Google Cloud" },
  { group: "Data and analytics", items: "Power BI, Tableau, Looker" },
  { group: "Engineering practice", items: "DevOps, APIs, databases, automated testing, cybersecurity tooling" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="An AI-driven software partner, built on specialist engineering"
        intro="Founded in India in 2022, Kiaratech Solutions has grown into a technology organisation of more than 110 professionals. We established our UK presence in 2025 to work more closely with clients across the UK and Europe."
      />

      <Section aria-labelledby="story-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="story-heading" className="text-title font-semibold">
              How we got here
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-strong">
              Our journey has evolved from specialist technology talent and automation support into an AI-driven software partner
              focused on practical, scalable business outcomes. Today our teams span AI, software, cloud, data, automation,
              cybersecurity, finance and consulting, supporting clients across the UK, Europe, North America and international markets.
            </p>
          </div>
          <dl className="grid grid-cols-2 content-start gap-px border border-line bg-line lg:col-span-5">
            {metrics.map((m) => (
              <div key={m.value} className="flex flex-col-reverse justify-end bg-paper p-5">
                <dt className="mt-1 text-sm leading-snug text-muted-strong">{m.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="mist" aria-label="Mission, vision and values">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <h2 className="text-heading font-semibold">Mission</h2>
            <p className="mt-2 leading-relaxed text-muted-strong">
              Turn ambitious ideas into secure, intelligent and scalable digital solutions that create measurable value.
            </p>
          </div>
          <div>
            <h2 className="text-heading font-semibold">Vision</h2>
            <p className="mt-2 leading-relaxed text-muted-strong">
              Become the trusted partner for AI innovation, software engineering and technology transformation.
            </p>
          </div>
          <div>
            <h2 className="text-heading font-semibold">Values</h2>
            <ul className="mt-2 space-y-1 text-muted-strong">
              {values.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="engagement-heading">
        <SectionHeading
          id="engagement-heading"
          title="How we engage"
          intro="Every engagement starts with clear business goals, delivery milestones and measurable success criteria."
        />
        <dl className="border-t border-line">
          {engagementModels.map((m) => (
            <div key={m.title} className="grid gap-1 border-b border-line py-4 md:grid-cols-12 md:gap-8">
              <dt className="font-semibold md:col-span-4">{m.title}</dt>
              <dd className="leading-relaxed text-muted-strong md:col-span-8">{m.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="mist" aria-labelledby="tech-heading">
        <SectionHeading id="tech-heading" title="Technology" />
        <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((t) => (
            <div key={t.group} className="border-t border-line-strong pt-4">
              <dt className="font-semibold">{t.group}</dt>
              <dd className="mt-2 leading-relaxed text-muted-strong">{t.items}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section aria-labelledby="offices-heading">
        <SectionHeading id="offices-heading" title="Offices" />
        <div className="grid gap-8 md:grid-cols-2">
          {offices.map((o) => (
            <address key={o.region} className="border-t border-ink pt-4 not-italic leading-relaxed text-muted-strong">
              <span className="block text-heading font-semibold text-ink">{o.region}</span>
              <span className="mt-2 block">
                {o.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </address>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
