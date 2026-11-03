"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { about } from "@/content/home";
import { ButtonLink, Container } from "./ui";

const ease = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * Greeting band: the portrait enters from the left and the copy from the right.
 * Content renders visible by default; the entrance is armed only when the section
 * starts below the fold with JavaScript running and motion allowed.
 */
export function AboutGreeting() {
  const ref = useRef<HTMLElement>(null);
  const [stage, setStage] = useState<"static" | "armed" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setStage("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStage("shown");
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = stage === "armed";
  // Transition only on reveal, so arming hides instantly instead of fading out.
  const motion = stage === "shown" ? `transition-[opacity,translate] duration-[1100ms] ${ease}` : "";

  return (
    // Desktop geometry hangs off the figure height (--fig-h): the heading lines up with the head,
    // and the blue band starts at shoulder level (--shoulder, 30% down the cut-out).
    <section
      ref={ref}
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden bg-linear-to-br from-blue to-navy pt-14 lg:bg-none lg:bg-paper lg:pt-12 lg:[--fig-h:36rem] lg:[--shoulder:calc(var(--fig-h)*0.3)] xl:[--fig-h:38rem]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-[calc(3rem+var(--shoulder))] -z-10 hidden bg-linear-to-r from-blue via-blue-deep to-navy lg:block"
      />
      <Container className="grid gap-x-12 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:h-(--shoulder)">
          <h2 id="about-heading" className="text-display font-bold text-paper lg:text-navy">
            About{" "}
            <span className="lg:bg-linear-to-t lg:from-blue/20 lg:from-30% lg:to-transparent lg:to-30%">Kiaratech</span>
          </h2>
        </div>

        <div
          className={`order-last mt-10 self-end lg:order-none lg:col-span-5 lg:row-span-2 lg:row-start-1 lg:mt-0 ${motion} ${
            hidden ? "-translate-x-24 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          {/* Transparent cut-out: the figure stands on the band's bottom edge with no frame. */}
          <Image
            src={about.image.src}
            alt={about.image.alt}
            width={257}
            height={394}
            sizes="(min-width: 1024px) 380px, 260px"
            className="mx-auto h-[24rem] w-auto drop-shadow-[0_24px_30px_rgb(16_42_86/0.35)] lg:h-(--fig-h)"
          />
        </div>

        <div
          className={`pt-6 text-paper lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:flex lg:min-h-[calc(var(--fig-h)-var(--shoulder))] lg:flex-col lg:justify-center lg:py-8 ${motion} delay-150 ${
            hidden ? "translate-x-24 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <p className="text-heading font-semibold text-blue-soft md:text-2xl">{about.greeting}</p>
          {about.paragraphs.map((p) => (
            <p key={p} className="mt-3 max-w-[68ch] leading-relaxed text-sky/90 xl:text-[1.0625rem]">
              {p}
            </p>
          ))}
          <div className="mt-7 flex flex-wrap items-end gap-x-12 gap-y-6">
            <dl className="flex gap-x-10">
              {about.figures.map((f) => (
                <div key={f.label} className="flex flex-col-reverse">
                  <dt className="text-sm text-sky/80">{f.label}</dt>
                  <dd className="text-3xl font-bold tracking-tight tabular-nums">{f.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href="/about" variant="inverse-outline" className="px-6">
              More about us
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
