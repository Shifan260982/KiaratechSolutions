"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { roleFamilies, type Job, type RoleFamily } from "@/content/jobs";
import { inputClass } from "./FormParts";
import { ArrowIcon, dividerShades } from "./ui";

const PAGE_SIZE = 5;

const pagerButton =
  "inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-paper px-4 font-secondary text-[0.9375rem] font-semibold text-navy transition-colors hover:border-blue hover:text-blue-deep disabled:pointer-events-none disabled:opacity-40";

export function JobBoard({ jobs, applyEmail }: { jobs: Job[]; applyEmail: string }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<RoleFamily | "all">("all");
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLParagraphElement>(null);
  const restored = useRef(false);

  // The search, filter and page live in the address (?q=&role=&page=), so Back from a job returns to the same list.
  // Read once after hydration (the static HTML always renders the full list), then mirror every change.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") ?? "").slice(0, 100);
    const role = params.get("role");
    const p = Number(params.get("page"));
    /* eslint-disable react-hooks/set-state-in-effect -- one-off sync from the URL, an external source, after hydration */
    if (q) setQuery(q);
    if (role && (roleFamilies as readonly string[]).includes(role)) setFamily(role as RoleFamily);
    if (Number.isInteger(p) && p > 1) setPage(p);
    /* eslint-enable react-hooks/set-state-in-effect */
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (family !== "all") params.set("role", family);
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    window.history.replaceState(window.history.state, "", search ? `?${search}` : window.location.pathname);
  }, [query, family, page]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (family === "all" || job.family === family) &&
        (!q || `${job.title} ${job.summary} ${job.location ?? ""} ${job.workMode} ${job.facts.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [jobs, query, family]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount); // a narrower filter can leave fewer pages than the one we were on
  const first = (current - 1) * PAGE_SIZE;
  const visible = results.slice(first, first + PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    // Bring the top of the list back into view and give keyboard and screen-reader users a fixed starting point.
    listTop.current?.focus({ preventScroll: true });
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Only families with an open role get a filter, so no button leads to an empty list.
  const families = roleFamilies.map((f) => ({ value: f, count: jobs.filter((j) => j.family === f).length })).filter((f) => f.count > 0);

  const filterButton = (value: RoleFamily | "all", label: string, count: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={family === value}
      onClick={() => {
        setFamily(value);
        setPage(1);
      }}
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
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

      <div className="mt-10">
        <p ref={listTop} tabIndex={-1} aria-live="polite" className="scroll-mt-24 text-sm text-muted-strong focus:outline-none">
          {results.length === 0
            ? "0 open roles"
            : results.length <= PAGE_SIZE
              ? `${results.length} open ${results.length === 1 ? "role" : "roles"}`
              : `Showing ${visible.length === 1 ? first + 1 : `${first + 1}–${first + visible.length}`} of ${results.length} open roles`}
        </p>
        {results.length > 0 && (
          <ul className="mt-4 border-t border-line">
            {visible.map((job, i) => (
              // Plain list row: only the title is a link; the rest of the row is not clickable.
              <li key={job.id} className="group relative border-b border-line py-5">
                <div>
                  <h3 className="text-lg font-medium leading-snug text-navy">
                    <Link
                      href={`/careers/${job.id}`}
                      className="rounded-sm underline decoration-line-strong underline-offset-[0.3em] transition-colors hover:text-blue-deep hover:decoration-blue-deep"
                    >
                      {job.title}
                    </Link>
                  </h3>
                  <dl className="mt-2 flex items-center text-[0.9375rem] text-muted-strong">
                    <dt className="sr-only">Location</dt>
                    {/* Roles without a fixed office show their work mode (Remote, Hybrid) instead. */}
                    <dd>{job.location ?? job.workMode}</dd>
                    <dt className="sr-only">Experience</dt>
                    <dd className="ml-4 border-l border-line-strong pl-4">{job.experience}</dd>
                  </dl>
                </div>
                {/* Same hover line as the Our Story "How we engage" rows: fills left to right in the row's shade and thickens. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 transition-[scale,height] duration-1000 ease-out group-hover:h-1 group-hover:scale-x-100 group-has-[a:focus-visible]:h-1 group-has-[a:focus-visible]:scale-x-100 motion-reduce:transition-none"
                  style={{ backgroundColor: dividerShades[(first + i) % dividerShades.length] }}
                />
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 && (
          <nav aria-label="Job list pages" className="mt-8 flex items-center justify-between gap-4">
            <button type="button" onClick={() => goToPage(current - 1)} disabled={current === 1} className={pagerButton}>
              <ArrowIcon className="size-4 rotate-180" />
              Previous
            </button>
            <p className="text-sm text-muted-strong">
              Page <span className="font-semibold text-navy tabular-nums">{current}</span> of <span className="tabular-nums">{pageCount}</span>
            </p>
            <button type="button" onClick={() => goToPage(current + 1)} disabled={current === pageCount} className={pagerButton}>
              Next
              <ArrowIcon className="size-4" />
            </button>
          </nav>
        )}
        {results.length === 0 && (
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
