import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Kiaratech Solutions | AI and Software Engineering Partner",
    template: "%s | Kiaratech Solutions",
  },
  description: site.positioning,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    images: [{ url: "/brand/kiaratech-logo.png", width: 480, height: 172, alt: "Kiaratech Solutions" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${schibsted.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
