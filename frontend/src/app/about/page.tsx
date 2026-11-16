import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { InViewVideo } from "@/components/InViewVideo";
import { OfficeMap } from "@/components/OfficeMap";
import { SlideIn } from "@/components/SlideIn";
import { PageIntro, Section, SectionHeading } from "@/components/ui";
import { engagementModels } from "@/content/services";
import { metrics, offices } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Our Story",
  description:
    "Founded in India in 2022 with a UK presence since 2025, Kiaratech Solutions is a 110+ person AI-driven software partner.",
  path: "/about",
});

// Deep shades for the "How we engage" hover dividers: navy blue, forest green, deep violet, burnt orange, plum.
const dividerShades = ["#1e3a8a", "#166534", "#5b21b6", "#9a3412", "#831843"];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="An AI-driven software partner, built on specialist engineering" image="/images/heroes/our-story.webp" imagePosition="top" tall />

      <Section tone="mist" aria-labelledby="team-heading">
        {/* The heading starts level with the top of the photo; the copy stays centred in the space below it. */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <h2 id="team-heading" className="text-title font-semibold text-navy">
              Team
            </h2>
            <p className="mt-3 text-md leading-relaxed text-muted-strong md:text-lg ">
              Founded in India in 2022, Kiaratech Solutions has grown into a technology organisation with more than 110 professionals. We focus on delivering innovative and reliable technology solutions that help businesses improve efficiency and adapt to evolving digital needs. In 2025, we expanded our presence to the United Kingdom, enabling us to work more closely with clients across the UK and Europe while continuing to build lasting partnerships and drive digital growth.
            </p>
          </div>
          <Image
            src="/images/about/team.webp"
            alt="Members of the Kiaratech Solutions team standing together for a group photo"
            width={1348}
            height={898}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full rounded-lg shadow-[0_18px_40px_-20px_rgb(2_33_98/0.45)]"
          />
        </div>
      </Section>

      <Section aria-labelledby="story-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="story-heading" className="text-title font-semibold">
              How we got here
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-strong">
              Our journey has evolved from specialist technology talent and automation support into an AI-driven software partner
              focused on practical, scalable business outcomes. Today our teams span AI, software, cloud, data, automation,
              cybersecurity, finance and consulting, supporting clients across the UK, Europe, North America and international markets.
            </p>
          </div>
          <dl className="grid grid-cols-2 content-start gap-px border border-line bg-line lg:col-span-5">
            {metrics.map((m) => (
              <div key={m.value} className="flex flex-col-reverse justify-end bg-paper p-5">
                <dt className="mt-1 text-sm leading-snug text-muted-strong">{m.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="mist" aria-label="Company film">
        <div className="mx-auto max-w-5xl">
          <InViewVideo
            src="/images/about/company-film.mp4"
            poster="/images/about/company-film-poster.jpg"
            label="Kiaratech Solutions company film"
          />
        </div>
      </Section>

      <Section aria-labelledby="engagement-heading">
        <SectionHeading
          id="engagement-heading"
          title="How we engage"
          intro="Every engagement starts with clear business goals, delivery milestones and measurable success criteria."
        />
        <dl className="border-t border-line">
          {engagementModels.map((m, i) => (
            <div key={m.title} className="group relative grid gap-1 border-b border-line py-4 md:grid-cols-12 md:gap-8">
              <dt className="font-semibold md:col-span-4">{m.title}</dt>
              <dd className="leading-relaxed text-muted-strong md:col-span-8">
                <SlideIn>{m.detail}</SlideIn>
              </dd>
              {/* Divider fills left to right in this row's colour, thickening as it grows, while the row is hovered. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 transition-[scale,height] duration-1000 ease-out group-hover:h-1 group-hover:scale-x-100 motion-reduce:transition-none"
                style={{ backgroundColor: dividerShades[i % dividerShades.length] }}
              />
            </div>
          ))}
        </dl>
      </Section>

      <CtaBand>
        <h2 className="text-heading font-semibold">Offices</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          {offices.map((o) => (
            <div key={o.region} className="border-t border-white/25 pt-4">
              <h3 className="font-semibold text-paper">{o.region}</h3>
              {/* The map replaces the visible address; screen readers still get it as text. */}
              <address className="sr-only">{o.lines.join(", ")}</address>
              <div className="mt-3">
                <OfficeMap region={o.region} address={o.lines.join(", ")} />
              </div>
            </div>
          ))}
        </div>
      </CtaBand>
    </>
  );
}
