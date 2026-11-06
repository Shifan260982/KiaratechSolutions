"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ctas } from "@/content/site";
import { services } from "@/content/services";
import { ArrowIcon, buttonClass, Container } from "./ui";

// Capabilities (services) sits second, after Our Story, as a dropdown.
const [aboutLink, ...navLinks] = [
  { href: "/about", label: "Our Story" },
  { href: "/case-studies", label: "Portfolio" },
  { href: "/industries", label: "Sectors" },
  { href: "/careers", label: "Careers" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const lastPointer = useRef("");

  // Mouse users open the menu by hovering; a short close delay forgives brief exits.
  const onServicesEnter = (e: ReactPointerEvent) => {
    lastPointer.current = e.pointerType;
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const onServicesLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 150);
  };
  // A mouse click keeps the hover-opened menu open; keyboard and touch toggle it.
  const onServicesClick = (e: ReactMouseEvent) =>
    e.detail > 0 && lastPointer.current === "mouse" ? setServicesOpen(true) : setServicesOpen((o) => !o);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Close menus after navigation (state adjusted during render, per React guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setServicesOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const servicesActive = pathname.startsWith("/services");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="Kiaratech Solutions home">
          <Image src="/brand/kiaratech-logo.webp" alt="Kiaratech Solutions" width={480} height={172} priority className="h-12 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden font-secondary lg:block">
          <ul className="flex items-center gap-1 text-[0.9375rem]">
            <li>
              <Link
                href={aboutLink.href}
                aria-current={isActive(aboutLink.href) ? "page" : undefined}
                className={`rounded-sm px-3 py-2 transition-colors hover:text-blue ${isActive(aboutLink.href) ? "text-blue" : "text-ink"}`}
              >
                {aboutLink.label}
              </Link>
            </li>
            <li>
              <div ref={servicesRef} className="relative" onPointerEnter={onServicesEnter} onPointerLeave={onServicesLeave}>
                <button
                  ref={servicesButtonRef}
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="services-menu"
                  onClick={onServicesClick}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-2 transition-colors hover:text-blue ${
                    servicesActive || servicesOpen ? "text-blue" : "text-ink"
                  }`}
                >
                  Capabilities
                  <Chevron open={servicesOpen} />
                </button>
                {servicesOpen && (
                  // Top padding instead of margin keeps the hover area continuous from button to panel.
                  <div id="services-menu" className="absolute -left-4 top-full w-[46rem] pt-3">
                    <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-[0_24px_48px_-24px_rgb(16_42_86/0.35)]">
                      <ul className="grid grid-cols-3 gap-1 p-2">
                        {services.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`/services/${s.slug}`}
                              aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
                              className="block h-full rounded-lg px-3 py-3 transition-colors hover:bg-sky aria-[current=page]:bg-sky"
                            >
                              <span className="block font-semibold text-navy">{s.name}</span>
                              <span className="mt-1 line-clamp-2 text-sm leading-snug text-muted-strong">{s.summary}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/services"
                        className="flex items-center justify-between border-t border-line bg-mist px-5 py-3 text-sm font-semibold text-blue transition-colors hover:text-blue-deep"
                      >
                        <span>View all capabilities</span>
                        <ArrowIcon />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </li>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-sm px-3 py-2 transition-colors hover:text-blue ${
                    isActive(l.href) ? "text-blue" : "text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={ctas.discovery.href} className={`${buttonClass("primary")} max-sm:hidden`}>
            {ctas.discovery.short}
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm border border-line lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <nav id="mobile-menu" aria-label="Main" className="font-secondary max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper lg:hidden">
          <Container className="py-4">
            <Link href={aboutLink.href} aria-current={isActive(aboutLink.href) ? "page" : undefined} className="block border-b border-line py-2.5 text-ink">
              {aboutLink.label}
            </Link>
            <p className="pb-2 pt-3 text-sm font-semibold text-muted-strong">Capabilities</p>
            <ul className="border-b border-line pb-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
                    className="block py-2.5 text-ink"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="py-3">
              {[...navLinks, { href: "/contact", label: "Contact" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className="block py-2.5 text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={ctas.discovery.href} className={`${buttonClass("primary")} w-full sm:hidden`}>
              {ctas.discovery.short}
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
