import "server-only";
import { del, head } from "@vercel/blob";
import { and, asc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { media, projects, siteSettings, skills } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { env } from "@/lib/env";

// Uploads go straight from the browser to Vercel Blob. The server only issues a token and then
// records the file after checking it with Blob itself, so the size and type are never taken on trust.

export const ALLOWED_TYPES = {
  "image/png": 8 * 1024 * 1024,
  "image/jpeg": 8 * 1024 * 1024,
  "image/webp": 8 * 1024 * 1024,
  "image/avif": 8 * 1024 * 1024,
  "image/svg+xml": 1024 * 1024,
  "application/pdf": 15 * 1024 * 1024,
} as const;

const PATHNAME = /^site\/[A-Za-z0-9._-]{1,120}$/;

export function requireBlobToken(): string {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new ApiError("NOT_CONFIGURED", "File uploads are not configured. Add BLOB_READ_WRITE_TOKEN to enable them.");
  }
  return env.BLOB_READ_WRITE_TOKEN;
}

export function assertUploadPathname(pathname: string) {
  if (!PATHNAME.test(pathname)) throw new ApiError("BAD_REQUEST", "Invalid file name");
}

export async function listMedia() {
  return db
    .select({
      id: media.id,
      url: media.url,
      altText: media.altText,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      width: media.width,
      height: media.height,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(asc(media.createdAt));
}

/** Confirms a finished upload with Blob, then records it. The size and type come from Blob, not the client. */
export async function registerUpload(input: { url: string; altText: string; width: number | null; height: number | null }) {
  const token = requireBlobToken();
  const details = await head(input.url, { token }).catch(() => null);
  if (!details) throw new ApiError("BAD_REQUEST", "The upload could not be found");

  const limit = ALLOWED_TYPES[details.contentType as keyof typeof ALLOWED_TYPES];
  if (!limit) throw new ApiError("UNSUPPORTED_MEDIA_TYPE", "That file type is not allowed");
  if (details.size > limit) throw new ApiError("PAYLOAD_TOO_LARGE", "That file is too large");

  const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.url, details.url));
  if (existing) return { id: existing.id, url: details.url };

  const [row] = await db
    .insert(media)
    .values({
      storageProvider: "vercel-blob",
      storageKey: details.pathname,
      url: details.url,
      altText: input.altText,
      mimeType: details.contentType,
      sizeBytes: details.size,
      width: input.width,
      height: input.height,
    })
    .returning({ id: media.id });
  return { id: row.id, url: details.url };
}

export async function updateAltText(id: string, altText: string) {
  const updated = await db.update(media).set({ altText }).where(eq(media.id, id)).returning({ id: media.id });
  if (updated.length === 0) throw new ApiError("NOT_FOUND", "File not found");
}

/** Deletes a file, but only when nothing in the site still points at it. */
export async function deleteMedia(id: string) {
  const [row] = await db
    .select({ url: media.url, provider: media.storageProvider })
    .from(media)
    .where(eq(media.id, id));
  if (!row) throw new ApiError("NOT_FOUND", "File not found");

  const count = sql<number>`count(*)::int`;
  const [projectUses, skillUses, settingUses] = await Promise.all([
    db.select({ count }).from(projects).where(eq(projects.coverImageId, id)),
    db.select({ count }).from(skills).where(eq(skills.iconMediaId, id)),
    db
      .select({ count })
      .from(siteSettings)
      .where(
        or(eq(siteSettings.profileImageId, id), eq(siteSettings.resumeMediaId, id), eq(siteSettings.shareImageId, id)),
      ),
  ]);
  const inUse = [projectUses, skillUses, settingUses].some((rows) => (rows[0]?.count ?? 0) > 0);
  if (inUse) {
    throw new ApiError("CONFLICT", "This file is still used on the site. Remove it from there first.");
  }

  // Only files in Blob can be deleted from storage. Local files (seeded from the repo) just lose their record.
  if (row.provider === "vercel-blob") {
    await del(row.url, { token: requireBlobToken() });
  }
  await db.delete(media).where(and(eq(media.id, id)));
}
