import "server-only";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { ApiError } from "@/lib/api";

export type SessionSummary = { id: string; createdAt: Date; expiresAt: Date; current: boolean };

/** Active sessions for the administrator. `current` marks the browser making the request. */
export async function listAdminSessions(adminId: string, currentTokenHash: string | null): Promise<SessionSummary[]> {
  const rows = await db
    .select({
      id: adminSessions.id,
      tokenHash: adminSessions.tokenHash,
      createdAt: adminSessions.createdAt,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .where(and(eq(adminSessions.adminId, adminId), gt(adminSessions.expiresAt, new Date())))
    .orderBy(desc(adminSessions.createdAt));

  return rows.map(({ id, createdAt, expiresAt, tokenHash }) => ({
    id,
    createdAt,
    expiresAt,
    current: tokenHash === currentTokenHash,
  }));
}

/** Signs out one of the administrator's other sessions. The current session must be ended from sign-out instead. */
export async function revokeAdminSession(adminId: string, sessionId: string, currentTokenHash: string | null) {
  const [row] = await db
    .select({ tokenHash: adminSessions.tokenHash })
    .from(adminSessions)
    .where(and(eq(adminSessions.id, sessionId), eq(adminSessions.adminId, adminId)));
  if (!row) throw new ApiError("NOT_FOUND", "Session not found");
  if (row.tokenHash === currentTokenHash) {
    throw new ApiError("BAD_REQUEST", "Use sign out to end the session you are using");
  }
  await db.delete(adminSessions).where(and(eq(adminSessions.id, sessionId), eq(adminSessions.adminId, adminId)));
}
