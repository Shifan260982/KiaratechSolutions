import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/LegalPage";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Kiaratech Solutions collects, uses and protects personal data, and the rights you have under UK GDPR.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal data we collect through this website, why we collect it, who we share it with and the
        rights you have. It applies to visitors, people who contact us and people who apply for jobs with us.
      </p>

      <h2>1. Who we are</h2>
      <p>
        {site.legalName} (&quot;Kiaratech&quot;, &quot;we&quot;, &quot;us&quot;) is the controller of the personal data described in this
        policy. We handle personal data in line with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act
        2018.
      </p>
      <CompanyDetails />

      <h2>2. Information we collect</h2>
      <p>
        <strong>Information you give us.</strong>
      </p>
      <ul>
        <li>
          Enquiries made through our contact form or sent to {site.businessEmail}: your first and last name, email address, company,
          topic and message.
        </li>
        <li>
          Job applications made through our careers pages or sent to {site.careersEmail}: your name, email address, phone number,
          current location, LinkedIn profile (if you add one), your CV and cover note, and the details a role asks for, such as total
          and relevant experience, current and expected salary (CTC), notice period, team size managed, primary technology or
          certifications.
        </li>
      </ul>
      <p>
        <strong>Information collected automatically.</strong>
      </p>
      <ul>
        <li>
          Technical data needed to deliver and secure the website, such as your IP address, browser type and the pages requested,
          held in server logs by our hosting providers.
        </li>
        <li>
          When you submit a form, a security check by Cloudflare Turnstile uses technical signals from your browser to confirm the
          submission comes from a person, not an automated bot.
        </li>
      </ul>
      <p>
        We do not use analytics or advertising cookies. See our <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>3. How we use your information and our lawful basis</h2>
      <ul>
        <li>
          <strong>To respond to enquiries</strong> and discuss how we could work together: our legitimate interests, or steps you ask
          us to take before entering into a contract.
        </li>
        <li>
          <strong>To assess job applications</strong> and run our recruitment process: steps taken at your request before an
          employment contract, and our legitimate interests in recruiting suitable people.
        </li>
        <li>
          <strong>To protect our forms and website</strong> from spam, abuse and malicious files, including scanning uploaded CVs for
          malware: our legitimate interests in keeping our systems and your data secure.
        </li>
        <li>
          <strong>To meet legal obligations</strong>, such as keeping records required by law or responding to lawful requests from
          authorities.
        </li>
      </ul>
      <p>We do not sell your personal data, and we do not use it for automated decision-making or profiling.</p>

      <h2>4. Who we share your information with</h2>
      <p>Only the teams who need it can see your data: enquiries go to our business development team and applications to our HR team. We also use trusted service providers who process data on our behalf, under contract and only on our instructions:</p>
      <ul>
        <li>Microsoft (Microsoft 365 and Azure), which stores form submissions and CVs and sends our notification emails.</li>
        <li>Cloudflare, which provides the Turnstile security check on our forms.</li>
        <li>Vercel, which hosts this website.</li>
      </ul>
      <p>
        We may also share information where the law requires it, or with a buyer or successor if our business is reorganised or sold.
      </p>

      <h2>5. International transfers</h2>
      <p>
        We have offices in the United Kingdom and India, and some of our service providers operate outside the UK. Where your data is
        transferred outside the UK, we make sure it is protected by the safeguards UK data protection law requires.
      </p>

      <h2>6. How long we keep your information</h2>
      <p>
        We keep enquiries and job applications, including CVs, for 6 months from the date we receive them, and then delete them
        securely. We keep data for longer only where the law requires us to.
      </p>

      <h2>7. How we keep your information secure</h2>
      <p>
        We are certified to ISO/IEC 27001:2022 for information security management. Data is encrypted in transit, access is limited to
        the people who need it, form submissions are checked for spam and abuse, and uploaded CVs are scanned for malware before they
        are stored. No method of transmission or storage is completely secure, but we work to protect your data and review our
        controls regularly.
      </p>

      <h2>8. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>ask us to correct data that is inaccurate or incomplete;</li>
        <li>ask us to erase your data;</li>
        <li>ask us to restrict how we use your data;</li>
        <li>object to processing based on our legitimate interests;</li>
        <li>receive your data in a portable format;</li>
        <li>withdraw your consent at any time, where we rely on consent.</li>
      </ul>
      <p>
        To exercise any of these rights, email <a href={`mailto:${site.dataProtectionEmail}`}>{site.dataProtectionEmail}</a>. We may
        need to confirm your identity first, and we will respond within one month. If you are unhappy with how we handle your data,
        you can complain to the Information Commissioner&apos;s Office (ICO) at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
          ico.org.uk
        </a>
        , although we would appreciate the chance to resolve your concern first.
      </p>

      <h2>9. Children</h2>
      <p>
        This website is intended for businesses and job seekers. It is not aimed at children, and we do not knowingly collect personal
        data from anyone under 16.
      </p>

      <h2>10. Links to other websites</h2>
      <p>
        Our website links to other sites, such as LinkedIn. We are not responsible for their privacy practices, so please read their
        policies.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>We may update this policy from time to time. The latest version is always on this page, with the date it was last updated.</p>

      <h2>12. Contact us</h2>
      <p>
        For privacy questions or requests, contact our data protection contact at{" "}
        <a href={`mailto:${site.dataProtectionEmail}`}>{site.dataProtectionEmail}</a>. For general enquiries, email{" "}
        <a href={`mailto:${site.businessEmail}`}>{site.businessEmail}</a>.
      </p>
    </LegalPage>
  );
}
