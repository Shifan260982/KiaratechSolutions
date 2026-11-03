"use client";

import Image from "next/image";
import { heroSlides } from "@/content/home";
import { CarouselControls } from "./CarouselControls";
import { Container } from "./ui";
import { useCarousel } from "./useCarousel";

const ease = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export function HeroSlider() {
  const { index, goTo, autoplayOn, toggle, playing, holdProps } = useCarousel(heroSlides.length, 6500);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Kiaratech highlights"
      className="relative isolate h-[calc(100svh-4rem)] max-h-[52rem] min-h-[34rem] overflow-hidden bg-navy text-paper"
      {...holdProps}
    >
      <h1 className="sr-only">Kiaratech Solutions: AI and software development partner</h1>
      <div id="hero-slides" aria-live={playing ? "off" : "polite"} className="size-full">
        {heroSlides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.image.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${heroSlides.length}`}
              aria-hidden={!active}
              inert={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ${active ? "z-[1] opacity-100" : "opacity-0"}`}
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[7000ms] ease-out ${active ? "scale-100" : "scale-[1.06]"}`}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-navy/95 via-navy/75 to-navy/20" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-navy/70 to-transparent" />
              <Container className="relative flex h-full items-center pb-16">
                <div
                  className={`max-w-3xl transition-[opacity,translate] delay-300 duration-1000 ${ease} ${
                    active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  <h2 className="text-[clamp(2.75rem,1.6rem+4.6vw,5.25rem)] font-bold leading-[1.02] tracking-[-0.035em]">
                    {slide.title} <span className="block text-blue-soft">{slide.accent}</span>
                  </h2>
                  <p className="mt-6 max-w-2xl text-xl leading-relaxed text-sky/90 md:text-2xl">{slide.text}</p>
                </div>
              </Container>
            </div>
          );
        })}
      </div>

      <CarouselControls
        labels={heroSlides.map((s) => `${s.title} ${s.accent}`)}
        index={index}
        onSelect={goTo}
        autoplayOn={autoplayOn}
        onToggle={toggle}
        controlsId="hero-slides"
      />
    </section>
  );
}
