// Seeds the database with the site's initial content. Safe to re-run:
//  - site_settings: brand colour (theme configuration), other saved settings are kept
//  - media and projects: upserted by storage key and slug
//  - home page: a new version is added and published (earlier versions are kept)
// Usage: npm run db:seed   (reads DATABASE_URL from the environment)
import { Pool } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { media, pageVersions, pages, projects, siteSettings } from "../db/schema";
import { validatePageContent } from "../features/page-builder/blocks/schemas";
import { createBlock } from "../features/page-builder/blocks/defaults";
import type { Block } from "../features/page-builder/blocks/types";
import { DEFAULT_PRIMARY, themeFromPrimary } from "../features/site/theme";

const PROJECTS = [
  {
    slug: "woven-remit",
    title: "WovenRemit",
    category: "FINTECH",
    summary:
      "Redesigned a remittance platform to simplify money transfers and improve user trust and engagement.",
    cover: "/work/woven-remit.png",
    alt: "WovenRemit app screens",
  },
  {
    slug: "office-one-ai",
    title: "Office One AI",
    category: "AI/SAAS",
    summary:
      "Designed an AI-powered platform that streamlines collaboration, knowledge sharing and productivity.",
    cover: "/work/office-one-ai.png",
    alt: "Office One AI app screens",
  },
  {
    slug: "smatvirtual",
    title: "SMATVIRTUAL",
    category: "GAMING",
    summary:
      "Designed dashboards that give game providers real-time insights and improve user gaming experience.",
    cover: "/work/smatvirtual.png",
    alt: "SMATVIRTUAL dashboard",
  },
  {
    slug: "dp-logistics",
    title: "DP Logistics",
    category: "LOGISTICS",
    summary:
      "Designed an end-to-end delivery management experience for riders, customers and fleet managers.",
    cover: "/work/dp-logistics.png",
    alt: "DP Logistics app screens",
  },
];

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
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("seed: DATABASE_URL is not set");
    process.exit(1);
  }

  // Validate the home page before touching the database.
  const homeContent = await validatePageContent({ schemaVersion: 1, blocks: HOME_BLOCKS });
  const theme = themeFromPrimary(DEFAULT_PRIMARY);

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

      // Projects with their cover images.
      for (const [index, project] of PROJECTS.entries()) {
        const [image] = await tx
          .insert(media)
          .values({
            storageProvider: "local",
            storageKey: `local:${project.cover}`,
            url: project.cover,
            altText: project.alt,
            mimeType: "image/png",
            sizeBytes: 0,
          })
          .onConflictDoUpdate({ target: media.storageKey, set: { url: project.cover, altText: project.alt } })
          .returning({ id: media.id });

        await tx
          .insert(projects)
          .values({
            title: project.title,
            slug: project.slug,
            summary: project.summary,
            category: project.category,
            coverImageId: image.id,
            technologies: [],
            featured: true,
            status: "published",
            displayOrder: index,
          })
          .onConflictDoUpdate({
            target: projects.slug,
            set: {
              title: project.title,
              summary: project.summary,
              category: project.category,
              coverImageId: image.id,
              featured: true,
              status: "published",
              displayOrder: index,
              updatedAt: new Date(),
            },
          });
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

    console.log(`Seeded brand colour ${theme.primary}, ${PROJECTS.length} projects and the home page.`);
  } catch (error) {
    console.error("seed:", error instanceof Error ? error.message : "unknown error");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
