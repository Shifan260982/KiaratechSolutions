import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { offices, site, whatsappHref } from "@/content/site";
import { services } from "@/content/services";
import { OpenArsenalButton } from "./Header";
import { Container } from "./ui";

const company = [
  { href: "/about", label: "Our Story" },
  { href: "/case-studies", label: "Portfolio" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookie Policy" },
];

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold text-navy">{children}</h2>;
}

const linkClass = "text-muted-strong transition-colors hover:text-blue";

export function Footer() {
  const whatsapp = whatsappHref();

  return (
    <footer className="border-t border-line bg-paper font-secondary text-[0.9375rem]">
      <Container className="grid gap-10 py-12 md:grid-cols-12 md:py-14">
        <div className="md:col-span-4">
          <Image src="/brand/kiaratech-logo.webp" alt="Kiaratech Solutions" width={1396} height={274} className="h-10 w-auto" />
          <p className="mt-4 max-w-xs leading-relaxed text-muted-strong">{site.positioning}</p>
        </div>

        <nav aria-label="Capabilities" className="md:col-span-3">
          <FooterHeading>Capabilities</FooterHeading>
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className={linkClass}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <FooterHeading>Company</FooterHeading>
          <ul className="space-y-2">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <OpenArsenalButton className={`${linkClass} text-left`} />
            </li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <FooterHeading>Offices</FooterHeading>
          <div className="space-y-4">
            {offices.map((o) => (
              <address key={o.region} className="not-italic leading-relaxed text-muted-strong">
                <span className="block font-medium text-ink">{o.region}</span>
                {o.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ))}
          </div>
          <ul className="mt-5 space-y-2">
            <li>
              <a href={`mailto:${site.businessEmail}`} className={linkClass}>
                Business: {site.businessEmail}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.careersEmail}`} className={linkClass}>
                Careers: {site.careersEmail}
              </a>
            </li>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
          {site.linkedInUrl && (
            <a
              href={site.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kiaratech Solutions on LinkedIn (opens in a new tab)"
              className="mt-5 inline-flex size-10 items-center justify-center rounded-md text-navy transition-colors hover:bg-sky hover:text-blue-deep"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="currentColor">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </a>
          )}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-3 py-5 text-sm text-muted-strong md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-blue">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
