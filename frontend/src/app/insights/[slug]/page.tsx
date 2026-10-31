import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Container, TextLink } from "@/components/ui";
import { articles, getArticle, type ArticleBlock } from "@/content/insights";
import { getService } from "@/content/services";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return pageMetadata({ title: article.title, description: article.summary, path: `/insights/${article.slug}` });
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-10 text-heading font-semibold md:text-2xl">{block.text}</h2>;
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-lg leading-relaxed text-muted-strong marker:text-ink">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return <p className="mt-4 text-lg leading-relaxed text-muted-strong">{block.text}</p>;
  }
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const service = getService(article.serviceSlug);

  return (
    <>
      <article>
        <header className="border-b border-line">
          <Container className="py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-strong">
              <Link href="/insights" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                Insights
              </Link>
            </nav>
            <h1 className="max-w-3xl text-display font-semibold">{article.title}</h1>
            <p className="mt-4 text-sm text-muted-strong">
              {article.topic} · <time dateTime={article.published}>{formatDate(article.published)}</time> · {article.readingMinutes} min read
            </p>
          </Container>
        </header>
        <Container className="py-12 md:py-16">
          <div className="max-w-[68ch]">
            <p className="text-xl leading-relaxed">{article.summary}</p>
            {article.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
            {service && (
              <div className="mt-12 border-t border-ink pt-5">
                <p className="text-muted-strong">Related service</p>
                <TextLink href={`/services/${service.slug}`} className="mt-1">
                  {service.name}
                </TextLink>
              </div>
            )}
          </div>
        </Container>
      </article>
      <CtaBand />
    </>
  );
}
