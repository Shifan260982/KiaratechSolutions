"use client";

import { useMemo, useState } from "react";
import { roleFamilies, type Job, type RoleFamily } from "@/content/jobs";

export function JobBoard({ jobs, applyEmail }: { jobs: Job[]; applyEmail: string }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<RoleFamily | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (family === "all" || job.family === family) &&
        (!q || `${job.title} ${job.summary} ${job.location}`.toLowerCase().includes(q)),
    );
  }, [jobs, query, family]);

  const filterButton = (value: RoleFamily | "all", label: string) => (
    <button
      key={value}
      type="button"
      aria-pressed={family === value}
      onClick={() => setFamily(value)}
      className="rounded-sm border border-line-strong px-3 py-1.5 text-sm transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
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
            className="mt-1.5 block w-full rounded-sm border border-line-strong bg-paper px-3 py-2.5 text-base placeholder:text-muted focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink"
          />
        </div>
        <div role="group" aria-label="Filter by role family" className="flex flex-wrap gap-2">
          {filterButton("all", "All roles")}
          {roleFamilies.map((f) => filterButton(f, f))}
        </div>
      </div>

      <div aria-live="polite" className="mt-8">
        {results.length > 0 ? (
          <ul className="border-t border-line">
            {results.map((job) => (
              <li key={job.id} className="grid gap-2 border-b border-line py-5 md:grid-cols-12 md:items-center md:gap-8">
                <div className="md:col-span-7">
                  <h3 className="text-heading font-semibold">{job.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted-strong">{job.summary}</p>
                </div>
                <p className="text-sm text-muted-strong md:col-span-3">
                  {job.location} · {job.type}
                </p>
                <a
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent(`Application: ${job.title} (${job.id})`)}`}
                  className="text-[0.9375rem] font-medium underline underline-offset-4 md:col-span-2 md:justify-self-end"
                >
                  Apply
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-y border-line py-8">
            <p className="font-medium">
              {jobs.length === 0 ? "There are no open roles listed right now." : "No roles match your search."}
            </p>
            <p className="mt-2 leading-relaxed text-muted-strong">
              We regularly hire across these role families. Send your CV to{" "}
              <a href={`mailto:${applyEmail}`} className="text-ink underline underline-offset-4">
                {applyEmail}
              </a>{" "}
              with the role family in the subject line.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
