import type { Metadata } from "next";
import { site } from "@/content/site";

// Next replaces, not merges, a page's openGraph object, so every page repeats these site-wide fields.
export const baseOpenGraph = {
  type: "website",
  siteName: site.name,
  locale: "en_GB",
  images: [{ url: "/brand/kiaratech-logo.png", width: 1396, height: 274, alt: "Kiaratech Solutions" }],
} satisfies Metadata["openGraph"];

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description, url: path },
  };
}
