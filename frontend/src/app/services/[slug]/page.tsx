import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import { ArrowIcon, ButtonLink, Container, Section, SectionHeading } from "@/components/ui";
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

  return (
    <>
      <div className="border-b border-line bg-linear-to-b from-sky to-paper">
        <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm">
              <Link href="/services" className="font-medium text-blue hover:text-blue-deep">
                Capabilities
              </Link>
            </nav>
            <h1 className="text-display font-bold text-navy">{service.name}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-strong">{service.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={ctas.discovery.href}>{ctas.discovery.short}</ButtonLink>
              <ButtonLink href={ctas.proposal.href} variant="secondary">
                {ctas.proposal.label}
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              width={800}
              height={500}
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="aspect-[16/10] w-full rounded-2xl bg-sky object-cover shadow-[0_24px_50px_-28px_rgb(16_42_86/0.45)]"
            />
          </div>
        </Container>
      </div>

      <Section aria-labelledby="capabilities-heading">
        <SectionHeading id="capabilities-heading" title="Capabilities" />
        <ul className="grid gap-4 sm:grid-cols-2">
          {service.capabilities.map((c) => (
            <li key={c.title} className="rounded-xl border border-line bg-paper p-5">
              <h3 className="flex items-center gap-2.5 text-heading font-semibold text-navy">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-blue" />
                {c.title}
              </h3>
              <p className="mt-1.5 leading-relaxed text-muted-strong">{c.detail}</p>
            </li>
          ))}
        </ul>
        {service.technologies && (
          <ul className="mt-6 flex flex-wrap items-center gap-2" aria-label="Technologies">
            <li className="mr-1 text-sm font-semibold text-navy">Technologies</li>
            {service.technologies.map((t) => (
              <li key={t} className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-blue-deep">
                {t}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="mist" aria-label="Problems and use cases">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-title font-semibold text-navy">Problems we solve</h2>
            <ul className="mt-6 space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="flex gap-3 leading-relaxed">
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue">
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-title font-semibold text-navy">Use cases</h2>
            <dl className="mt-6 grid gap-3">
              {service.useCases.map((u) => (
                <div key={u.title} className="grid gap-1 rounded-xl border border-line bg-paper p-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6">
                  <dt className="font-semibold text-navy">{u.title}</dt>
                  <dd className="leading-relaxed text-muted-strong">{u.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section aria-labelledby="related-heading">
          <SectionHeading id="related-heading" title="Related projects" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>
      )}

      <section aria-labelledby="other-heading" className="border-t border-line py-12">
        <Container>
          <h2 id="other-heading" className="text-heading font-semibold text-navy">
            Other services
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-muted-strong transition-colors hover:border-blue hover:text-blue"
                >
                  {s.name}
                  <ArrowIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

    </>
  );
}
