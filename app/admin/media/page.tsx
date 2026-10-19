import { connection } from "next/server";
import { requireAdminPage } from "@/lib/admin-session";
import { env } from "@/lib/env";
import { listMedia } from "@/features/media/service";
import { MediaLibrary } from "@/features/admin/media/MediaLibrary";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

export default async function MediaPage() {
  await requireAdminPage();
  await connection();
  const items = await listMedia();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Media" description="Files used on the site: photos, project covers, logos and the CV." />
      <MediaLibrary
        initial={items.map((item) => ({ ...item, altText: item.altText }))}
        uploadsEnabled={Boolean(env.BLOB_READ_WRITE_TOKEN)}
      />
    </div>
  );
}
