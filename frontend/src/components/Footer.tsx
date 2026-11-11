import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { offices, site, whatsappHref } from "@/content/site";
import { services } from "@/content/services";
import { OpenArsenalButton } from "./Header";
import { Container } from "./ui";

const company = [
  { href: "/about", label: "Our Story" },
  { href: "/industries", label: "Sectors" },
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
          <Image src="/brand/kiaratech-logo.webp" alt="Kiaratech Solutions" width={480} height={172} className="h-14 w-auto" />
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
              <a href={`mailto:${site.careersEmail}`} className={linkClass}>
                Careers: {site.careersEmail}
              </a>
            </li>
            {site.linkedInUrl && (
              <li>
                <a href={site.linkedInUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  LinkedIn
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
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
