// Creates or updates the single administrator. Public sign-up does not exist, so this is the only way to create an account.
// Usage: npm run admin:create   (reads ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME from the environment)
import { Pool } from "@neondatabase/serverless";
import { eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { adminSessions, adminUsers } from "../db/schema";
import { hashPassword } from "../lib/crypto";

const MIN_PASSWORD_LENGTH = 12;

function fail(message: string): never {
  console.error(`create-admin: ${message}`);
  process.exit(1);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!databaseUrl) fail("DATABASE_URL is not set");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("ADMIN_EMAIL must be a valid email address");
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    fail(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  try {
    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      const [otherAdmin] = await tx
        .select({ email: adminUsers.email })
        .from(adminUsers)
        .where(ne(adminUsers.email, email));
      if (otherAdmin) {
        throw new Error(`another administrator already exists (${otherAdmin.email}); this app supports one`);
      }

      const [existing] = await tx
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.email, email));
      if (existing) {
        await tx
          .update(adminUsers)
          .set({ name, passwordHash, failedLoginAttempts: 0, lockedUntil: null })
          .where(eq(adminUsers.id, existing.id));
        // A password change signs out every existing session.
        await tx.delete(adminSessions).where(eq(adminSessions.adminId, existing.id));
      } else {
        await tx.insert(adminUsers).values({ email, name, passwordHash });
      }
    });

    console.log(`Administrator is ready: ${email}`);
  } catch (error) {
    fail(error instanceof Error ? error.message : "unknown error");
  } finally {
    await pool.end();
  }
}

main();
