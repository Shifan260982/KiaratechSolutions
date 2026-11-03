import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/content/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    // Compact horizontal card on phones keeps nine services from becoming a long scroll.
    // The whole card is the link: the title's link stretches over it.
    <article className="group relative flex w-full overflow-hidden rounded-xl border border-line bg-paper transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-[0_16px_40px_-24px_rgb(16_42_86/0.45)] has-[a:focus-visible]:border-blue has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue sm:flex-col">
      <div className="relative w-28 shrink-0 overflow-hidden bg-sky sm:aspect-[16/9] sm:w-auto">
        <Image
          src={service.image.src}
          alt={service.image.alt}
          width={800}
          height={500}
          loading="lazy"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base font-semibold text-navy transition-colors group-hover:text-blue sm:text-heading">
          <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {service.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/85 sm:mt-2 sm:text-base">{service.summary}</p>
      </div>
    </article>
  );
}
