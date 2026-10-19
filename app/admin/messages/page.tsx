import { connection } from "next/server";
import { requireAdminPage } from "@/lib/admin-session";
import { listMessages } from "@/features/contact/admin-service";
import { MessageInbox } from "@/features/admin/messages/MessageInbox";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

export default async function MessagesPage() {
  await requireAdminPage();
  await connection();
  const rows = await listMessages(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Messages" description="Messages sent through the contact form. Each one is saved even when the email notification fails." />
      <MessageInbox
        initial={rows.map((row) => ({
          ...row,
          notifiedAt: row.notifiedAt?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
