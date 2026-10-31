import Link from "next/link";
import { CaseStudySummary } from "@/components/CaseStudySummary";
import { CtaBand } from "@/components/CtaBand";
import { ArrowIcon, ButtonLink, Container, Section, SectionHeading, TextLink } from "@/components/ui";
import { caseStudies } from "@/content/caseStudies";
import { coreServices, services } from "@/content/services";
import { ctas, metrics, site } from "@/content/site";

const [aiService, ...otherServices] = coreServices;
const talent = services.find((s) => s.secondary)!;

const principles = [
  {
    title: "Engineering quality",
    text: "Code review, automated testing and documentation are part of delivery, not optional extras.",
  },
  {
    title: "Business impact",
    text: "Every engagement starts with clear business goals, delivery milestones and measurable success criteria.",
  },
  {
    title: "Security by design",
    text: "Access control, data protection and secure engineering practices are built in from the first sprint.",
  },
  {
    title: "Collaboration",
    text: "Teams in the UK and India work as an extension of yours, with shared tools and open reporting.",
  },
];

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-heading" className="border-b border-line">
        <Container className="pt-14 md:pt-20">
          <div className="max-w-3xl">
            <h1 id="hero-heading" className="text-display font-semibold">
              AI and software engineering that delivers measurable business outcomes.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-strong">{site.positioning}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={ctas.discovery.href}>{ctas.discovery.label}</ButtonLink>
              <ButtonLink href={ctas.aiCapabilities.href} variant="secondary">
                {ctas.aiCapabilities.label}
              </ButtonLink>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 md:mt-16 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.value}
                className="flex flex-col-reverse justify-end border-t border-line py-6 pr-4 even:border-l even:pl-4 md:py-8 md:even:pl-6 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="mt-2 text-sm leading-snug text-muted-strong">{m.label}</dt>
                <dd className="whitespace-nowrap text-[1.625rem] font-semibold tracking-tight tabular-nums sm:text-3xl md:text-[2.5rem]">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Section aria-labelledby="services-heading">
        <SectionHeading
          id="services-heading"
          title="Services"
          intro="AI leads our work, supported by the engineering, cloud, data and security disciplines needed to run it in production."
        />

        <Link
          href={`/services/${aiService.slug}`}
          className="group grid gap-6 border-t border-ink py-8 transition-colors md:grid-cols-12 md:gap-8"
        >
          <div className="md:col-span-5">
            <h3 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {aiService.name}
              <ArrowIcon className="size-5 transition-transform duration-150 group-hover:translate-x-1" />
            </h3>
            <p className="mt-3 leading-relaxed text-muted-strong">{aiService.summary}</p>
          </div>
          <ul className="grid content-start gap-x-8 gap-y-2.5 text-[0.9375rem] sm:grid-cols-2 md:col-span-7">
            {aiService.capabilities.map((c) => (
              <li key={c.title} className="border-b border-line pb-2.5">
                {c.title}
              </li>
            ))}
          </ul>
        </Link>

        <ul className="grid border-t border-line md:grid-cols-2">
          {otherServices.map((s, i) => (
            <li key={s.slug} className={`border-b border-line ${i % 2 === 0 ? "md:border-r md:pr-8" : "md:pl-8"}`}>
              <Link href={`/services/${s.slug}`} className="group block py-6">
                <h3 className="flex items-center gap-2 text-heading font-semibold">
                  {s.name}
                  <ArrowIcon className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
                </h3>
                <p className="mt-2 leading-relaxed text-muted-strong">{s.summary}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[0.9375rem] text-muted-strong">
          Need to add specialists to an existing team?{" "}
          <Link href={`/services/${talent.slug}`} className="font-medium text-ink underline decoration-line-strong hover:decoration-ink">
            {talent.name}
          </Link>{" "}
          provides contract and permanent technology professionals.
        </p>
      </Section>

      <Section tone="mist" aria-labelledby="work-heading">
        <SectionHeading
          id="work-heading"
          title="Selected work"
          intro="Client names are withheld. Each project is described by the problem, our solution and the verified result."
          action={<TextLink href="/case-studies">All case studies</TextLink>}
        />
        <div className="space-y-12">
          {caseStudies.slice(0, 2).map((study) => (
            <CaseStudySummary key={study.slug} study={study} />
          ))}
        </div>
      </Section>

      <Section aria-labelledby="why-heading">
        <SectionHeading id="why-heading" title="Why Kiaratech" />
        <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title} className="bg-paper p-6">
              <h3 className="text-heading font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-strong">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
