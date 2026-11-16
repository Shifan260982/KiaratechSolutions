import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/caseStudies";
import { jobs } from "@/content/jobs";
import { services } from "@/content/services";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/case-studies",
    ...caseStudies.map((c) => `/case-studies/${c.slug}`),
    "/about",
    "/careers",
    ...jobs.map((j) => `/careers/${j.id}`),
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];
  return paths.map((path) => ({ url: new URL(path, site.url).toString() }));
}
