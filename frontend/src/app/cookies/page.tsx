import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How the Kiaratech Solutions website uses cookies and similar technologies.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="Draft, not yet published">
      <h2>Our current use of cookies</h2>
      <p>
        This website does not currently set analytics, advertising or other non-essential cookies, so no consent banner is shown.
      </p>

      <h2>If this changes</h2>
      <p>
        If we add analytics or other non-essential cookies, we will ask for your consent before setting them, list each cookie here
        with its purpose and duration, and let you change your choice at any time.
      </p>

      <h2>Third-party links</h2>
      <p>
        Links to external services, such as LinkedIn or WhatsApp, take you to sites with their own cookie policies.
      </p>
      <p>
        The office maps on our Our Story page are provided by Google Maps and load when you view that part of the page. When they
        load, Google may set cookies under its own policy.
      </p>
    </LegalPage>
  );
}
