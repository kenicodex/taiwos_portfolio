import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { ApiError } from "@/lib/api";

export const MESSAGE_STATUSES = ["new", "read", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export async function listMessages(status: MessageStatus | null) {
  const query = db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      subject: contactMessages.subject,
      message: contactMessages.message,
      status: contactMessages.status,
      phone: contactMessages.phone,
      website: contactMessages.website,
      timeline: contactMessages.timeline,
      notifiedAt: contactMessages.notifiedAt,
      notifyError: contactMessages.notifyError,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages);
  const rows = await (status ? query.where(eq(contactMessages.status, status)) : query).orderBy(
    desc(contactMessages.createdAt),
  );
  return rows;
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  const updated = await db
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });
  if (updated.length === 0) throw new ApiError("NOT_FOUND", "Message not found");
}

export async function deleteMessage(id: string) {
  const deleted = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning({ id: contactMessages.id });
  if (deleted.length === 0) throw new ApiError("NOT_FOUND", "Message not found");
}
