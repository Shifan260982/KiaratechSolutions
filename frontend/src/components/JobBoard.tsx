"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { roleFamilies, splitTitle, type Job, type RoleFamily } from "@/content/jobs";
import { inputClass } from "./FormParts";
import { ArrowIcon } from "./ui";

export function JobBoard({ jobs, applyEmail }: { jobs: Job[]; applyEmail: string }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<RoleFamily | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (family === "all" || job.family === family) &&
        (!q || `${job.title} ${job.summary} ${job.location ?? ""} ${job.workMode} ${job.facts.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [jobs, query, family]);

  // Only families with an open role get a filter, so no button leads to an empty list.
  const families = roleFamilies.map((f) => ({ value: f, count: jobs.filter((j) => j.family === f).length })).filter((f) => f.count > 0);

  const filterButton = (value: RoleFamily | "all", label: string, count: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={family === value}
      onClick={() => setFamily(value)}
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-medium text-navy transition-colors hover:border-blue hover:text-blue-deep aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-paper"
    >
      {label}
      <span className="tabular-nums opacity-60">{count}</span>
    </button>
  );

  return (
    <div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_1fr] xl:items-end xl:gap-10">
        <div>
          <label htmlFor="job-search" className="text-sm font-medium">
            Search roles
          </label>
          <input
            id="job-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill or location"
            maxLength={100}
            className={inputClass}
          />
        </div>
        {/* One swipeable row on phones instead of seven wrapped lines. */}
        <div
          role="group"
          aria-label="Filter by role family"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {filterButton("all", "All roles", jobs.length)}
          {families.map((f) => filterButton(f.value, f.value, f.count))}
        </div>
      </div>

      <div aria-live="polite" className="mt-10">
        <p className="text-sm text-muted-strong">
          {results.length === 1 ? "1 open role" : `${results.length} open roles`}
        </p>
        {results.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((job, i) => {
              const { name, specialism } = splitTitle(job.title);
              return (
                // Cards rise in a short stagger on load and whenever a filter brings them in.
                <li key={job.id} className="arsenal-rise flex" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                  <article className="group relative flex w-full flex-col rounded-xl border border-line bg-paper p-5 transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-[0_16px_40px_-24px_rgb(2_33_98/0.45)] has-[a:focus-visible]:border-blue has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue">
                    <h3 className="text-lg font-semibold leading-snug text-navy">
                      {/* The title link stretches over the card; Apply sits above it and jumps straight to the form. */}
                      <Link href={`/careers/${job.id}`} className="after:absolute after:inset-0 group-hover:text-blue-deep focus-visible:outline-none">
                        {name}
                        {specialism && <span className="sr-only"> – {specialism}</span>}
                      </Link>
                    </h3>
                    {specialism && (
                      <p aria-hidden="true" className="mt-1 text-sm font-medium text-blue-deep">
                        {specialism}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-strong">
                      {[job.experience, job.type, job.workMode].join(" · ")}
                      {job.location && <span className="mt-0.5 block">{job.location}</span>}
                    </p>
                    <ul aria-label="Key requirements" className="mt-4 flex flex-wrap gap-1.5">
                      {job.facts.map((fact) => (
                        <li key={fact} className="rounded-full bg-sky px-2.5 py-1 text-[0.8125rem] font-medium leading-tight text-blue-deep">
                          {fact}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/careers/${job.id}#apply`}
                        aria-label={`Apply for ${job.title}`}
                        className="relative z-10 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-line-strong bg-paper px-5 font-secondary text-[0.9375rem] font-semibold text-navy transition-colors hover:border-blue hover:bg-blue hover:text-paper"
                      >
                        Apply
                        <ArrowIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 border-y border-line py-8">
            <p className="font-medium text-navy">
              {jobs.length === 0 ? "There are no open roles listed right now." : "No roles match your search."}
            </p>
            <p className="mt-2 leading-relaxed text-muted-strong">
              {jobs.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFamily("all");
                    }}
                    className="font-medium text-blue-deep underline underline-offset-4"
                  >
                    Show all roles
                  </button>
                  , or send{" "}
                </>
              )}
              {jobs.length === 0 && "Send "}
              your CV to{" "}
              <a href={`mailto:${applyEmail}`} className="font-medium text-blue-deep underline underline-offset-4">
                {applyEmail}
              </a>{" "}
              with the role you are interested in as the subject.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
