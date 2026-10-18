// Provisions the single administrator. Public sign-up is disabled, so this is the only way an account is created.
// Usage: npm run admin:create  (reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from the environment)
import { randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";
import { and, eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { hashPassword } from "better-auth/crypto";
import { account, user } from "../db/schema";

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
        .select({ id: user.id, email: user.email })
        .from(user)
        .where(and(eq(user.role, "admin"), ne(user.email, email)));
      if (otherAdmin) {
        throw new Error(`another administrator already exists (${otherAdmin.email}); this app supports one`);
      }

      const [existing] = await tx.select().from(user).where(eq(user.email, email));
      const userId = existing?.id ?? randomUUID();

      if (existing) {
        await tx.update(user).set({ role: "admin", name, updatedAt: new Date() }).where(eq(user.id, userId));
      } else {
        await tx.insert(user).values({ id: userId, name, email, role: "admin", emailVerified: true });
      }

      const [credential] = await tx
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));

      if (credential) {
        await tx
          .update(account)
          .set({ password: passwordHash, updatedAt: new Date() })
          .where(eq(account.id, credential.id));
      } else {
        await tx.insert(account).values({
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: passwordHash,
        });
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
