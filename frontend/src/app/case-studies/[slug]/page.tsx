import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
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
  return pageMetadata({ title: study.title, description: study.problem, path: `/case-studies/${study.slug}` });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();
  const relatedServices = study.serviceSlugs.map(getService).filter((s) => s !== undefined);

  return (
    <>
      <article>
        <header className="border-b border-line">
          <Container className="py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-strong">
              <Link href="/case-studies" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                Case studies
              </Link>
            </nav>
            <h1 className="max-w-3xl text-display font-semibold">{study.title}</h1>
            <p className="mt-4 text-lg text-muted-strong">{study.sector}. Client name withheld.</p>
          </Container>
        </header>

        <Container className="grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 className="text-title font-semibold">Problem</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-strong">{study.problem}</p>
            </section>
            <section>
              <h2 className="text-title font-semibold">Solution</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-strong">{study.solution}</p>
            </section>
            <section>
              <h2 className="text-title font-semibold">Outcome</h2>
              {study.outcome ? (
                <p className="mt-3 text-lg leading-relaxed text-muted-strong">{study.outcome}</p>
              ) : (
                <Placeholder className="mt-3">
                  verified outcome (for example, measured changes in throughput, accuracy or effort) to be supplied and approved by the delivery team.
                </Placeholder>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="border-t border-ink pt-4">
              <h2 className="text-sm font-semibold">Scope</h2>
              <ul className="mt-3 space-y-2 text-muted-strong">
                {study.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {relatedServices.length > 0 && (
              <div className="border-t border-ink pt-4">
                <h2 className="text-sm font-semibold">Services</h2>
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
      <CtaBand />
    </>
  );
}
