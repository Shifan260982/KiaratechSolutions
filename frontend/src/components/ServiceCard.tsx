import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/content/services";
import { ArrowIcon } from "./ui";

export function ServiceCard({
  service,
  headingLevel = "h3",
  titleOnlyOnMobile = false,
}: {
  service: Service;
  headingLevel?: "h2" | "h3";
  /**
   * Below sm: the photo fills the card behind a navy scrim and only the title shows, so two cards fit side by side.
   * sm and up are unchanged.
   */
  titleOnlyOnMobile?: boolean;
}) {
  const Heading = headingLevel;
  const t = titleOnlyOnMobile;
  return (
    // Compact horizontal card on phones keeps nine services from becoming a long scroll.
    // The whole card is the link: the title's link stretches over it.
    <article
      className={`group relative flex w-full overflow-hidden rounded-xl border border-line bg-paper transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-[0_16px_40px_-24px_rgb(2_33_98/0.45)] has-[a:focus-visible]:border-blue has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue sm:flex-col ${t ? "max-sm:isolate max-sm:min-h-36 max-sm:border-0" : ""}`}
    >
      <div
        className={`relative w-28 shrink-0 overflow-hidden bg-sky sm:aspect-[16/9] sm:w-auto ${t ? "max-sm:absolute max-sm:inset-0 max-sm:-z-10 max-sm:w-full max-sm:bg-navy" : ""}`}
      >
        <Image
          src={service.image.src}
          alt={service.image.alt}
          width={800}
          height={500}
          loading="lazy"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 50vw"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Scrim keeps the white title readable on any photo; phones only. */}
        {t && <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/55 to-navy/10 sm:hidden" />}
      </div>
      <div className={`flex flex-1 flex-col p-4 sm:p-5 ${t ? "max-sm:justify-end" : ""}`}>
        <Heading
          className={`text-base font-semibold text-navy transition-colors group-hover:text-blue sm:text-heading ${t ? "max-sm:text-paper max-sm:group-hover:text-paper" : ""}`}
        >
          <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {service.name}
          </Link>
        </Heading>
        <p className={`mt-1.5 text-sm leading-relaxed text-ink/85 sm:mt-2 sm:text-base ${t ? "max-sm:hidden" : ""}`}>{service.summary}</p>
        {t && (
          <span aria-hidden="true" className="pt-2 text-blue-soft sm:hidden">
            <ArrowIcon className="size-4" />
          </span>
        )}
      </div>
    </article>
  );
}
