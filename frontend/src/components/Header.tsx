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

// One stroke family (24px grid, 1.5 stroke) for the stack groups.
const arsenalIcons: Record<(typeof arsenal)[number]["group"], ReactNode> = {
  AI: <path d="M12 3.5 13.9 8.6 19 10.5l-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5ZM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />,
  "Robotics and industrial automation": (
    <path d="M4 20.5h9M6.5 20.5v-3h4v3M8.5 17.5l3-7.5M11.5 10l5.5-3M17 7l2.5 3M19.5 10l-1.5 1.5M11.5 10a1.5 1.5 0 1 0 0 .01M17 7a1.5 1.5 0 1 0 0 .01" />
  ),
  "Cloud and infrastructure": <path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96 6 6 0 0 1 11.47 1.47A3.75 3.75 0 0 1 17.25 18.5H7Z" />,
  "Data and analytics": <path d="M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-3.5" />,
  "Cybersecurity and compliance": <path d="M12 3.5 5 6.25v5.5c0 4.25 2.9 7.6 7 8.75 4.1-1.15 7-4.5 7-8.75v-5.5L12 3.5ZM9 12l2.25 2.25L15.5 10" />,
  "Enterprise integration": (
    <path d="M6 7.5a2.5 2.5 0 1 0 0-.01M18 7.5a2.5 2.5 0 1 0 0-.01M12 18.5a2.5 2.5 0 1 0 0-.01M8.5 7.5h7M7.3 9.7l3.4 6.6M16.7 9.7l-3.4 6.6" />
  ),
  "Languages and frameworks": <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />,
};

/** Stagger for items rising into a mega panel, after the intro. */
const riseDelay = (i: number) => ({ animationDelay: `${120 + i * 70}ms` });

/**
 * Shell shared by the full-width navbar panels (Capabilities, Our Arsenal).
 * Deep navy sheet, a touch translucent with blur; supporting text uses navy-muted, a light tinted from the navy itself;
 * blue appears as the top edge and in each panel's accents. A short intro holds the left edge; content fills the rest.
 * Entrance: the sheet unrolls from the navbar edge, then the intro and items rise in sequence (CSS, off under reduced motion).
 */
function MegaPanel({
  title,
  intro,
  footer,
  stacked = false,
  children,
}: {
  title: string;
  intro: string;
  footer?: ReactNode;
  /** Keep the intro above the content at every width, so wide content (Our Arsenal's columns) gets the full row. */
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="arsenal-sheet max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t-2 border-blue bg-navy/75 text-paper shadow-[0_28px_48px_-24px_rgb(2_33_98/0.55)] backdrop-blur-xl">
      {/* Below xl the intro sits above the content so the columns keep their room. */}
      <Container className={`grid gap-8 py-10 ${stacked ? "" : "xl:grid-cols-[minmax(0,15rem)_1fr] xl:gap-12"}`}>
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
 * Seven groups in a grid (three across on laptops, four from xl), each opened by a hairline, its icon and title on one line,
 * and its technologies as chips so the whole stack scans in one pass.
 */
function ArsenalPanel() {
  return (
    <MegaPanel stacked title="Our Arsenal" intro="The languages, platforms and practices our teams build with, from the first prototype to production.">
      <ul className="grid grid-cols-3 gap-x-8 gap-y-7 xl:grid-cols-4 xl:gap-x-10">
        {arsenal.map((a, i) => (
          <li key={a.group} className="arsenal-rise border-t border-white/10 pt-5" style={riseDelay(i)}>
            <h3 className="flex items-start gap-2.5 font-semibold leading-snug text-paper">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="-mt-0.5 size-6 shrink-0 text-blue-soft"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {arsenalIcons[a.group]}
              </svg>
              {a.group}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {a.items.split(", ").map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-blue/40 bg-blue/15 px-2.5 py-1 text-[0.8125rem] font-medium leading-none whitespace-nowrap text-sky"
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
            <Link href={aboutLink.href} aria-current={isActive(aboutLink.href) ? "page" : undefined} className="block border-b border-line py-3 font-medium text-ink">
              {aboutLink.label}
            </Link>
            {/* Native disclosure: opens and closes with tap or keyboard, collapsed by default so the menu stays short.
                Opens itself when the current page is one of its services. */}
            <details className="group border-b border-line" open={pathname.startsWith("/services/") || undefined}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
                Capabilities
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 text-muted-strong transition-transform duration-200 group-open:rotate-180">
                  <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <ul className="pb-3 pl-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    aria-current={isActive(`/services/${s.slug}`) ? "page" : undefined}
                    className="block py-2 text-[0.9375rem] text-ink/85 aria-[current=page]:font-medium aria-[current=page]:text-blue-deep"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              </ul>
            </details>
            <details className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
                Our Arsenal
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 text-muted-strong transition-transform duration-200 group-open:rotate-180">
                  <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <ul className="space-y-3 pb-4 pl-3">
                {arsenal.map((a) => (
                  <li key={a.group}>
                    <span className="block text-[0.9375rem] text-ink">{a.group}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted-strong">{a.items}</span>
                  </li>
                ))}
              </ul>
            </details>
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
