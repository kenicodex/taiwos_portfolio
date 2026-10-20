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
