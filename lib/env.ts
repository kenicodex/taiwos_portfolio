import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Server-only secrets and connection strings. Never reference these from client components.
// The optional ones switch a feature on. Without them the feature reports "not configured" instead of failing.
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    RESEND_API_KEY: z.string().min(1).optional(),
    CONTACT_TO_EMAIL: z.email().optional(),
    CONTACT_FROM_EMAIL: z.email().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  emptyStringAsUndefined: true,
});
