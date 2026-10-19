import { connection } from "next/server";
import { requireAdminPage } from "@/lib/admin-session";
import { getSettingsForAdmin } from "@/features/content/settings-service";
import { listMedia } from "@/features/media/service";
import { SettingsForm } from "@/features/admin/settings/SettingsForm";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

export default async function SettingsPage() {
  await requireAdminPage();
  await connection();
  const [settings, media] = await Promise.all([getSettingsForAdmin(), listMedia()]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Site settings" description="Your name, navigation, social links, CV and brand colour. Empty fields use the original profile." />
      <SettingsForm
        initial={{
          ...settings,
          profile: settings.profile as Record<string, string>,
          headerNav: settings.headerNav,
          footerNav: settings.footerNav,
          socialLinks: settings.socialLinks.map((link) => ({ ...link, icon: link.icon })),
        }}
        media={media.map((item) => ({ id: item.id, url: item.url, altText: item.altText }))}
      />
    </div>
  );
}
