import "server-only";
import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { hashSessionToken, newSessionToken } from "./crypto";
import { SESSION_COOKIE, SESSION_TTL_MS } from "./session-cookie";

export type AdminSession = { adminId: string; email: string; name: string };

const isProduction = process.env.NODE_ENV === "production";

export async function createAdminSession(adminId: string) {
  const token = newSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  // Expired rows are only ever filtered out on read, so clear them here as sessions are created.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
  await db.insert(adminSessions).values({ adminId, tokenHash: hashSessionToken(token), expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Returns the administrator for a valid, unexpired session cookie, otherwise null. */
export async function readAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({ adminId: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, hashSessionToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);

  return row ?? null;
}

/** Hash of the signed-in browser's session token, or null when there is no cookie. */
export async function currentSessionTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? hashSessionToken(token) : null;
}

/** Deletes the session on the server and clears the cookie in the browser. */
export async function endAdminSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashSessionToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}
