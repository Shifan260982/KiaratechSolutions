import { ctas } from "@/content/site";
import { ButtonLink, Container } from "./ui";

export function CtaBand({
  title = "Have a challenge AI or software could solve?",
  text = "Start with a discovery call. We will define the goal, the options and a practical delivery plan with you.",
  secondary = ctas.proposal,
}: {
  title?: string;
  text?: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby="cta-heading" className="bg-navy text-paper">
      <Container className="flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between md:py-16">
        <div className="max-w-2xl">
          <h2 id="cta-heading" className="text-title font-semibold">
            {title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-blue-100">{text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <ButtonLink href={ctas.discovery.href} variant="inverse">
            {ctas.discovery.label}
          </ButtonLink>
          <ButtonLink href={secondary.href} variant="inverse-outline">
            {secondary.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
