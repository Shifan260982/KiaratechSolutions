import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Container } from "@/components/ui";
import { offices, site, whatsappHref } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Let's connect. Tell us the outcome you need and we will come back to you. Offices in London and Navi Mumbai.",
  path: "/contact",
});

const steps = [
  { title: "Share your goal", text: "Tell us the outcome you need and the systems involved." },
  { title: "Discovery call", text: "We clarify scope, data, risks and success criteria with your team." },
  { title: "Clear next step", text: "You receive recommended options and a delivery approach." },
];

export default function ContactPage() {
  const whatsapp = whatsappHref("Hello Kiaratech, I would like to discuss a project.");

  return (
    <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <h1 className="text-display font-semibold">Let&apos;s Connect</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-strong">
          Tell us what you want to achieve and we will come back to you with a practical next step.
        </p>
        <div className="mt-10">
          <EnquiryForm />
        </div>
      </div>

      <aside className="space-y-10 lg:col-span-5 lg:border-l lg:border-line lg:pl-12">
        <section aria-labelledby="process-heading">
          <h2 id="process-heading" className="text-heading font-semibold">
            What happens next
          </h2>
          <ol className="mt-4 space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2rem_1fr]">
                <span className="text-sm font-semibold tabular-nums text-muted-strong">{i + 1}</span>
                <span>
                  <span className="block font-medium">{s.title}</span>
                  <span className="block leading-relaxed text-muted-strong">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {whatsapp && (
          <section aria-labelledby="whatsapp-heading" className="border-t border-line pt-8">
            <h2 id="whatsapp-heading" className="text-heading font-semibold">
              Prefer to message?
            </h2>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium underline underline-offset-4">
              Chat with us on WhatsApp
            </a>
          </section>
        )}

        <section aria-labelledby="email-heading" className="border-t border-line pt-8">
          <h2 id="email-heading" className="text-heading font-semibold">
            Prefer email?
          </h2>
          <p className="mt-2 leading-relaxed text-muted-strong">
            Write to us at{" "}
            <a href={`mailto:${site.businessEmail}`} className="font-medium text-blue-deep underline underline-offset-4">
              {site.businessEmail}
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="offices-heading" className="border-t border-line pt-8">
          <h2 id="offices-heading" className="text-heading font-semibold">
            Offices
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {offices.map((o) => (
              <address key={o.region} className="not-italic leading-relaxed text-muted-strong">
                <span className="block font-medium text-ink">{o.region}</span>
                {o.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ))}
          </div>
        </section>

        <section aria-labelledby="careers-contact-heading" className="border-t border-line pt-8">
          <h2 id="careers-contact-heading" className="text-heading font-semibold">
            Looking for a job?
          </h2>
          <p className="mt-2 leading-relaxed text-muted-strong">
            Send your CV to{" "}
            <a href={`mailto:${site.careersEmail}`} className="text-ink underline underline-offset-4">
              {site.careersEmail}
            </a>{" "}
            or see current openings on our{" "}
            <Link href="/careers" className="text-ink underline underline-offset-4">
              careers page
            </Link>
            .
          </p>
        </section>
      </aside>
    </Container>
  );
}
