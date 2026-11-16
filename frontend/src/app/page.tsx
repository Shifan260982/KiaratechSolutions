import { AboutGreeting } from "@/components/AboutGreeting";
import { EnquiryForm } from "@/components/EnquiryForm";
import { HeroSlider } from "@/components/HeroSlider";
import { ProjectSlider } from "@/components/ProjectSlider";
import { ServiceCard } from "@/components/ServiceCard";
import { Container, Section, SectionHeading, TextLink } from "@/components/ui";
import { featuredProjects } from "@/content/caseStudies";
import { industries } from "@/content/industries";
import { services } from "@/content/services";
import { offices } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      <AboutGreeting />

      <Section aria-labelledby="services-heading" id="services">
        <SectionHeading
          id="services-heading"
          title="Our capabilities"
          intro="From analysis and architecture to development, testing, DevOps and long-term support."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((s) => (
            <li key={s.slug} className="flex">
              <ServiceCard service={s} />
            </li>
          ))}
        </ul>
      </Section>

      <section aria-labelledby="industries-heading" className="bg-paper py-14 md:py-20">
        <Container>
          <SectionHeading
            id="industries-heading"
            title="Sectors we serve"
            action={<TextLink href="/industries">All sectors</TextLink>}
          />
          {/* An open hairline grid, not boxed cards: these are not links, so nothing here moves or lights up on hover. */}
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {industries.map((i) => (
              <li key={i.name} className="bg-paper p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-navy sm:text-base">{i.name}</h3>
                <p className="mt-1.5 hidden text-sm leading-relaxed text-muted-strong sm:block">{i.focus}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ProjectSlider projects={featuredProjects} />

      <Section aria-labelledby="contact-heading" id="contact">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="contact-heading" className="text-display font-bold text-navy">
              Let&apos;s Connect
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-strong">
              Tell us the outcome you need. We will clarify scope, risks and success criteria with you, then recommend a practical
              delivery approach.
            </p>
            <div className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-1">
              {offices.map((o) => (
                <address key={o.region} className="not-italic leading-relaxed text-muted-strong">
                  <span className="block font-semibold text-navy">{o.region}</span>
                  {o.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_60px_-40px_rgb(2_33_98/0.45)] sm:p-8 lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </Section>
    </>
  );
}
