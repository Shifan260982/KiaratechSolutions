import type { ReactNode } from "react";
import { ctas } from "@/content/site";
import { ButtonLink, Container } from "./ui";

export function CtaBand({
  title = "Have a challenge AI or software could solve?",
  text = "Start with a discovery call. We will define the goal, the options and a practical delivery plan with you.",
  children,
}: {
  title?: string;
  text?: string;
  /** Extra content shown below the call to action, inside the same band. */
  children?: ReactNode;
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
        <ButtonLink href={ctas.discovery.href} variant="inverse" className="shrink-0">
          {ctas.discovery.label}
        </ButtonLink>
      </Container>
      {children && <Container className="border-t border-white/15 py-10 md:py-12">{children}</Container>}
    </section>
  );
}
