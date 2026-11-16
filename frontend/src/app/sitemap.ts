import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/caseStudies";
import { articles } from "@/content/insights";
import { jobs } from "@/content/jobs";
import { services } from "@/content/services";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/industries",
    "/case-studies",
    ...caseStudies.map((c) => `/case-studies/${c.slug}`),
    "/about",
    "/careers",
    ...jobs.map((j) => `/careers/${j.id}`),
    "/insights",
    ...articles.map((a) => `/insights/${a.slug}`),
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];
  return paths.map((path) => ({ url: new URL(path, site.url).toString() }));
}
