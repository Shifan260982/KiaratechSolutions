import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { ArrowIcon, PageIntro, Section } from "@/components/ui";
import { articles } from "@/content/insights";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Insights",
  description: "Practical articles on enterprise AI, AI agents, automation, cloud and data, and software engineering delivery.",
  path: "/insights",
});

export default function InsightsPage() {
  const sorted = [...articles].sort((a, b) => b.published.localeCompare(a.published));

  return (
    <>
      <PageIntro
        title="Insights"
        intro="Practical guidance on enterprise AI, AI agents, automation, cloud and data, and software engineering delivery."
      />
      <Section aria-label="Articles">
        {sorted.length === 0 ? (
          <p className="text-muted-strong">New articles are published monthly. Check back soon.</p>
        ) : (
          <ul className="border-t border-line">
            {sorted.map((a) => (
              <li key={a.slug} className="border-b border-line">
                <Link href={`/insights/${a.slug}`} className="group grid gap-3 py-7 md:grid-cols-12 md:gap-8">
                  <p className="order-2 text-sm text-muted-strong md:order-none md:col-span-3">
                    {a.topic}
                    <span className="block">
                      <time dateTime={a.published}>{formatDate(a.published)}</time> · {a.readingMinutes} min read
                    </span>
                  </p>
                  <div className="md:col-span-8">
                    <h2 className="text-heading font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 md:text-2xl">
                      {a.title}
                    </h2>
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted-strong">{a.summary}</p>
                  </div>
                  <ArrowIcon className="hidden size-5 justify-self-end transition-transform duration-150 group-hover:translate-x-1 md:col-span-1 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <CtaBand />
    </>
  );
}
