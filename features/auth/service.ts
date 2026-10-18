import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/crypto";

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
