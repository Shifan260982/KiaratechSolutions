"use client";

import { useRef, useState } from "react";
import { offices } from "@/content/site";

/*
 * Offices map: a world map with India and the UK highlighted. Choosing a country zooms the world towards the office city,
 * then cross-fades into an outline of the streets around the office (no street names), with a back control.
 * All artwork is self-hosted SVG: world from Natural Earth (public domain, India point-of-view boundaries),
 * streets from OpenStreetMap (ODbL, credited in the street view).
 */

type Region = "United Kingdom" | "India";

// Positions are fractions of public/images/maps/world.svg (viewBox 0 0 1000 455, Robinson projection).
const places: Record<Region, { city: string; pin: { x: number; y: number }; hit: { x: number; y: number; w: number; h: number }; streets: string }> = {
  "United Kingdom": {
    city: "London",
    pin: { x: 0.4665, y: 0.2008 },
    hit: { x: 0.415, y: 0.115, w: 0.085, h: 0.14 },
    streets: "/images/maps/london-streets.svg",
  },
  India: {
    city: "Navi Mumbai",
    pin: { x: 0.6798, y: 0.4427 },
    hit: { x: 0.65, y: 0.3, w: 0.105, h: 0.24 },
    streets: "/images/maps/navi-mumbai-streets.svg",
  },
};

const regions = Object.keys(places) as Region[];

export function OfficeExplorer() {
  const [open, setOpen] = useState<Region | null>(null);
  // The last office opened stays the zoom origin after closing, so the world zooms back out from that city, not the centre.
  const [origin, setOrigin] = useState<Region>("India");
  const backRef = useRef<HTMLButtonElement>(null);
  const countryRefs = useRef<Partial<Record<Region, HTMLButtonElement | null>>>({});
  const place = open ? places[open] : null;
  const address = (r: Region) => offices.find((o) => o.region === r)?.lines.join(", ") ?? "";

  const show = (r: Region) => {
    setOrigin(r);
    setOpen(r);
    // Focus follows the view so keyboard users land on the way back out.
    window.setTimeout(() => backRef.current?.focus({ preventScroll: true }), 50);
  };
  const back = () => {
    const from = open;
    setOpen(null);
    window.setTimeout(() => from && countryRefs.current[from]?.focus({ preventScroll: true }), 50);
  };

  return (
    <div>
      {/* overflow-clip, not hidden: a hidden box can still be scrolled by focus, which shifted the street view sideways. */}
      <div className="relative aspect-[1000/455] overflow-clip rounded-xl max-sm:aspect-[4/3] bg-paper shadow-[0_18px_40px_-24px_rgb(0_0_0/0.5)]">
        {/* World layer: zooms towards the chosen city, then fades as the street view arrives. */}
        <div
          aria-hidden={open !== null}
          inert={open !== null}
          // On phones the world is widened and shifted so Europe to Asia fills the taller card; pins stay aligned to the image.
          className="absolute inset-y-0 left-0 w-full transition-[scale,opacity] ease-in-out [transition-duration:1100ms,500ms] max-sm:left-[-49%] max-sm:w-[165%]"
          style={{
            transformOrigin: `${places[origin].pin.x * 100}% ${places[origin].pin.y * 100}%`,
            scale: place ? 9 : undefined,
            opacity: place ? 0 : 1,
            transitionDelay: place ? "0ms, 650ms" : "0ms, 0ms",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation to gain */}
          <img src="/images/maps/world.svg" alt="" className="size-full object-contain" />
          {regions.map((r) => {
            const p = places[r];
            return (
              <button
                key={r}
                ref={(el) => {
                  countryRefs.current[r] = el;
                }}
                type="button"
                onClick={() => show(r)}
                aria-label={`Show our ${p.city} office in ${r}`}
                className="group absolute cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                style={{ left: `${p.hit.x * 100}%`, top: `${p.hit.y * 100}%`, width: `${p.hit.w * 100}%`, height: `${p.hit.h * 100}%` }}
              >
                <Pin
                  hidden={open !== null}
                  style={{
                    left: `${((p.pin.x - p.hit.x) / p.hit.w) * 100}%`,
                    top: `${((p.pin.y - p.hit.y) / p.hit.h) * 100}%`,
                  }}
                  label={p.city}
                  labelSide={r === "India" ? "left" : "right"}
                />
              </button>
            );
          })}
        </div>

        {/* Street layer: settles in from a slight zoom once the world has flown in. */}
        {regions.map((r) => {
          const p = places[r];
          const active = open === r;
          return (
            <div
              key={r}
              aria-hidden={!active}
              inert={!active}
              className="absolute inset-0 transition-[opacity,scale] ease-out [transition-duration:700ms,1200ms]"
              style={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.35, transitionDelay: active ? "550ms" : "0ms" }}
            >
              {/* Loaded only when first opened, so the page does not fetch street maps nobody looks at. */}
              {(active || open !== null) && (
                // eslint-disable-next-line @next/next/no-img-element -- static SVG
                <img src={p.streets} alt="" className="size-full object-cover" />
              )}
              <Pin style={{ left: "50%", top: "50%" }} label={p.city} labelSide="right" large />
            </div>
          );
        })}

        {place && open && (
          <>
            <button
              ref={backRef}
              type="button"
              onClick={back}
              className="absolute left-3 top-3 inline-flex min-h-10 items-center gap-1.5 rounded-md bg-navy px-3 font-secondary text-sm font-semibold text-paper shadow-[0_6px_16px_-8px_rgb(2_33_98/0.6)] transition-colors hover:bg-blue-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 15 7.5 10l5-5" />
              </svg>
              World map
            </button>
            <p role="status" className="sr-only">
              Showing our {place.city} office: {address(open)}
            </p>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1.5 right-2 rounded-sm bg-paper/85 px-1.5 text-[11px] text-muted-strong hover:text-navy"
            >
              © OpenStreetMap contributors
            </a>
          </>
        )}
      </div>

    </div>
  );
}

function Pin({
  style,
  label,
  labelSide,
  large = false,
  hidden = false,
}: {
  style: React.CSSProperties;
  label: string;
  labelSide: "left" | "right";
  large?: boolean;
  /** Fades the pin out fast, so it does not balloon while the world zooms past it. */
  hidden?: boolean;
}) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute transition-opacity duration-150 ${hidden ? "opacity-0" : ""}`} style={style}>
      <span className={`office-pin-pulse absolute -translate-1/2 rounded-full bg-blue/35 ${large ? "size-14" : "size-9"}`} />
      <span className={`absolute -translate-1/2 rounded-full border-2 border-paper bg-blue shadow ${large ? "size-4" : "size-3"}`} />
      <span
        className={`absolute top-0 -translate-y-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-0.5 text-xs font-semibold sm:px-2.5 sm:py-1 sm:text-sm text-paper shadow-[0_6px_16px_-8px_rgb(2_33_98/0.6)] ${
          labelSide === "right" ? "left-3.5" : "right-3.5"
        } ${large ? "sm:text-base" : ""}`}
      >
        {label}
      </span>
    </span>
  );
}
