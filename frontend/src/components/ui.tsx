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
  image,
  imagePosition = "center",
  tall = false,
  highlight = false,
  children,
}: {
  title: string;
  intro?: string;
  /** Decorative photo on the right. Absolutely positioned, so the band keeps its text-driven height. */
  image?: string;
  /** Which part of the photo stays visible when it is cropped to the band (CSS object-position). */
  imagePosition?: string;
  /** Taller band (a third of the page width) so the photo carries more of the hero. */
  tall?: boolean;
  /** Puts the title and intro on a solid text background instead of relying on a text shadow. */
  highlight?: boolean;
  children?: ReactNode;
}) {
  const textShadow = "[text-shadow:0_1px_12px_rgb(0_0_0/0.75)]";
  const marker = "rounded-md bg-black/50 px-3 py-1 box-decoration-clone";
  return (
    // tall: a 3:1 band (height = a third of the width), so a 3:2 photo anchored to the top shows its upper half.
    <div className={`relative isolate overflow-hidden border-b border-line bg-sky ${tall ? "flex min-h-[33.34vw] items-center" : ""}`}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- static export with unoptimised images, next/image adds nothing here
        <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" style={{ objectPosition: imagePosition }} />
      )}
      <Container className="py-12 md:py-16">
        {/* Over a full-strength photo, white text with a soft shadow stays readable on both light and dark areas;
            highlight instead sets each line on a black marker band (box-decoration-clone repeats the padding per line). */}
        <h1 className={`max-w-3xl text-display font-semibold ${image ? `text-paper ${highlight ? "" : textShadow}` : "text-navy"}`}>
          {highlight ? <span className={marker}>{title}</span> : title}
        </h1>
        {intro && (
          <p className={`mt-5 max-w-2xl text-lg ${image ? `font-medium text-paper ${highlight ? "leading-loose" : `leading-relaxed ${textShadow}`}` : "leading-relaxed text-muted-strong"}`}>
            {highlight ? <span className={marker}>{intro}</span> : intro}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </div>
  );
}
