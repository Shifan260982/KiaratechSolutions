import Link from "next/link";
import { LegalPage, Required } from "@/components/LegalPage";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Kiaratech Solutions collects, uses and protects personal data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Draft, not yet published">
      <h2>Who we are</h2>
      <p>
        {site.legalName} (&quot;Kiaratech&quot;, &quot;we&quot;) is the controller of personal data collected through this website. Company
        registration number: <Required>to be supplied</Required>. ICO registration number: <Required>to be supplied</Required>. Data
        protection contact: <Required>to be supplied</Required>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Details you submit through our enquiry form or send to {site.businessEmail}: name, email, company, topic and message.</li>
        <li>Job applications and CVs you submit through our careers pages or send to {site.careersEmail}.</li>
        <li>Technical data needed to deliver the website securely, such as server logs held by our hosting provider.</li>
      </ul>

      <h2>How we use it and our lawful basis</h2>
      <ul>
        <li>To respond to enquiries and provide proposals: legitimate interests, or steps taken at your request before a contract.</li>
        <li>To assess job applications: legitimate interests and steps taken before an employment contract.</li>
        <li>To operate and secure the website: legitimate interests.</li>
      </ul>

      <h2>Sharing and international transfers</h2>
      <p>
        We share data only with service providers who support our operations, such as website hosting. As we operate in the UK and
        India, data may be transferred between our offices under appropriate safeguards: <Required>transfer mechanism to be confirmed</Required>.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Retention periods: <Required>to be confirmed for enquiries and applications</Required>.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct, erase or restrict your personal data, object to processing, and request data portability.
        You can also complain to the Information Commissioner&apos;s Office (ico.org.uk).
      </p>

      <h2>Cookies</h2>
      <p>
        See our <Link href="/cookies">Cookie Policy</Link>.
      </p>
    </LegalPage>
  );
}
