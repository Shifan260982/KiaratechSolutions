"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ctas } from "@/content/site";
import { coreServices, services } from "@/content/services";
import { ArrowIcon, buttonClass, Container } from "./ui";

const navLinks = [
  { href: "/industries", label: "Industries" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/careers", label: "Careers" },
];

const talent = services.find((s) => s.secondary)!;

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

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.9375rem]">
            <li>
              <div ref={servicesRef} className="relative">
                <button
                  ref={servicesButtonRef}
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="services-menu"
                  onClick={() => setServicesOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-2 transition-colors hover:text-ink ${
                    servicesActive || servicesOpen ? "text-ink" : "text-muted-strong"
                  }`}
                >
                  Services
                  <Chevron open={servicesOpen} />
                </button>
                {servicesOpen && (
                  <div
                    id="services-menu"
                    className="absolute left-0 top-full mt-3 w-[34rem] rounded-sm border border-line bg-paper shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)]"
                  >
                    <ul className="grid grid-cols-2 gap-px bg-line p-px">
                      {coreServices.map((s) => (
                        <li key={s.slug} className="bg-paper last:odd:col-span-2">
                          <Link
                            href={`/services/${s.slug}`}
                            aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
                            className="block h-full px-4 py-3.5 transition-colors hover:bg-mist aria-[current=page]:bg-mist"
                          >
                            <span className="block font-medium text-ink">{s.name}</span>
                            <span className="mt-1 line-clamp-2 text-sm leading-snug text-muted-strong">{s.summary}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/services/${talent.slug}`}
                      className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted-strong transition-colors hover:bg-mist hover:text-ink"
                    >
                      <span>
                        Need specialists for your team? <span className="font-medium text-ink">{talent.name}</span>
                      </span>
                      <ArrowIcon />
                    </Link>
                  </div>
                )}
              </div>
            </li>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-sm px-3 py-2 transition-colors hover:text-ink ${
                    isActive(l.href) ? "text-ink underline decoration-1 underline-offset-[6px]" : "text-muted-strong"
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
        <nav id="mobile-menu" aria-label="Main" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper lg:hidden">
          <Container className="py-4">
            <p className="pb-2 pt-1 text-sm font-semibold text-muted-strong">Services</p>
            <ul className="border-b border-line pb-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
                    className={`block py-2.5 ${s.secondary ? "text-muted-strong" : "text-ink"}`}
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
