import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/LegalPage";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "Terms governing the use of the Kiaratech Solutions website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <h2>1. About us</h2>
      <p>This website is operated by {site.legalName} (&quot;Kiaratech&quot;, &quot;we&quot;, &quot;us&quot;).</p>
      <CompanyDetails />

      <h2>2. Acceptance of these terms</h2>
      <p>By using this website you agree to these terms. If you do not agree, please do not use the website.</p>

      <h2>3. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The latest version is always on this page, and continuing to use the website
        after a change means you accept the updated terms.
      </p>

      <h2>4. Using the website</h2>
      <p>You may use this website for lawful purposes only. You must not:</p>
      <ul>
        <li>use it in any way that breaks the law or infringes anyone&apos;s rights;</li>
        <li>try to gain unauthorised access to the website, its servers or any connected system;</li>
        <li>introduce viruses, malware or other harmful material, including through our forms or file uploads;</li>
        <li>submit false, misleading or automated enquiries or job applications;</li>
        <li>interfere with the website&apos;s operation, for example by overloading it.</li>
      </ul>
      <p>We may suspend or restrict access to the website, or any part of it, at any time.</p>

      <h2>5. Intellectual property</h2>
      <p>
        The content of this website, including text, images, designs and the Kiaratech name and logo, belongs to {site.legalName} or
        its licensors. You may view it and share links to it for your own information, but you may not copy, reproduce or reuse it for
        any other purpose without our written permission.
      </p>

      <h2>6. Information on this website</h2>
      <p>
        Content on this website is for general information only. It does not form an offer, a contract or professional advice. We work
        to keep it accurate and up to date, but we do not guarantee that it is complete, current or free from errors. Product
        visuals on this website show example interfaces, not live client data.
      </p>

      <h2>7. Links to other websites</h2>
      <p>
        Links to other websites, such as LinkedIn, are provided for convenience. We have no control over those sites and are not
        responsible for their content, availability or privacy practices.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        The website is provided free of charge on an &quot;as is&quot; and &quot;as available&quot; basis. To the extent permitted by
        law, we are not liable for any loss or damage arising from your use of, or inability to use, the website or its content,
        including indirect or consequential loss, loss of data, profits or business opportunity.
      </p>
      <p>
        Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud or
        fraudulent misrepresentation, or for any other liability that cannot be limited or excluded by law.
      </p>

      <h2>9. Privacy and cookies</h2>
      <p>
        How we use personal data is explained in our <Link href="/privacy">Privacy Policy</Link>, and our use of cookies in our{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction over
        any dispute arising from them or from your use of the website.
      </p>

      <h2>11. Contact us</h2>
      <p>
        Questions about these terms can be sent to <a href={`mailto:${site.businessEmail}`}>{site.businessEmail}</a>.
      </p>
    </LegalPage>
  );
}
