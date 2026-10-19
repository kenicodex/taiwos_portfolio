// Copies the hardcoded site content into the database so it can be edited in the admin. Optional:
// the site works without it, because every missing value falls back to the same defaults.
// Safe to re-run. Each table is only filled when it is empty, so saved edits are never overwritten.
//  - site settings: name, role, location, contact email, navigation (created only if no row exists)
//  - projects, experience, tools: created only when the table is empty
//  - about and contact lists: created only when the list has no saved rows
// Usage: npm run db:seed:content   (reads DATABASE_URL from the environment)
import { Pool } from "@neondatabase/serverless";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { contentItems, experiences, media, projects, siteSettings, skills } from "../db/schema";
import { COLLECTIONS } from "../features/content/registry";
import { FEATURED, PROJECTS } from "../features/content/defaults/projects";
import { JOBS } from "../features/content/defaults/experience";
import { COLLABORATION_TOOLS, DESIGN_TOOLS, RESEARCH_TOOLS } from "../features/content/defaults/about";
import { CONTACT_EMAIL } from "../features/content/defaults/contact";
import { FOOTER_NAV, HEADER_NAV, PROFILE } from "../features/content/defaults/site";
import { parsePeriod } from "../features/content/mappers";
import { slugify } from "../features/pages/slug";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString: url });
const db = drizzle(pool);

/** Returns the media row for a local file, creating it on first use. Local files are not deleted from storage. */
async function mediaFor(path: string, altText: string, width?: number, height?: number) {
  const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.url, path));
  if (existing) return existing.id;
  const [row] = await db
    .insert(media)
    .values({
      storageProvider: "local",
      storageKey: path,
      url: path,
      altText,
      mimeType: path.endsWith(".pdf") ? "application/pdf" : path.endsWith(".svg") ? "image/svg+xml" : "image/png",
      sizeBytes: 0,
      width: width ?? null,
      height: height ?? null,
    })
    .returning({ id: media.id });
  return row.id;
}

async function seedSettings() {
  const [row] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (row) return "kept";
  await db.insert(siteSettings).values({
    siteTitle: PROFILE.name,
    siteDescription: "",
    ownerName: PROFILE.name,
    role: PROFILE.role,
    initials: PROFILE.initials,
    location: PROFILE.location,
    contactEmail: CONTACT_EMAIL,
    headerNav: [...HEADER_NAV],
    footerNav: [...FOOTER_NAV],
    // Social links are left empty: the defaults include "#" placeholders that the admin would reject.
    socialLinks: [],
    themeConfiguration: {},
  });
  return "created";
}

async function seedProjects() {
  const [{ value }] = await db.select({ value: count() }).from(projects);
  if (value > 0) return 0;
  const all = [FEATURED, ...PROJECTS];
  for (const [index, project] of all.entries()) {
    const coverImageId = project.cover
      ? await mediaFor(project.cover.src, `${project.title} cover`, project.cover.width, project.cover.height)
      : null;
    await db.insert(projects).values({
      title: project.title,
      slug: slugify(project.title),
      summary: project.summary,
      category: project.category,
      role: "role" in project ? String(project.role) : "",
      duration: "duration" in project ? String(project.duration) : "",
      placeholderColor: project.placeholder,
      coverImageId,
      description: "",
      featured: project === FEATURED,
      status: "published",
      displayOrder: index,
    });
  }
  return all.length;
}

async function seedExperiences() {
  const [{ value }] = await db.select({ value: count() }).from(experiences);
  if (value > 0) return { created: 0, skipped: [] as string[] };
  const skipped: string[] = [];
  let created = 0;
  for (const [index, job] of JOBS.entries()) {
    const dates = parsePeriod(job.period);
    if (!dates) {
      // Keep the text as a label, but leave the dates empty so the admin can fill them in.
      skipped.push(`${job.company} (${job.period})`);
    }
    await db.insert(experiences).values({
      company: job.company,
      role: job.role,
      location: job.location,
      periodLabel: dates ? "" : job.period,
      startDate: dates?.startDate ?? "2000-01-01",
      endDate: dates?.endDate ?? null,
      isCurrent: dates?.isCurrent ?? false,
      description: "",
      achievements: [...job.points],
      status: "published",
      displayOrder: index,
    });
    created += 1;
  }
  return { created, skipped };
}

async function seedTools() {
  const [{ value }] = await db.select({ value: count() }).from(skills);
  if (value > 0) return 0;
  let order = 0;
  for (const tool of DESIGN_TOOLS) {
    const iconMediaId = await mediaFor(tool.src, `${tool.name} logo`);
    await db.insert(skills).values({ name: tool.name, category: "design", iconMediaId, visible: true, displayOrder: order++ });
  }
  for (const name of RESEARCH_TOOLS) {
    await db.insert(skills).values({ name, category: "research", visible: true, displayOrder: order++ });
  }
  for (const tool of COLLABORATION_TOOLS) {
    const iconMediaId = await mediaFor(tool.src, `${tool.name} logo`);
    await db.insert(skills).values({ name: tool.name, category: "collaboration", iconMediaId, visible: true, displayOrder: order++ });
  }
  return order;
}

async function seedLists() {
  const report: Record<string, number | "kept"> = {};
  for (const collection of COLLECTIONS) {
    const [{ value }] = await db
      .select({ value: count() })
      .from(contentItems)
      .where(eq(contentItems.collection, collection.name));
    if (value > 0) {
      report[collection.name] = "kept";
      continue;
    }
    for (const [index, item] of collection.defaults.entries()) {
      await db.insert(contentItems).values({
        collection: collection.name,
        data: item as Record<string, unknown>,
        visible: true,
        displayOrder: index,
      });
    }
    report[collection.name] = collection.defaults.length;
  }
  return report;
}

async function main() {
  const settings = await seedSettings();
  const projectCount = await seedProjects();
  const experience = await seedExperiences();
  const toolCount = await seedTools();
  const lists = await seedLists();

  console.log(`site settings: ${settings}`);
  console.log(`projects created: ${projectCount}`);
  console.log(`experience roles created: ${experience.created}`);
  if (experience.skipped.length > 0) {
    console.log(`  dates could not be read, fill them in the admin: ${experience.skipped.join("; ")}`);
  }
  console.log(`tools created: ${toolCount}`);
  for (const [name, result] of Object.entries(lists)) {
    console.log(`list ${name}: ${result === "kept" ? "kept (already has rows)" : `${result} items`}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
