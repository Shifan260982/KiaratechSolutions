import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudySummary } from "@/components/CaseStudySummary";
import { CtaBand } from "@/components/CtaBand";
import { ArrowIcon, ButtonLink, Container, PageIntro, Section, SectionHeading } from "@/components/ui";
import { getCaseStudy } from "@/content/caseStudies";
import { getService, services } from "@/content/services";
import { ctas } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  const service = getService((await params).slug);
  if (!service) return {};
  return pageMetadata({ title: service.name, description: service.metaDescription, path: `/services/${service.slug}` });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const related = service.caseStudySlugs.map(getCaseStudy).filter((c) => c !== undefined);
  const others = services.filter((s) => s.slug !== service.slug);
  const secondaryCta = service.secondary ? ctas.talent : ctas.proposal;

  return (
    <>
      <PageIntro title={service.name} intro={service.intro}>
        <ButtonLink href={ctas.discovery.href}>{ctas.discovery.label}</ButtonLink>
        <ButtonLink href={secondaryCta.href} variant="secondary">
          {secondaryCta.label}
        </ButtonLink>
      </PageIntro>

      <Section aria-labelledby="capabilities-heading">
        <SectionHeading id="capabilities-heading" title="Capabilities" />
        <ul className="grid border-t border-line md:grid-cols-2">
          {service.capabilities.map((c, i) => (
            <li key={c.title} className={`border-b border-line py-5 ${i % 2 === 0 ? "md:border-r md:pr-8" : "md:pl-8"}`}>
              <h3 className="text-heading font-semibold">{c.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted-strong">{c.detail}</p>
            </li>
          ))}
        </ul>
        {service.technologies && (
          <p className="mt-6 text-[0.9375rem] text-muted-strong">
            <span className="font-medium text-ink">Technologies: </span>
            {service.technologies.join(", ")}
          </p>
        )}
      </Section>

      <Section tone="mist" aria-label="Problems and use cases">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-title font-semibold">Problems we solve</h2>
            <ul className="mt-6 space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-ink" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-title font-semibold">Use cases</h2>
            <dl className="mt-6 border-t border-line-strong">
              {service.useCases.map((u) => (
                <div key={u.title} className="grid gap-1 border-b border-line-strong py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
                  <dt className="font-semibold">{u.title}</dt>
                  <dd className="leading-relaxed text-muted-strong">{u.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section aria-labelledby="related-heading">
          <SectionHeading id="related-heading" title="Related work" />
          <div className="space-y-12">
            {related.map((study) => (
              <CaseStudySummary key={study.slug} study={study} />
            ))}
          </div>
        </Section>
      )}

      <section aria-labelledby="other-heading" className="border-t border-line py-12">
        <Container>
          <h2 id="other-heading" className="text-heading font-semibold">
            Other services
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group inline-flex items-center gap-1.5 text-muted-strong hover:text-ink">
                  {s.name}
                  <ArrowIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand secondary={secondaryCta} />
    </>
  );
}
