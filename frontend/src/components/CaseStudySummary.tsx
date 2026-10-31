import type { CaseStudy } from "@/content/caseStudies";
import { Placeholder, TextLink } from "./ui";

/** Problem / solution / outcome summary used on the homepage, service pages and case study index. */
export function CaseStudySummary({ study, headingLevel = "h3" }: { study: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="border-t border-ink pt-6">
      <Heading className="text-heading font-semibold md:text-2xl">{study.title}</Heading>
      <p className="mt-1 text-sm text-muted-strong">{study.sector}</p>
      <dl className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
        <div>
          <dt className="text-sm font-semibold">Problem</dt>
          <dd className="mt-2 leading-relaxed text-muted-strong">{study.problem}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold">Solution</dt>
          <dd className="mt-2 leading-relaxed text-muted-strong">{study.solution}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold">Outcome</dt>
          <dd className="mt-2 leading-relaxed text-muted-strong">
            {study.outcome ?? <Placeholder>verified outcome to be supplied by the delivery team.</Placeholder>}
          </dd>
        </div>
      </dl>
      <TextLink href={`/case-studies/${study.slug}`} className="mt-6">
        Read the case study
      </TextLink>
    </article>
  );
}
