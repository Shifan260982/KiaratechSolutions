import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { ButtonLink, Container } from "@/components/ui";
import { getJob, jobs, splitTitle } from "@/content/jobs";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[id]">) {
  const job = getJob((await params).id);
  if (!job) return {};
  return pageMetadata({ title: `${job.title} | Careers`, description: job.summary, path: `/careers/${job.id}` });
}

function ListSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-heading font-semibold text-navy">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[1.25rem_1fr] leading-relaxed text-ink/85">
            <span aria-hidden="true" className="mt-[0.6em] size-1.5 rounded-full bg-blue" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function JobPage({ params }: PageProps<"/careers/[id]">) {
  const job = getJob((await params).id);
  if (!job) notFound();

  const { name: roleName, specialism } = splitTitle(job.title);

  const facts = [
    { label: "Experience", value: job.experience },
    { label: "Employment", value: job.type },
    { label: "Work mode", value: job.workMode },
    ...(job.location ? [{ label: "Location", value: job.location }] : []),
  ];

  return (
    <>
      <div className="border-b border-line bg-linear-to-b from-sky to-paper">
        <Container className="py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm">
            <Link href="/careers" className="font-medium text-blue-deep hover:text-blue">
              Careers
            </Link>
          </nav>
          <h1 className="max-w-4xl text-display font-bold text-navy">
            {roleName}
            {specialism && (
              <span className="mt-2 block text-title font-semibold text-blue-deep">
                <span className="sr-only"> – </span>
                {specialism}
              </span>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-strong">{job.summary}</p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted-strong">{f.label}</dt>
                <dd className="mt-0.5 font-semibold text-navy">{f.value}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="#apply" className="mt-8 lg:hidden">
            Apply now
          </ButtonLink>
        </Container>
      </div>

      <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <ul aria-label="Role highlights" className="flex flex-wrap gap-2">
            {job.facts.map((f) => (
              <li key={f} className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-blue-deep">
                {f}
              </li>
            ))}
          </ul>
          {job.about?.map((p) => (
            <p key={p} className="mt-6 leading-relaxed text-ink/85">
              {p}
            </p>
          ))}
          <ListSection title="What we're looking for" items={job.requirements} />
          <ListSection title="What you'll do" items={job.responsibilities} />
          <ListSection title="Why join us" items={job.benefits} />
        </div>

        <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-24 lg:col-span-7">
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_60px_-40px_rgb(2_33_98/0.45)] sm:p-8">
            <h2 id="apply-heading" className="text-title font-semibold text-navy">
              Apply for this role
            </h2>
            <p className="mt-2 text-[0.9375rem] text-muted-strong">
              {job.title}
            </p>
            <div className="mt-8 border-t border-line pt-6">
              <ApplicationForm roleId={job.id} roleTitle={job.title} ask={job.ask} applyEmail={site.careersEmail} />
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
