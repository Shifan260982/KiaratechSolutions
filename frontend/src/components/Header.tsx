"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { arsenal, ctas } from "@/content/site";
import { services } from "@/content/services";
import { ArrowIcon, buttonClass, Container } from "./ui";

// Capabilities (services) sits second, after Our Story, as a dropdown; Our Arsenal follows it.
const [aboutLink, ...navLinks] = [
  { href: "/about", label: "Our Story" },
  { href: "/case-studies", label: "Portfolio" },
  { href: "/industries", label: "Sectors" },
  { href: "/careers", label: "Careers" },
];

/** Fired by the footer's "Our Arsenal" button to open the navbar menu. */
const OPEN_ARSENAL = "kiaratech:open-arsenal";

type Menu = "services" | "arsenal" | null;

const navText = (active: boolean) => `rounded-sm px-2 py-2 whitespace-nowrap transition-colors xl:px-3 hover:text-blue ${active ? "text-blue-deep" : "text-navy"}`;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Navbar dropdown. Mouse users open it by hovering (a short close delay forgives brief exits);
 * keyboard and touch toggle it. Clicking outside or pressing Escape closes it.
 */
function NavDropdown({
  id,
  label,
  open,
  onOpenChange,
  active,
  buttonRef,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
  buttonRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const lastPointer = useRef("");

  const onEnter = (e: ReactPointerEvent) => {
    lastPointer.current = e.pointerType;
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    onOpenChange(true);
  };
  const onLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 150);
  };
  // A mouse click keeps the hover-opened menu open; keyboard and touch toggle it.
  const onClick = (e: ReactMouseEvent) => onOpenChange(e.detail > 0 && lastPointer.current === "mouse" ? true : !open);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange, buttonRef]);

  return (
    // Not positioned: the panel positions against the sticky header, so it spans the full viewport width.
    <div ref={ref} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onClick}
        className={`flex items-center gap-1.5 ${navText(active || open)}`}
      >
        {label}
        <Chevron open={open} />
      </button>
      {open && (
        <div id={id} className="absolute inset-x-0 top-full">
          {children}
        </div>
      )}
    </div>
  );
}

// One stroke family (24px grid, 1.5 stroke) for the four stack groups.
const arsenalIcons: Record<(typeof arsenal)[number]["group"], ReactNode> = {
  "Languages and frameworks": <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />,
  Cloud: <path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96 6 6 0 0 1 11.47 1.47A3.75 3.75 0 0 1 17.25 18.5H7Z" />,
  "Data and analytics": <path d="M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-3.5" />,
  "Engineering practice": (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46" />
    </>
  ),
};

/** Stagger for items rising into a mega panel, after the intro. */
const riseDelay = (i: number) => ({ animationDelay: `${120 + i * 70}ms` });

/**
 * Shell shared by the full-width navbar panels (Capabilities, Our Arsenal).
 * Deep navy sheet, a touch translucent with blur; supporting text uses navy-muted, a light tinted from the navy itself;
 * blue appears as the top edge and in each panel's accents. A short intro holds the left edge; content fills the rest.
 * Entrance: the sheet unrolls from the navbar edge, then the intro and items rise in sequence (CSS, off under reduced motion).
 */
function MegaPanel({ title, intro, footer, children }: { title: string; intro: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className="arsenal-sheet border-t-2 border-blue bg-navy/75 text-paper shadow-[0_28px_48px_-24px_rgb(2_33_98/0.55)] backdrop-blur-xl">
      {/* Below xl the intro sits above the content so the columns keep their room. */}
      <Container className="grid gap-8 py-10 xl:grid-cols-[minmax(0,15rem)_1fr] xl:gap-12">
        <div className="arsenal-rise" style={{ animationDelay: "60ms" }}>
          <p className="text-title font-semibold text-paper">{title}</p>
          <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-navy-muted">{intro}</p>
          {footer}
        </div>
        {children}
      </Container>
    </div>
  );
}

/** Capabilities panel: the nine services as links, with the full list one step away. */
function CapabilitiesPanel({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <MegaPanel
      title="Capabilities"
      intro="Specialist teams for every stage of the software lifecycle: analysis, architecture, development, testing, DevOps and ongoing support."
      footer={
        <Link
          href="/services"
          className="group mt-6 inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-semibold text-blue-soft transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-soft"
        >
          View all capabilities
          <ArrowIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      }
    >
      <ul className="grid grid-cols-3 gap-x-4 gap-y-1">
        {services.map((s, i) => (
          <li key={s.slug} className="arsenal-rise" style={riseDelay(Math.floor(i / 3) + (i % 3))}>
            <Link
              href={`/services/${s.slug}`}
              aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
              className="group block h-full rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-blue-soft aria-[current=page]:bg-blue/15"
            >
              <span className="flex items-center gap-2 font-semibold text-paper transition-colors group-hover:text-blue-soft group-aria-[current=page]:text-blue-soft">
                {s.name}
                <ArrowIcon className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
              <span className="mt-1 line-clamp-2 text-sm leading-snug text-navy-muted">{s.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </MegaPanel>
  );
}

/**
 * Our Arsenal panel. Display only: nothing links anywhere.
 * The four groups run as open columns split by hairlines, each technology set as a chip so the whole stack scans in one pass.
 */
function ArsenalPanel() {
  return (
    <MegaPanel title="Our Arsenal" intro="The languages, platforms and practices our teams build with, from the first prototype to production.">
        <ul className="grid grid-cols-4 divide-x divide-white/10">
          {arsenal.map((a, i) => (
            <li key={a.group} className="arsenal-rise px-6 first:pl-0 last:pr-0" style={riseDelay(i)}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-7 text-blue-soft"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {arsenalIcons[a.group]}
              </svg>
              <h3 className="mt-4 font-semibold leading-snug text-paper">{a.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {a.items.split(", ").map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-blue/40 bg-blue/15 px-2.5 py-1 text-[0.8125rem] font-medium leading-none whitespace-nowrap text-sky first-letter:uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
    </MegaPanel>
  );
}

/** Footer entry that opens the navbar's Our Arsenal menu (or the mobile menu on small screens). */
export function OpenArsenalButton({ className }: { className: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_ARSENAL))}>
      Our Arsenal
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<Menu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const arsenalButtonRef = useRef<HTMLButtonElement>(null);

  // Stable per-menu setters so each dropdown's listeners are not re-attached on every render.
  const setServicesOpen = useCallback((open: boolean) => setMenu((m) => (open ? "services" : m === "services" ? null : m)), []);
  const setArsenalOpen = useCallback((open: boolean) => setMenu((m) => (open ? "arsenal" : m === "arsenal" ? null : m)), []);

  // Close menus after navigation (state adjusted during render, per React guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const open = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMenu("arsenal");
        arsenalButtonRef.current?.focus({ preventScroll: true });
      } else {
        setMobileOpen(true);
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener(OPEN_ARSENAL, open);
    return () => window.removeEventListener(OPEN_ARSENAL, open);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line">
      {/* Tint and blur live on a layer, not the header itself: a blurred parent would stop the Our Arsenal panel
          from blurring the page beneath it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-paper/95 backdrop-blur-md" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-sm" aria-label="Kiaratech Solutions home">
          <Image src="/brand/kiaratech-logo.webp" alt="Kiaratech Solutions" width={1396} height={274} priority className="h-9 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden font-secondary lg:block">
          <ul className="flex items-center gap-1 text-[0.9375rem]">
            <li>
              <Link href={aboutLink.href} aria-current={isActive(aboutLink.href) ? "page" : undefined} className={navText(isActive(aboutLink.href))}>
                {aboutLink.label}
              </Link>
            </li>
            <li>
              <NavDropdown
                id="services-menu"
                label="Capabilities"
                open={menu === "services"}
                onOpenChange={setServicesOpen}
                active={pathname.startsWith("/services")}
                buttonRef={servicesButtonRef}
              >
                <CapabilitiesPanel isActive={isActive} />
              </NavDropdown>
            </li>
            <li>
              <NavDropdown
                id="arsenal-menu"
                label="Our Arsenal"
                open={menu === "arsenal"}
                onOpenChange={setArsenalOpen}
                active={false}
                buttonRef={arsenalButtonRef}
              >
                <ArsenalPanel />
              </NavDropdown>
            </li>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={navText(isActive(l.href))}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={ctas.discovery.href} className={`${buttonClass("primary")} whitespace-nowrap max-sm:hidden`}>
            {ctas.discovery.short}
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm border border-line-strong text-navy lg:hidden"
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
            <p className="pb-2 pt-3 text-sm font-semibold text-muted-strong">Our Arsenal</p>
            <ul className="border-b border-line pb-3">
              {arsenal.map((a) => (
                <li key={a.group} className="py-2">
                  <span className="block text-ink">{a.group}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted-strong">{a.items}</span>
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
