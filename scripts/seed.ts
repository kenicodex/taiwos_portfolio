// Brings the database in line with the frontend. Safe to re-run:
//  - site_settings: brand colour (theme configuration), other saved settings are kept
//  - projects: the site's project list and each case study body, upserted by slug. Projects that are
//    no longer in the frontend list are moved to draft, not deleted.
//  - media: every image the projects and case studies use, registered from its file in public/
//  - content documents and collections: reset to the frontend defaults (admin edits to them are replaced)
//  - home page: a new version is added and published (earlier versions are kept)
// Usage: npm run db:seed   (reads DATABASE_URL from the environment)
import { statSync } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { contentDocuments, contentItems, media, pageVersions, pages, projects, siteSettings } from "../db/schema";
import { validatePageContent } from "../features/page-builder/blocks/schemas";
import { createBlock } from "../features/page-builder/blocks/defaults";
import type { Block } from "../features/page-builder/blocks/types";
import { COLLECTIONS, DOCUMENTS } from "../features/content/registry";
import { CASE_STUDIES } from "../features/site/case-studies";
import { FEATURED, PROJECTS, type Project } from "../features/site/projects";
import { DEFAULT_PRIMARY, themeFromPrimary } from "../features/site/theme";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_PATH = /^\/[A-Za-z0-9 ._\/-]+\.(png|webp|jpe?g|svg)$/i;
const MIME: Record<string, string> = { png: "image/png", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };

type ImageRef = { src: string; width: number | null; height: number | null; alt: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Project slug from its frontend href, or from the title for projects that link elsewhere. */
function slugFor(project: Project) {
  return project.href.startsWith("/projects/") ? project.href.slice("/projects/".length) : slugify(project.title);
}

/** Every public image path a case study uses, with the size and alt text it was given. */
function collectImages(value: unknown, out: Map<string, ImageRef>, alt = "") {
  if (typeof value === "string") {
    if (IMAGE_PATH.test(value) && value.startsWith("/projects/") && !out.has(value)) {
      out.set(value, { src: value, width: null, height: null, alt });
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImages(item, out, alt);
    return;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.src === "string" && IMAGE_PATH.test(record.src)) {
      const width = typeof record.width === "number" ? record.width : null;
      const height = typeof record.height === "number" ? record.height : null;
      const label = typeof record.alt === "string" ? record.alt : alt;
      const existing = out.get(record.src);
      out.set(record.src, { src: record.src, width: width ?? existing?.width ?? null, height: height ?? existing?.height ?? null, alt: label });
    }
    for (const [key, item] of Object.entries(record)) {
      if (key !== "src") collectImages(item, out, alt);
    }
  }
}

function fileSize(src: string) {
  try {
    return statSync(path.join(PUBLIC_DIR, src)).size;
  } catch {
    throw new Error(`missing image file: public${src}`);
  }
}

function mimeFor(src: string) {
  return MIME[src.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("seed: DATABASE_URL is not set");
    process.exit(1);
  }

  // Validate the home page and every frontend default before touching the database.
  const homeContent = await validatePageContent({ schemaVersion: 1, blocks: HOME_BLOCKS });
  for (const definition of DOCUMENTS) definition.schema.validateSync(definition.defaults);
  for (const definition of COLLECTIONS) {
    for (const item of definition.defaults) definition.itemSchema.validateSync(item);
  }
  const theme = themeFromPrimary(DEFAULT_PRIMARY);

  const allProjects = [FEATURED, ...PROJECTS];
  const slugs = allProjects.map(slugFor);

  // Image files used by the projects and their case studies.
  const images = new Map<string, ImageRef>();
  for (const project of allProjects) {
    if (project.cover) images.set(project.cover.src, { src: project.cover.src, width: project.cover.width, height: project.cover.height, alt: `${project.title} cover` });
  }
  for (const study of CASE_STUDIES) collectImages(study, images);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  try {
    await db.transaction(async (tx) => {
      // Site settings: brand colour only; the rest of the row is kept.
      const [settings] = await tx.select({ id: siteSettings.id }).from(siteSettings).limit(1);
      if (settings) {
        await tx
          .update(siteSettings)
          .set({ themeConfiguration: theme, updatedAt: new Date() })
          .where(eq(siteSettings.id, settings.id));
      } else {
        await tx.insert(siteSettings).values({
          siteTitle: "Taiwo Salaudeen",
          siteDescription: "Product designer portfolio",
          ownerName: "Taiwo Salaudeen",
          themeConfiguration: theme,
        });
      }

      // Media: one row per file, keyed by its public path.
      const mediaIds = new Map<string, string>();
      for (const image of images.values()) {
        const [row] = await tx
          .insert(media)
          .values({
            storageProvider: "local",
            storageKey: `local:${image.src}`,
            url: image.src,
            altText: image.alt,
            mimeType: mimeFor(image.src),
            sizeBytes: fileSize(image.src),
            width: image.width,
            height: image.height,
          })
          .onConflictDoUpdate({
            target: media.storageKey,
            set: { url: image.src, altText: image.alt, mimeType: mimeFor(image.src), sizeBytes: fileSize(image.src), width: image.width, height: image.height },
          })
          .returning({ id: media.id });
        mediaIds.set(image.src, row.id);
      }

      // Projects: the frontend list with each case study body.
      for (const [index, project] of allProjects.entries()) {
        const slug = slugs[index];
        const study = CASE_STUDIES.find((candidate) => candidate.slug === slug) ?? null;
        const coverImageId = project.cover ? mediaIds.get(project.cover.src) ?? null : null;
        const values = {
          title: project.title,
          slug,
          summary: project.summary,
          category: project.category,
          description: study ? study.intro.join("\n\n") : "",
          role: "role" in project ? (project as { role: string }).role : "",
          duration: "duration" in project ? (project as { duration: string }).duration : "",
          placeholderColor: project.placeholder,
          coverImageId,
          caseStudyUrl: project.href.startsWith("/projects/") ? null : project.href,
          caseStudy: study,
          technologies: [],
          featured: index === 0,
          status: "published" as const,
          displayOrder: index,
          updatedAt: new Date(),
        };
        await tx
          .insert(projects)
          .values(values)
          .onConflictDoUpdate({ target: projects.slug, set: values });
      }
      // Projects no longer in the frontend list stay in the database as drafts.
      await tx
        .update(projects)
        .set({ status: "draft", updatedAt: new Date() })
        .where(and(notInArray(projects.slug, slugs), eq(projects.status, "published")));

      // Page copy: documents and collections reset to the frontend defaults.
      const syncedAt = new Date();
      for (const definition of DOCUMENTS) {
        await tx
          .insert(contentDocuments)
          .values({ key: definition.key, data: definition.defaults, updatedAt: syncedAt })
          .onConflictDoUpdate({ target: contentDocuments.key, set: { data: definition.defaults, updatedAt: syncedAt } });
      }
      for (const definition of COLLECTIONS) {
        await tx.delete(contentItems).where(eq(contentItems.collection, definition.name));
        if (definition.defaults.length > 0) {
          await tx.insert(contentItems).values(
            definition.defaults.map((item, index) => ({ collection: definition.name, data: item, displayOrder: index, visible: true })),
          );
        }
      }

      // Home page: add a version and publish it through the same pointers the publish service uses.
      const now = new Date();
      const [home] = await tx.select().from(pages).where(eq(pages.slug, "home"));
      if (!home) {
        const [page] = await tx.insert(pages).values({ title: "Home", slug: "home" }).returning();
        const [version] = await tx
          .insert(pageVersions)
          .values({ pageId: page.id, versionNumber: 1, contentJson: homeContent, publishedAt: now })
          .returning();
        await tx
          .update(pages)
          .set({
            draftVersionId: version.id,
            publishedVersionId: version.id,
            status: "published",
            updatedAt: now,
          })
          .where(eq(pages.id, page.id));
      } else {
        const [{ max }] = await tx
          .select({ max: sql<number>`coalesce(max(${pageVersions.versionNumber}), 0)` })
          .from(pageVersions)
          .where(eq(pageVersions.pageId, home.id));
        const [version] = await tx
          .insert(pageVersions)
          .values({
            pageId: home.id,
            versionNumber: Number(max) + 1,
            contentJson: homeContent,
            publishedAt: now,
          })
          .returning();
        await tx
          .update(pages)
          .set({
            draftVersionId: version.id,
            publishedVersionId: version.id,
            status: "published",
            updatedAt: now,
          })
          .where(eq(pages.id, home.id));
      }
    });

    const documentCount = DOCUMENTS.length;
    const collectionItems = COLLECTIONS.reduce((total, definition) => total + definition.defaults.length, 0);
    console.log(
      `Seeded brand colour ${theme.primary}, ${allProjects.length} projects with ${CASE_STUDIES.length} case studies, ` +
        `${images.size} image files, ${documentCount} content documents, ${collectionItems} collection items and the home page.`,
    );
  } catch (error) {
    console.error("seed:", error instanceof Error ? error.message : "unknown error");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

// Home page blocks.
const HOME_BLOCKS: Block[] = [
  {
    ...createBlock("hero", "hero-home"),
    config: {
      ...createBlock("hero", "hero-home").config,
      imageSrc: "/hero/headshot.png",
      imageAlt: "Portrait of Taiwo Salaudeen",
    },
  },
  {
    ...createBlock("statistics", "stats-home"),
    config: {
      items: [
        {
          value: "5+",
          label: "Years of Experience",
          description: "Designing digital products",
          icon: "briefcase",
        },
        { value: "15+", label: "Products Designed", description: "Web, Mobile & Dashboard", icon: "layers" },
        {
          value: "6",
          label: "Industries",
          description: "Fintech, AI, Health, E-commerce, Gaming & more",
          icon: "globe",
        },
        {
          value: "250+",
          label: "Screens Designed",
          description: "High-quality, user-focused",
          icon: "monitor",
        },
      ],
    },
  } as Block,
  createBlock("projects", "projects-home"),
  {
    ...createBlock("logo_cloud", "logos-home"),
    config: {
      eyebrow: "Trusted by",
      heading: "Companies I've worked with",
      logos: [
        { name: "WovenRemit", src: "/companies/wove.png" },
        { name: "Delta Post Logistics", src: "/companies/delta-post.png" },
        { name: "SportsDey", src: "/companies/SportsDey.png" },
        { name: "SmatVirtual", src: "/companies/smatvirtual-logo.svg.svg" },
        { name: "TrustComply", src: "/companies/trust-logo2.png" },
        { name: "BCI", src: "/companies/bci.png" },
        { name: "SyncSkills", src: "/companies/syncskills.png" },
        { name: "Dropai Gate", src: "/companies/dropgate.png" },
        { name: "HallaBet", src: "/companies/Hallabet-Logo-GRADIENT-OUTLINED.png" },
      ],
    },
  } as Block,
  {
    ...createBlock("testimonials", "testimonials-home"),
    config: {
      eyebrow: "What people say",
      heading: "Kind Words From Clients & Colleagues",
      items: [
        {
          quote:
            "Taiwo is an exceptional designer who brings rare combination of creativity, empathy and strategic thinking. He consistently delivers beyond expectations.",
          author: "",
          role: "Product Manager",
          company: "WovenRemit",
          logo: "/testimonials/woven.png",
        },
        {
          quote:
            "Working with Taiwo was a game changer for our product. His designs improved user experience and directly impacted our key metrics.",
          author: "",
          role: "Head of Product",
          company: "Syncskills",
          logo: "/testimonials/syncskills.png",
        },
        {
          quote:
            "Taiwo has a strong grasp of user needs and a great ability to translate complex requirements into simple, beautiful designs.",
          author: "",
          role: "CTO",
          company: "Bridged Centre for Impact",
          logo: "/testimonials/bci.png",
        },
        {
          quote:
            "He's proactive, collaborative and incredible talented. I highly recommend Taiwo for any product design role.",
          author: "",
          role: "Engineering Manager",
          company: "Office One AI",
          logo: "/testimonials/of1ai.png",
        },
        {
          quote:
            "Taiwo's attention to details and design systems thinking helped us build a consistent and scalable Product.",
          author: "",
          role: "CEO",
          company: "TrustComply",
          logo: "/testimonials/trustcomply.png",
        },
      ],
    },
  } as Block,
  {
    ...createBlock("call_to_action", "cta-home"),
    config: {
      heading: "Let's create products that make an impact.",
      body: "I typically reply within 24 hours.",
      buttonLabel: "Let's Work Together!",
      buttonHref: "/contact",
      showAvatar: true,
    },
  } as Block,
];

main();
