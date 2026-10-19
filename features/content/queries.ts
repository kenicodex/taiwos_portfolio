import "server-only";
import { cacheTag } from "next/cache";
import { alias } from "drizzle-orm/pg-core";
import type { Schema } from "yup";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentDocuments, contentItems, experiences, media, projects, siteSettings, skills } from "@/db/schema";
import { PUBLIC_CONTENT_TAG } from "@/features/pages/service";
import { FEATURED, PROJECTS } from "./defaults/projects";
import { JOBS } from "./defaults/experience";
import { COLLECTIONS, DOCUMENTS, getCollectionDefinition, getDocumentDefinition } from "./registry";
import { DESIGN_TOOLS, RESEARCH_TOOLS, COLLABORATION_TOOLS } from "./defaults/about";
import { HEADER_NAV, FOOTER_NAV, PROFILE, SOCIAL_LINKS } from "./defaults/site";
import { CONTACT_EMAIL } from "./defaults/contact";
import { mapExperienceRow, mapProjectRow, groupTools } from "./mappers";
import { mergeWithDefaults, resolveValue, withFallback } from "./resolve";

// Every reader here returns stored content when it is valid, and the hardcoded default otherwise.
// Pages call these and never import the defaults directly.

type DocumentDef = (typeof DOCUMENTS)[number];
export type DocumentKey = DocumentDef["key"];
export type DocumentValue<K extends DocumentKey> = Extract<DocumentDef, { key: K }>["defaults"];

type CollectionDef = (typeof COLLECTIONS)[number];
export type CollectionName = CollectionDef["name"];
export type CollectionItem<N extends CollectionName> = Extract<CollectionDef, { name: N }>["defaults"][number];

/** One singleton section of copy, merged field by field over its default. */
export async function getDocument<K extends DocumentKey>(key: K): Promise<DocumentValue<K>> {
  "use cache";
  cacheTag(`content:${key}`);
  const definition = getDocumentDefinition(key);
  if (!definition) throw new Error(`Unknown content document: ${key}`);
  const fallback = definition.defaults as DocumentValue<K>;

  return withFallback(fallback, async () => {
    const [row] = await db
      .select({ data: contentDocuments.data })
      .from(contentDocuments)
      .where(eq(contentDocuments.key, key))
      .limit(1);
    const merged = mergeWithDefaults(fallback as Record<string, unknown>, row?.data as Record<string, unknown> | undefined);
    return resolveValue(fallback, merged, definition.schema as unknown as Schema<DocumentValue<K>>) as DocumentValue<K>;
  });
}

/**
 * An ordered list. With no rows saved, the defaults are shown. Once any row exists, the saved rows
 * are used, so removing every item in the admin hides the list instead of bringing the defaults back.
 * Rows that fail validation are skipped.
 */
export async function getCollection<N extends CollectionName>(name: N): Promise<CollectionItem<N>[]> {
  "use cache";
  cacheTag(`collection:${name}`);
  const definition = getCollectionDefinition(name);
  if (!definition) throw new Error(`Unknown content collection: ${name}`);
  const fallback = definition.defaults as CollectionItem<N>[];

  return withFallback(fallback, async () => {
    const rows = await db
      .select({ data: contentItems.data, visible: contentItems.visible })
      .from(contentItems)
      .where(eq(contentItems.collection, name))
      .orderBy(asc(contentItems.displayOrder));
    if (rows.length === 0) return fallback;

    const items: CollectionItem<N>[] = [];
    for (const row of rows) {
      if (!row.visible) continue;
      try {
        items.push(definition.itemSchema.validateSync(row.data, { stripUnknown: true }) as CollectionItem<N>);
      } catch {
        console.warn(`content: skipped an invalid item in ${name}`);
      }
    }
    return items;
  });
}

export type SiteProfile = {
  name: string;
  role: string;
  initials: string;
  location: string;
  avatarSrc: string;
  resumeHref: string;
  contactEmail: string;
  phone: string;
  availability: string;
  copyrightText: string;
  headerNav: typeof HEADER_NAV;
  footerNav: typeof FOOTER_NAV;
  socialLinks: typeof SOCIAL_LINKS;
};

/** The hardcoded profile. Also used while the database read is pending, so the shell never waits on it. */
export const SITE_FALLBACK: SiteProfile = {
  name: PROFILE.name,
  role: PROFILE.role,
  initials: PROFILE.initials,
  location: PROFILE.location,
  avatarSrc: PROFILE.avatarSrc,
  resumeHref: PROFILE.resumeHref,
  contactEmail: CONTACT_EMAIL,
  phone: "",
  availability: "",
  copyrightText: "",
  headerNav: HEADER_NAV,
  footerNav: FOOTER_NAV,
  socialLinks: SOCIAL_LINKS,
};

/** Profile, navigation and social links from site_settings, falling back to the hardcoded profile. */
export async function getSiteProfile(): Promise<SiteProfile> {
  "use cache";
  cacheTag("site-settings");

  return withFallback(SITE_FALLBACK, async () => {
    const profileImage = alias(media, "profile_image");
    const resumeFile = alias(media, "resume_file");
    const [row] = await db
      .select({
        ownerName: siteSettings.ownerName,
        role: siteSettings.role,
        initials: siteSettings.initials,
        location: siteSettings.location,
        contactEmail: siteSettings.contactEmail,
        phone: siteSettings.phone,
        availability: siteSettings.availability,
        copyrightText: siteSettings.copyrightText,
        headerNav: siteSettings.headerNav,
        footerNav: siteSettings.footerNav,
        socialLinks: siteSettings.socialLinks,
        avatarUrl: profileImage.url,
        resumeUrl: resumeFile.url,
      })
      .from(siteSettings)
      .leftJoin(profileImage, eq(siteSettings.profileImageId, profileImage.id))
      .leftJoin(resumeFile, eq(siteSettings.resumeMediaId, resumeFile.id))
      .limit(1);
    if (!row) return SITE_FALLBACK;

    const stored = {
      name: row.ownerName,
      role: row.role,
      initials: row.initials,
      location: row.location,
      avatarSrc: row.avatarUrl ?? "",
      resumeHref: row.resumeUrl ?? "",
      contactEmail: row.contactEmail,
      phone: row.phone,
      availability: row.availability,
      copyrightText: row.copyrightText,
    };
    const flat = mergeWithDefaults(
      {
        name: SITE_FALLBACK.name,
        role: SITE_FALLBACK.role,
        initials: SITE_FALLBACK.initials,
        location: SITE_FALLBACK.location,
        avatarSrc: SITE_FALLBACK.avatarSrc,
        resumeHref: SITE_FALLBACK.resumeHref,
        contactEmail: SITE_FALLBACK.contactEmail,
        phone: SITE_FALLBACK.phone,
        availability: SITE_FALLBACK.availability,
        copyrightText: SITE_FALLBACK.copyrightText,
      },
      stored,
    );

    const headerNav = row.headerNav as SiteProfile["headerNav"];
    const footerNav = row.footerNav as SiteProfile["footerNav"];
    const socialLinks = row.socialLinks as SiteProfile["socialLinks"];
    return {
      ...flat,
      headerNav: headerNav.length > 0 ? headerNav : SITE_FALLBACK.headerNav,
      footerNav: footerNav.length > 0 ? footerNav : SITE_FALLBACK.footerNav,
      socialLinks: socialLinks.length > 0 ? socialLinks : SITE_FALLBACK.socialLinks,
    };
  });
}

export type ProjectCard = (typeof PROJECTS)[number] & { role?: string; duration?: string };

/** Featured project plus the rest of the published projects. Falls back to the default page when none are published. */
export async function getProjectsPage(): Promise<{ featured: ProjectCard; list: ProjectCard[] }> {
  "use cache";
  cacheTag("projects", PUBLIC_CONTENT_TAG);

  return withFallback({ featured: FEATURED, list: PROJECTS }, async () => {
    const rows = await db
      .select({
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        summary: projects.summary,
        role: projects.role,
        duration: projects.duration,
        placeholderColor: projects.placeholderColor,
        caseStudyUrl: projects.caseStudyUrl,
        featured: projects.featured,
        coverSrc: media.url,
        coverWidth: media.width,
        coverHeight: media.height,
      })
      .from(projects)
      .leftJoin(media, eq(projects.coverImageId, media.id))
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.displayOrder));
    if (rows.length === 0) return { featured: FEATURED, list: PROJECTS };

    const featuredRow = rows.find((row) => row.featured) ?? rows[0];
    const featured = mapProjectRow(featuredRow) as ProjectCard;
    const list = rows.filter((row) => row !== featuredRow).map((row) => mapProjectRow(row) as ProjectCard);
    return { featured, list };
  });
}

/** Published work history, newest first as ordered by the admin. Falls back to the default jobs. */
export async function getExperiences() {
  "use cache";
  cacheTag("experiences", PUBLIC_CONTENT_TAG);

  return withFallback(JOBS, async () => {
    const rows = await db
      .select({
        company: experiences.company,
        role: experiences.role,
        location: experiences.location,
        periodLabel: experiences.periodLabel,
        startDate: experiences.startDate,
        endDate: experiences.endDate,
        isCurrent: experiences.isCurrent,
        achievements: experiences.achievements,
      })
      .from(experiences)
      .where(eq(experiences.status, "published"))
      .orderBy(asc(experiences.displayOrder));
    if (rows.length === 0) return JOBS;
    return rows.map(mapExperienceRow);
  });
}

/** Design, research and collaboration tools for the About page. Falls back to the defaults when no skills are visible. */
export async function getTools() {
  "use cache";
  cacheTag("skills", PUBLIC_CONTENT_TAG);

  const fallback = { design: DESIGN_TOOLS, research: RESEARCH_TOOLS, collaboration: COLLABORATION_TOOLS };
  return withFallback(fallback, async () => {
    const rows = await db
      .select({ name: skills.name, category: skills.category, iconSrc: media.url })
      .from(skills)
      .leftJoin(media, eq(skills.iconMediaId, media.id))
      .where(and(eq(skills.visible, true)))
      .orderBy(asc(skills.displayOrder));
    return groupTools(rows) ?? fallback;
  });
}

export type CaseStudy = {
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  role: string;
  duration: string;
  caseStudyUrl: string | null;
  coverSrc: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
};

/** One published project for its case study page. Null when it is missing or unpublished. */
export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  "use cache";
  cacheTag("projects", PUBLIC_CONTENT_TAG);

  return withFallback(null, async () => {
    const [row] = await db
      .select({
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        summary: projects.summary,
        description: projects.description,
        role: projects.role,
        duration: projects.duration,
        caseStudyUrl: projects.caseStudyUrl,
        coverSrc: media.url,
        coverWidth: media.width,
        coverHeight: media.height,
      })
      .from(projects)
      .leftJoin(media, eq(projects.coverImageId, media.id))
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
      .limit(1);
    return row ?? null;
  });
}
