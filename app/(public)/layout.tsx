import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeScope } from "@/components/site/theme-scope";
import { getSiteProfile, SITE_FALLBACK, type SiteProfile } from "@/features/content/queries";

// Public pages get the site header and footer. Admin and login are outside this group and do not.
// The profile comes from site settings. While it loads, the shell renders the hardcoded profile.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-full flex-1 flex-col">{shell(SITE_FALLBACK, children)}</div>}>
      <ThemeScope>
        <ProfiledShell>{children}</ProfiledShell>
      </ThemeScope>
    </Suspense>
  );
}

async function ProfiledShell({ children }: { children: ReactNode }) {
  await connection();
  return shell(await getSiteProfile(), children);
}

function shell(profile: SiteProfile, children: ReactNode) {
  return (
    <>
      <SiteHeader profile={profile} />
      {children}
      <SiteFooter profile={profile} />
    </>
  );
}
