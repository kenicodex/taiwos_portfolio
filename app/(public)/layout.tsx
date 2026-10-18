import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeScope } from "@/components/site/theme-scope";

// Public pages get the site header and footer. Admin and login are outside this group and do not.
// The fallback renders the same content with the default theme, which matches the seeded value.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-full flex-1 flex-col">{shell(children)}</div>}>
      <ThemeScope>{shell(children)}</ThemeScope>
    </Suspense>
  );
}

function shell(children: ReactNode) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
