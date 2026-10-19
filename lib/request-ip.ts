import "server-only";
import { createHash } from "node:crypto";

/**
 * A stable, non-reversible key for the caller's IP, for rate limiting. The raw address is never stored.
 * Behind a proxy the first X-Forwarded-For entry is the client, so it is used when present.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return `${scope}:${createHash("sha256").update(ip).digest("hex")}`;
}
