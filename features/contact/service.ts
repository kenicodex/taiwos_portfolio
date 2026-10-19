import "server-only";
import { eq } from "drizzle-orm";
import * as yup from "yup";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { env } from "@/lib/env";

export const contactSchema = yup.object({
  name: yup.string().trim().max(120).required("Enter your name"),
  email: yup.string().trim().lowercase().email("Enter a valid email address").max(254).required("Enter your email"),
  website: yup.string().trim().max(300).default(""),
  timeline: yup.string().trim().max(60).default(""),
  details: yup.string().trim().min(10, "Tell me a little more about the project").max(4000).required(),
  // Honeypot: real visitors never fill this in. Bots that do are answered as if the message was sent.
  company: yup.string().max(200).default(""),
});

export type ContactInput = yup.InferType<typeof contactSchema>;

/**
 * Saves the message, then tries to email the owner. A failed or unconfigured email never loses the
 * message: the error is stored on the row and the admin inbox shows it.
 */
export async function saveContactMessage(input: ContactInput, ipHash: string) {
  const [row] = await db
    .insert(contactMessages)
    .values({
      name: input.name,
      email: input.email,
      subject: input.website || null,
      message: input.details,
      website: input.website || null,
      timeline: input.timeline || null,
      ipHash,
    })
    .returning({ id: contactMessages.id });

  const outcome = await notifyOwner(input);
  await db
    .update(contactMessages)
    .set(outcome.ok ? { notifiedAt: new Date(), notifyError: null } : { notifyError: outcome.error })
    .where(eq(contactMessages.id, row.id));

  return { id: row.id, notified: outcome.ok };
}

type NotifyOutcome = { ok: true } | { ok: false; error: string };

/** Sends the owner an email through Resend. Plain fetch, so no SDK is needed. */
async function notifyOwner(input: ContactInput): Promise<NotifyOutcome> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return { ok: false, error: "Email notifications are not configured." };
  }

  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.website && `Website: ${input.website}`,
    `Timeline: ${input.timeline || "Not specified"}`,
    "",
    input.details,
  ].filter((line): line is string => Boolean(line));

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: input.email,
        subject: `New project inquiry from ${input.name}`,
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { ok: false, error: `Email provider responded with ${response.status}.` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Email provider could not be reached." };
  }
}
