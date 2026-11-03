import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Section({
  tone = "paper",
  className = "",
  children,
  ...rest
}: { tone?: "paper" | "mist"; className?: string; children: ReactNode } & ComponentProps<"section">) {
  const bg = tone === "mist" ? "bg-mist" : "bg-paper";
  return (
    <section className={`${bg} py-14 md:py-20 ${className}`} {...rest}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  id,
  title,
  intro,
  action,
}: {
  id?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 id={id} className="text-title font-semibold text-navy">
          {title}
        </h2>
        {intro && <p className="mt-3 text-base leading-relaxed text-muted-strong md:text-lg">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "inverse" | "inverse-outline";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue text-paper border border-blue hover:bg-blue-deep hover:border-blue-deep shadow-sm shadow-blue/20",
  secondary: "bg-paper text-navy border border-line-strong hover:border-blue hover:text-blue",
  inverse: "bg-paper text-navy border border-paper hover:bg-sky",
  "inverse-outline": "bg-transparent text-paper border border-white/40 hover:border-paper",
};

export const buttonClass = (variant: ButtonVariant = "primary") =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-secondary px-5 py-2.5 text-[0.9375rem] font-semibold leading-tight transition-colors duration-150 ${buttonStyles[variant]}`;

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h9.5M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-blue transition-colors hover:text-blue-deep ${className}`}
    >
      {children}
      <ArrowIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Marks content that is awaiting approval. Searchable in code and visibly distinct on the page. */
export function Placeholder({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-sm border border-dashed border-line-strong bg-paper px-4 py-3 text-sm leading-relaxed text-muted-strong ${className}`}
    >
      <span className="font-semibold text-ink">Placeholder: </span>
      {children}
    </div>
  );
}

export function PageIntro({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-sky">
      <Container className="py-12 md:py-16">
        <h1 className="max-w-3xl text-display font-semibold text-navy">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-strong">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </div>
  );
}
