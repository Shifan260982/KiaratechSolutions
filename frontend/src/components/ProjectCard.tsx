import Link from "next/link";
import type { CaseStudy } from "@/content/caseStudies";
import { ProjectVisual } from "./ProjectVisual";
import { ArrowIcon } from "./ui";

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Categories">
      {tags.map((t) => (
        <li key={t} className="rounded-full bg-sky px-2.5 py-1 text-xs font-medium text-blue-deep">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Project card. `wide` lays the visual beside the text for the lead project. */
export function ProjectCard({ project, wide = false, headingLevel = "h3" }: { project: CaseStudy; wide?: boolean; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article
      className={`group relative grid overflow-hidden rounded-xl border border-line bg-paper transition-[border-color,box-shadow] duration-200 hover:border-blue/40 hover:shadow-[0_16px_40px_-24px_rgb(2_33_98/0.45)] ${
        wide ? "lg:grid-cols-12" : ""
      }`}
    >
      {project.visual && (
        <div className={`aspect-[4/3] bg-sky p-3 sm:aspect-[16/10] sm:p-5 ${wide ? "lg:col-span-7 lg:aspect-auto lg:min-h-80" : ""}`}>
          <ProjectVisual variant={project.visual} />
        </div>
      )}
      <div className={`flex flex-col p-6 ${wide ? "lg:col-span-5 lg:justify-center lg:p-8" : ""}`}>
        <Tags tags={project.tags} />
        <Heading className={`mt-4 font-semibold text-navy ${wide ? "text-2xl" : "text-heading"}`}>
          <Link href={`/case-studies/${project.slug}`} className="after:absolute after:inset-0">
            <span className="block text-sm font-semibold text-blue">{project.name}</span>
            {project.title}
          </Link>
        </Heading>
        <p className={`mt-3 leading-relaxed text-muted-strong ${wide ? "lg:hidden" : ""}`}>{project.summary}</p>
        {wide && <p className="mt-3 hidden leading-relaxed text-muted-strong lg:block">{project.description}</p>}
        {wide && (
          <ul className="mt-4 hidden gap-x-4 gap-y-1.5 text-sm text-ink lg:grid lg:grid-cols-2">
            {project.capabilities.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-blue" />
                {c}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-blue">
          Explore project
          <ArrowIcon className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
