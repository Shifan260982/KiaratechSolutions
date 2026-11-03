"use client";

import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/content/caseStudies";
import { CarouselControls } from "./CarouselControls";
import { ArrowIcon, Container } from "./ui";
import { useCarousel } from "./useCarousel";

const ease = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Full-bleed project slider: photo backdrop with the project name and description over it. */
export function ProjectSlider({ projects }: { projects: CaseStudy[] }) {
  const { index, goTo, autoplayOn, toggle, playing, holdProps } = useCarousel(projects.length, 7000);

  return (
    <section
      aria-labelledby="projects-heading"
      aria-roledescription="carousel"
      className="relative isolate h-[42rem] overflow-hidden bg-navy text-paper md:h-[44rem]"
      {...holdProps}
    >
      <div id="project-slides" aria-live={playing ? "off" : "polite"} className="size-full">
        {projects.map((p, i) => {
          const active = i === index;
          return (
            <article
              key={p.slug}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${projects.length}: ${p.name}`}
              aria-hidden={!active}
              inert={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ${active ? "z-[1] opacity-100" : "opacity-0"}`}
            >
              {p.photo && (
                <Image
                  src={p.photo.src}
                  alt={p.photo.alt}
                  fill
                  loading="lazy"
                  sizes="100vw"
                  className={`object-cover transition-transform duration-[8000ms] ease-out ${active ? "scale-100" : "scale-[1.06]"}`}
                />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy via-navy/75 to-navy/30 md:bg-linear-to-r md:from-navy/95 md:via-navy/65 md:to-navy/10" />
              <Container className="relative flex h-full flex-col justify-end pb-36 md:pb-44">
                <div
                  className={`max-w-2xl transition-[opacity,translate] delay-200 duration-1000 ${ease} ${
                    active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  <ul className="flex flex-wrap gap-1.5" aria-label="Categories">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-full bg-paper/12 px-2.5 py-1 text-xs font-medium text-sky ring-1 ring-paper/20">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-5 text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em]">{p.name}</h3>
                  <p className="mt-2 text-lg font-semibold text-blue-soft md:text-xl">{p.title}</p>
                  <p className="mt-4 max-w-xl leading-relaxed text-sky/90 md:text-lg">{p.description}</p>
                  <Link
                    href={`/case-studies/${p.slug}`}
                    className="group mt-6 inline-flex items-center gap-2 font-semibold text-paper underline decoration-paper/40 underline-offset-[0.3em] transition-colors hover:decoration-paper"
                  >
                    Explore {p.name}
                    <ArrowIcon className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </Link>
                </div>
              </Container>
            </article>
          );
        })}
      </div>

      {/* Heading sits above the slides so it stays fixed while they change. */}
      <Container className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-12 md:pt-16">
        <h2 id="projects-heading" className="text-title font-semibold">
          Our projects
        </h2>
      </Container>

      <CarouselControls
        labels={projects.map((p) => p.name)}
        index={index}
        onSelect={goTo}
        autoplayOn={autoplayOn}
        onToggle={toggle}
        controlsId="project-slides"
      />
    </section>
  );
}
