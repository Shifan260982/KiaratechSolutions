import type { ReactNode } from "react";
import { Container, Placeholder } from "./ui";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-[68ch]">
        <h1 className="text-display font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-strong">Last updated: {updated}</p>
        <Placeholder className="mt-6">
          draft for review. This policy must be reviewed and approved by a qualified legal or compliance owner, against UK GDPR and the
          Data Protection Act 2018, before launch.
        </Placeholder>
        <div className="prose-legal mt-8">{children}</div>
      </div>
    </Container>
  );
}

/** Inline marker for a legal detail that must be supplied before publication. */
export function Required({ children }: { children: ReactNode }) {
  return <span className="rounded-sm border border-dashed border-line-strong px-1 text-ink">[{children}]</span>;
}
