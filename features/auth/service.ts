import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export const MIN_PASSWORD_LENGTH = 12;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

let dummyHash: Promise<string> | undefined;
// Used when the email is unknown, so the response time does not reveal which emails exist.
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password-for-timing"));

/**
 * Checks credentials. Returns the administrator on success, or null for every failure
 * (unknown email, wrong password, or a locked account) so callers can't tell them apart.
 */
export async function authenticateAdmin(email: string, password: string) {
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  const now = new Date();

  if (admin?.lockedUntil && admin.lockedUntil > now) {
    await verifyPassword(password, await getDummyHash());
    return null;
  }

  const ok = await verifyPassword(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin) return null;

  if (!ok) {
    const failures = admin.failedLoginAttempts + 1;
    await db
      .update(adminUsers)
      .set({
        failedLoginAttempts: failures,
        lockedUntil: failures >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MS) : null,
      })
      .where(eq(adminUsers.id, admin.id));
    return null;
  }

  await db
    .update(adminUsers)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now })
    .where(eq(adminUsers.id, admin.id));

  return { id: admin.id, email: admin.email, name: admin.name };
}

/**
 * Changes the administrator's password after re-checking the current one. Every other session is
 * signed out, so a stolen cookie stops working. The session making the change is kept.
 */
export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
  keepTokenHash: string | null,
) {
  const [admin] = await db
    .select({ passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.id, adminId));
  if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
    throw new ApiError("FORBIDDEN", "Current password is incorrect.");
  }
  if (newPassword === currentPassword) {
    throw new ApiError("BAD_REQUEST", "Choose a password you have not used before.");
  }

  const passwordHash = await hashPassword(newPassword);
  await db.transaction(async (tx) => {
    await tx.update(adminUsers).set({ passwordHash, failedLoginAttempts: 0, lockedUntil: null }).where(eq(adminUsers.id, adminId));
    await tx
      .delete(adminSessions)
      .where(
        keepTokenHash
          ? and(eq(adminSessions.adminId, adminId), ne(adminSessions.tokenHash, keepTokenHash))
          : eq(adminSessions.adminId, adminId),
      );
  });
}
