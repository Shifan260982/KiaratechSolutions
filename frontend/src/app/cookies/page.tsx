import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How the Kiaratech Solutions website uses cookies and similar technologies.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files a website stores on your device. Similar technologies, such as local storage, work in a comparable
        way. In this policy, &quot;cookies&quot; covers both.
      </p>

      <h2>2. How we use cookies</h2>
      <p>
        We keep cookies to a minimum. This website does not use analytics, advertising or social media tracking cookies, so we do not
        show a cookie consent banner. The only technology of this kind we use is strictly necessary to protect our forms from abuse,
        and the law allows it without consent.
      </p>

      <h2>3. Cookies we use</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Provider</th>
              <th scope="col">Purpose</th>
              <th scope="col">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Turnstile security check</td>
              <td>Cloudflare</td>
              <td>
                Runs only on the contact form and job application pages, to confirm a submission comes from a person rather than a bot.
              </td>
              <td>Strictly necessary</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The office maps, videos and fonts on this website are served from our own site, so they do not set third-party cookies.
      </p>

      <h2>4. Managing cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. If you block the security check, our forms may not be able to accept
        your submission; you can still email us at <a href={`mailto:${site.businessEmail}`}>{site.businessEmail}</a> or{" "}
        <a href={`mailto:${site.careersEmail}`}>{site.careersEmail}</a>.
      </p>

      <h2>5. Other websites</h2>
      <p>
        Links to other services, such as LinkedIn or WhatsApp, take you to sites that set their own cookies under their own policies.
      </p>

      <h2>6. Changes to this policy</h2>
      <p>
        If we ever add analytics or other non-essential cookies, we will update this policy and ask for your consent before setting
        them, and you will be able to change your choice at any time.
      </p>

      <h2>7. Contact us</h2>
      <p>
        Questions about cookies or your data can be sent to{" "}
        <a href={`mailto:${site.dataProtectionEmail}`}>{site.dataProtectionEmail}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
