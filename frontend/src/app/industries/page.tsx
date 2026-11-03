import { CtaBand } from "@/components/CtaBand";
import { PageIntro, Section } from "@/components/ui";
import { industries } from "@/content/industries";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Industries",
  description:
    "AI, software, cloud and automation for industrial automation, logistics, FMCG and manufacturing, technology, finance and professional services.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageIntro
        title="Industries"
        intro="We work with mid-market and enterprise organisations across the UK, Europe, North America and India, where operations, data and software meet."
      />
      <Section aria-label="Industries we serve">
        <dl>
          {industries.map((industry) => (
            <div key={industry.name} className="industry-row group grid gap-1 py-5 md:grid-cols-12 md:gap-8">
              <dt className="text-heading font-semibold transition-colors duration-200 group-hover:text-blue md:col-span-5">{industry.name}</dt>
              <dd className="leading-relaxed text-muted-strong md:col-span-7">{industry.focus}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <CtaBand title="Working in a sector not listed here?" text="Tell us about your operation. We will tell you honestly whether we are the right partner." />
    </>
  );
}
