import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectVisual } from "@/components/ProjectVisual";
import { Container, Placeholder, TextLink } from "@/components/ui";
import { caseStudies, getCaseStudy } from "@/content/caseStudies";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">) {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  return pageMetadata({ title: `${study.name}: ${study.title}`, description: study.description, path: `/case-studies/${study.slug}` });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();
  const relatedServices = study.serviceSlugs.map(getService).filter((s) => s !== undefined);

  return (
    <>
      <article>
        <header className="border-b border-line bg-linear-to-b from-sky to-paper">
          <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12">
            <div className={study.visual ? "lg:col-span-5" : "lg:col-span-8"}>
              <nav aria-label="Breadcrumb" className="mb-5 text-sm">
                <Link href="/case-studies" className="font-medium text-blue hover:text-blue-deep">
                  Portfolio
                </Link>
              </nav>
              <h1 className="text-display font-bold text-navy">
                <span className="block text-lg font-semibold tracking-normal text-blue">{study.name}</span>
                {study.title}
              </h1>
              <p className="mt-4 text-lg font-medium text-ink">{study.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Categories">
                {study.tags.map((t) => (
                  <li key={t} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-blue-deep ring-1 ring-blue/15">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {study.visual && (
              <div className="aspect-[16/10] lg:col-span-7">
                <ProjectVisual variant={study.visual} />
              </div>
            )}
          </Container>
        </header>

        <Container className="grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 className="text-title font-semibold text-navy">Overview</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-strong">{study.description}</p>
            </section>
            <section>
              <h2 className="text-title font-semibold text-navy">Outcome</h2>
              {study.outcome ? (
                <p className="mt-3 text-lg leading-relaxed text-muted-strong">{study.outcome}</p>
              ) : (
                <Placeholder className="mt-3">verified outcome to be supplied and approved by the delivery team.</Placeholder>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="rounded-xl border border-line bg-mist p-5">
              <h2 className="text-sm font-semibold text-navy">Key capabilities</h2>
              <ul className="mt-3 space-y-2 text-ink">
                {study.capabilities.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {relatedServices.length > 0 && (
              <div className="rounded-xl border border-line p-5">
                <h2 className="text-sm font-semibold text-navy">Services</h2>
                <ul className="mt-3 space-y-2">
                  {relatedServices.map((s) => (
                    <li key={s.slug}>
                      <TextLink href={`/services/${s.slug}`}>{s.name}</TextLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </article>
    </>
  );
}
