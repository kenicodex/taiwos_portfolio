import { requireAdminPage } from "@/lib/admin-session";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/service";
import { AccountPanel } from "@/features/admin/account/AccountPanel";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

export default async function AccountPage() {
  await requireAdminPage();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Account" description="Your password and the devices that are signed in." />
      <AccountPanel minPasswordLength={MIN_PASSWORD_LENGTH} />
    </div>
  );
}
