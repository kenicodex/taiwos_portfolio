import "server-only";
import { cacheTag, revalidateTag } from "next/cache";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pages, pageVersions } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { validatePageContent } from "@/features/page-builder/blocks/schemas";
import { createEmptyPageContent } from "@/features/page-builder/blocks/defaults";
import { checkSlug } from "./slug";

/** Every public, cached read carries this tag. Publishing expires it so visitors see the change. */
export const PUBLIC_CONTENT_TAG = "public-content";
export const pageTag = (slug: string) => `page:${slug}`;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function assertDraftRevision(currentDraftId: string | null, expectedDraftId: string) {
  if (currentDraftId !== expectedDraftId) {
    throw new ApiError(
      "CONFLICT",
      "The draft was changed by a newer save. Reload to get the latest version.",
    );
  }
}

async function lockPage(tx: Tx, pageId: string) {
  const [page] = await tx.select().from(pages).where(eq(pages.id, pageId)).for("update");
  if (!page) throw new ApiError("NOT_FOUND", "Page not found");
  return page;
}

async function nextVersionNumber(tx: Tx, pageId: string) {
  const [row] = await tx
    .select({ max: sql<number>`coalesce(max(${pageVersions.versionNumber}), 0)` })
    .from(pageVersions)
    .where(eq(pageVersions.pageId, pageId));
  return Number(row?.max ?? 0) + 1;
}

export async function listPages(limit: number, offset: number) {
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        status: pages.status,
        publishedVersionId: pages.publishedVersionId,
        draftVersionId: pages.draftVersionId,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .orderBy(desc(pages.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(pages),
  ]);
  return { items: rows, total: Number(total?.value ?? 0) };
}

export async function getPageWithDraft(pageId: string) {
  const [page] = await db.select().from(pages).where(eq(pages.id, pageId));
  if (!page) throw new ApiError("NOT_FOUND", "Page not found");
  const draft = page.draftVersionId
    ? (await db.select().from(pageVersions).where(eq(pageVersions.id, page.draftVersionId)))[0]
    : undefined;
  return { page, draft: draft ?? null };
}

/** Creates a page with an empty draft at version 1. Nothing is public until it is published. */
export async function createPage(input: { title: string; slug: string }) {
  const slugCheck = checkSlug(input.slug);
  if (!slugCheck.valid) throw new ApiError("VALIDATION_FAILED", slugCheck.reason);

  const existing = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, input.slug));
  if (existing.length > 0) throw new ApiError("CONFLICT", "A page with this slug already exists");

  return db.transaction(async (tx) => {
    const [page] = await tx.insert(pages).values({ title: input.title, slug: input.slug }).returning();
    const [version] = await tx
      .insert(pageVersions)
      .values({ pageId: page.id, versionNumber: 1, contentJson: createEmptyPageContent() })
      .returning();
    const [updated] = await tx
      .update(pages)
      .set({ draftVersionId: version.id })
      .where(eq(pages.id, page.id))
      .returning();
    return { page: updated, draft: version };
  });
}

export async function updatePageMeta(pageId: string, input: { title?: string; slug?: string }) {
  if (input.slug !== undefined) {
    const slugCheck = checkSlug(input.slug);
    if (!slugCheck.valid) throw new ApiError("VALIDATION_FAILED", slugCheck.reason);
  }
  try {
    const [page] = await db
      .update(pages)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pages.id, pageId))
      .returning();
    if (!page) throw new ApiError("NOT_FOUND", "Page not found");
    // The slug may have changed, and the public URL cache must follow it.
    revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
    return page;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw new ApiError("CONFLICT", "A page with this slug already exists");
    throw error;
  }
}

/** Deletes the page and all its versions. The page's published content disappears immediately. */
export async function deletePage(pageId: string) {
  const [deleted] = await db.delete(pages).where(eq(pages.id, pageId)).returning({ id: pages.id });
  if (!deleted) throw new ApiError("NOT_FOUND", "Page not found");
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
}

/**
 * Saves a new draft revision. Each save inserts an immutable version row; existing rows are never edited.
 * The update only succeeds if the draft is still the one the client edited (optimistic concurrency).
 */
export async function saveDraft(input: {
  pageId: string;
  expectedDraftVersionId: string;
  content: unknown;
  title?: string;
}) {
  const content = await validatePageContent(input.content);

  return db.transaction(async (tx) => {
    const page = await lockPage(tx, input.pageId);
    assertDraftRevision(page.draftVersionId, input.expectedDraftVersionId);

    const versionNumber = await nextVersionNumber(tx, input.pageId);
    const [version] = await tx
      .insert(pageVersions)
      .values({ pageId: input.pageId, versionNumber, contentJson: content })
      .returning();

    await tx
      .update(pages)
      .set({
        draftVersionId: version.id,
        updatedAt: new Date(),
        ...(input.title !== undefined ? { title: input.title } : {}),
      })
      .where(eq(pages.id, input.pageId));

    return version;
  });
}

/**
 * Publishes the current draft. The database changes are one transaction: if validation fails
 * or the revision is stale, the previous published version stays as it was.
 * Cache revalidation runs only after the commit.
 */
export async function publishDraft(input: { pageId: string; expectedDraftVersionId: string }) {
  const result = await db.transaction(async (tx) => {
    const page = await lockPage(tx, input.pageId);
    assertDraftRevision(page.draftVersionId, input.expectedDraftVersionId);

    const [draft] = await tx
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.id, input.expectedDraftVersionId));
    if (!draft) throw new ApiError("NOT_FOUND", "Draft version not found");

    // Validate the complete stored definition, not just the last edit.
    await validatePageContent(draft.contentJson);

    const now = new Date();
    // Version rows are immutable: only the publication timestamp is set, once.
    await tx
      .update(pageVersions)
      .set({ publishedAt: now })
      .where(and(eq(pageVersions.id, draft.id), sql`${pageVersions.publishedAt} is null`));

    const [updated] = await tx
      .update(pages)
      .set({ publishedVersionId: draft.id, status: "published", updatedAt: now })
      .where(eq(pages.id, input.pageId))
      .returning();

    return { page: updated, version: draft };
  });

  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
  revalidateTag(pageTag(result.page.slug), { expire: 0 });
  return result;
}

export async function listVersions(pageId: string) {
  const [page] = await db
    .select({ id: pages.id, publishedVersionId: pages.publishedVersionId })
    .from(pages)
    .where(eq(pages.id, pageId));
  if (!page) throw new ApiError("NOT_FOUND", "Page not found");

  const rows = await db
    .select({
      id: pageVersions.id,
      versionNumber: pageVersions.versionNumber,
      createdAt: pageVersions.createdAt,
      publishedAt: pageVersions.publishedAt,
    })
    .from(pageVersions)
    .where(eq(pageVersions.pageId, pageId))
    .orderBy(desc(pageVersions.versionNumber));

  return rows.map((row) => ({
    ...row,
    isLive: row.id === page.publishedVersionId,
  }));
}

/**
 * Restores an earlier version by copying its content into a new draft. It does not go live
 * until an explicit publish.
 */
export async function restoreVersion(input: {
  pageId: string;
  versionId: string;
  expectedDraftVersionId: string;
}) {
  return db.transaction(async (tx) => {
    const page = await lockPage(tx, input.pageId);
    assertDraftRevision(page.draftVersionId, input.expectedDraftVersionId);

    const [source] = await tx
      .select()
      .from(pageVersions)
      .where(and(eq(pageVersions.id, input.versionId), eq(pageVersions.pageId, input.pageId)));
    if (!source) throw new ApiError("NOT_FOUND", "Version not found");

    const versionNumber = await nextVersionNumber(tx, input.pageId);
    const [draft] = await tx
      .insert(pageVersions)
      .values({ pageId: input.pageId, versionNumber, contentJson: source.contentJson })
      .returning();

    await tx
      .update(pages)
      .set({ draftVersionId: draft.id, updatedAt: new Date() })
      .where(eq(pages.id, input.pageId));

    return { draft, restoredFromVersionNumber: source.versionNumber };
  });
}

/** Published read used by public routes. Returns null for unpublished or unknown slugs. */
export async function getPublishedPage(slug: string) {
  "use cache";
  cacheTag(PUBLIC_CONTENT_TAG, pageTag(slug));

  const [row] = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pageVersions.contentJson,
      versionNumber: pageVersions.versionNumber,
      publishedAt: pageVersions.publishedAt,
    })
    .from(pages)
    .innerJoin(pageVersions, eq(pages.publishedVersionId, pageVersions.id))
    .where(and(eq(pages.slug, slug), eq(pages.status, "published")));

  return row ?? null;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}
