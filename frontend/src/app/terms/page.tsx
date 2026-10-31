import Link from "next/link";
import { LegalPage, Required } from "@/components/LegalPage";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "Terms governing the use of the Kiaratech Solutions website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="Draft, not yet published">
      <h2>About these terms</h2>
      <p>
        These terms govern your use of this website, operated by {site.legalName}. Registered office and company number:{" "}
        <Required>to be supplied</Required>. By using the website you accept these terms.
      </p>

      <h2>Use of the website</h2>
      <p>
        You may view and share content for your own information. You must not misuse the website, attempt to gain unauthorised
        access to it, or introduce malicious code.
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        Website content, including text, design and the Kiaratech logo, belongs to {site.legalName} or its licensors. Content is
        provided for general information and does not form an offer or professional advice.
      </p>

      <h2>Liability</h2>
      <p>
        We aim to keep information accurate but do not guarantee it is complete or current. Liability terms:{" "}
        <Required>to be drafted by legal counsel</Required>.
      </p>

      <h2>Privacy</h2>
      <p>
        Our use of personal data is described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>
        <Required>Governing law and jurisdiction to be confirmed</Required>.
      </p>
    </LegalPage>
  );
}
