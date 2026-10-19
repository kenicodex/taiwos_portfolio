import "server-only";
import { revalidateTag } from "next/cache";
import { asc, eq, getTableColumns, max } from "drizzle-orm";
import * as yup from "yup";
import { db } from "@/db";
import { experiences, media, projects, skills } from "@/db/schema";
import { ApiError, UUID_PATTERN } from "@/lib/api";
import { PUBLIC_CONTENT_TAG } from "@/features/pages/service";
import { checkSlug, slugify } from "@/features/pages/slug";

// Admin CRUD for the three record tables the public pages read: projects, experience and tools (skills).

const HEX = /^#[0-9a-fA-F]{6}$/;
const uuidOrNull = yup
  .string()
  .nullable()
  .default(null)
  .test("uuid", "Invalid image reference", (value) => value === null || value === undefined || UUID_PATTERN.test(value));
const isoDate = yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");

// ---------- projects ----------

export const projectInputSchema = yup.object({
  title: yup.string().trim().max(120).required("Enter a title"),
  slug: yup.string().trim().max(80).default(""),
  summary: yup.string().trim().max(400).required("Enter a short summary"),
  category: yup.string().trim().max(60).default(""),
  role: yup.string().trim().max(120).default(""),
  duration: yup.string().trim().max(60).default(""),
  placeholderColor: yup.string().matches(HEX, "Use a 6-digit hex colour").default("#1A1A1A"),
  caseStudyUrl: yup
    .string()
    .trim()
    .max(300)
    .matches(/^(\/|https?:\/\/)/, { message: "Use a path starting with / or an https link", excludeEmptyString: true })
    .default(""),
  description: yup.string().trim().max(4000).default(""),
  featured: yup.boolean().default(false),
  status: yup.string().oneOf(["draft", "published"]).default("draft"),
  coverImageId: uuidOrNull,
});

export type ProjectInput = yup.InferType<typeof projectInputSchema>;

async function assertMediaExists(id: string | null) {
  if (!id) return;
  const [row] = await db.select({ id: media.id }).from(media).where(eq(media.id, id));
  if (!row) throw new ApiError("BAD_REQUEST", "The selected image does not exist");
}

function resolveSlug(title: string, slug: string) {
  const candidate = slug || slugify(title);
  const check = checkSlug(candidate);
  if (!check.valid) throw new ApiError("VALIDATION_FAILED", check.reason, [{ path: "slug", message: check.reason }]);
  return candidate;
}

export async function listProjectsForAdmin() {
  return db
    .select({ ...getTableColumns(projects), coverUrl: media.url })
    .from(projects)
    .leftJoin(media, eq(projects.coverImageId, media.id))
    .orderBy(asc(projects.displayOrder));
}

export async function createProject(raw: unknown) {
  const input = await projectInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  await assertMediaExists(input.coverImageId);
  const slug = resolveSlug(input.title, input.slug);
  const [last] = await db.select({ value: max(projects.displayOrder) }).from(projects);
  const [row] = await db
    .insert(projects)
    .values({ ...input, slug, displayOrder: (last?.value ?? -1) + 1 })
    .returning({ id: projects.id });
  revalidate("projects");
  return { id: row.id };
}

export async function updateProject(id: string, raw: unknown) {
  const input = await projectInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  await assertMediaExists(input.coverImageId);
  const slug = resolveSlug(input.title, input.slug);
  const updated = await db
    .update(projects)
    .set({ ...input, slug, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  if (updated.length === 0) throw new ApiError("NOT_FOUND", "Project not found");
  revalidate("projects");
}

export async function deleteProject(id: string) {
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  if (deleted.length === 0) throw new ApiError("NOT_FOUND", "Project not found");
  revalidate("projects");
}

// ---------- experience ----------

export const experienceInputSchema = yup.object({
  company: yup.string().trim().max(120).required("Enter the company"),
  role: yup.string().trim().max(120).required("Enter the role"),
  location: yup.string().trim().max(120).default(""),
  periodLabel: yup.string().trim().max(80).default(""),
  startDate: isoDate.required("Enter a start date"),
  endDate: isoDate.nullable().default(null),
  isCurrent: yup.boolean().default(false),
  description: yup.string().trim().max(2000).default(""),
  achievements: yup.array().of(yup.string().trim().max(400).required()).max(12).default([]),
  status: yup.string().oneOf(["draft", "published"]).default("draft"),
});

export type ExperienceInput = yup.InferType<typeof experienceInputSchema>;

export async function listExperiencesForAdmin() {
  return db.select().from(experiences).orderBy(asc(experiences.displayOrder));
}

export async function createExperience(raw: unknown) {
  const input = await experienceInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  const [last] = await db.select({ value: max(experiences.displayOrder) }).from(experiences);
  const [row] = await db
    .insert(experiences)
    .values({ ...input, displayOrder: (last?.value ?? -1) + 1 })
    .returning({ id: experiences.id });
  revalidate("experiences");
  return { id: row.id };
}

export async function updateExperience(id: string, raw: unknown) {
  const input = await experienceInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  const updated = await db
    .update(experiences)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(experiences.id, id))
    .returning({ id: experiences.id });
  if (updated.length === 0) throw new ApiError("NOT_FOUND", "Experience not found");
  revalidate("experiences");
}

export async function deleteExperience(id: string) {
  const deleted = await db.delete(experiences).where(eq(experiences.id, id)).returning({ id: experiences.id });
  if (deleted.length === 0) throw new ApiError("NOT_FOUND", "Experience not found");
  revalidate("experiences");
}

// ---------- tools (skills) ----------

export const skillInputSchema = yup.object({
  name: yup.string().trim().max(60).required("Enter a name"),
  category: yup.string().oneOf(["design", "research", "collaboration"]).required(),
  iconMediaId: uuidOrNull,
  visible: yup.boolean().default(true),
});

export type SkillInput = yup.InferType<typeof skillInputSchema>;

export async function listSkillsForAdmin() {
  return db
    .select({
      id: skills.id,
      name: skills.name,
      category: skills.category,
      visible: skills.visible,
      displayOrder: skills.displayOrder,
      iconMediaId: skills.iconMediaId,
      iconUrl: media.url,
    })
    .from(skills)
    .leftJoin(media, eq(skills.iconMediaId, media.id))
    .orderBy(asc(skills.displayOrder));
}

export async function createSkill(raw: unknown) {
  const input = await skillInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  await assertMediaExists(input.iconMediaId);
  const [last] = await db.select({ value: max(skills.displayOrder) }).from(skills);
  const [row] = await db
    .insert(skills)
    .values({ ...input, displayOrder: (last?.value ?? -1) + 1 })
    .returning({ id: skills.id });
  revalidate("skills");
  return { id: row.id };
}

export async function updateSkill(id: string, raw: unknown) {
  const input = await skillInputSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  await assertMediaExists(input.iconMediaId);
  const updated = await db.update(skills).set(input).where(eq(skills.id, id)).returning({ id: skills.id });
  if (updated.length === 0) throw new ApiError("NOT_FOUND", "Tool not found");
  revalidate("skills");
}

export async function deleteSkill(id: string) {
  const deleted = await db.delete(skills).where(eq(skills.id, id)).returning({ id: skills.id });
  if (deleted.length === 0) throw new ApiError("NOT_FOUND", "Tool not found");
  revalidate("skills");
}

// ---------- ordering ----------

/** Sets display_order from the given id list. Every id must exist, so a stale list cannot silently reorder rows. */
export async function reorder(kind: "projects" | "experiences" | "skills", ids: string[]) {
  const table = { projects, experiences, skills }[kind];
  const unique = new Set(ids);
  if (unique.size !== ids.length || ids.some((id) => !UUID_PATTERN.test(id))) {
    throw new ApiError("BAD_REQUEST", "Invalid order list");
  }
  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: table.id }).from(table);
    if (existing.length !== ids.length || existing.some((row) => !unique.has(row.id))) {
      throw new ApiError("CONFLICT", "The list changed. Reload and try again.");
    }
    for (const [index, id] of ids.entries()) {
      await tx.update(table).set({ displayOrder: index }).where(eq(table.id, id));
    }
  });
  revalidate(kind);
}

function revalidate(kind: "projects" | "experiences" | "skills") {
  revalidateTag(kind, { expire: 0 });
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
}
