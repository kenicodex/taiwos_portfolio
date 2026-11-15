import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { listPublishedSlugs } from "@/features/pages/service";
import { checkSlug } from "@/features/pages/slug";
import { CASE_STUDIES } from "@/features/site/case-studies";
import { env } from "@/lib/env";

const STATIC_PATHS = ["/about", "/projects", "/experience", "/contact"];

// Reads published pages from the database, so it is rendered per request. The query itself is cached.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const pages = await listPublishedSlugs();
  const cmsPages = pages
    .filter((page) => checkSlug(page.slug).valid)
    .map((page) => ({ url: `${base}/${page.slug}`, lastModified: page.updatedAt }));

  return [
    { url: `${base}/`, priority: 1 },
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path}` })),
    ...CASE_STUDIES.map((study) => ({ url: `${base}/projects/${study.slug}` })),
    ...cmsPages,
  ];
}
