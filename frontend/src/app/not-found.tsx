import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-20 md:py-28">
      <h1 className="text-display font-semibold">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-strong">
        The page you are looking for has moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Go to the homepage</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  );
}
