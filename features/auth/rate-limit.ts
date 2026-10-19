import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { ApiError } from "@/lib/api";

/**
 * Counts one attempt against `key` and throws RATE_LIMITED once the limit is passed within the window.
 * One upsert keeps the count and window correct under concurrent requests.
 */
export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<void> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const expired = sql`${rateLimits.windowStartedAt} <= ${windowStart}`;

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${expired} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${expired} THEN ${now} ELSE ${rateLimits.windowStartedAt} END`,
      },
    })
    .returning({ count: rateLimits.count });

  if (row.count > limit) {
    throw new ApiError("RATE_LIMITED", "Too many attempts. Try again in a few minutes.");
  }
}
