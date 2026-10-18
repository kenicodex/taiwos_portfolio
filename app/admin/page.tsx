import { requireAdminPage } from "@/lib/admin-session";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="opacity-80">
        Signed in as the administrator. Page management is available through the admin API under
        <code className="mx-1 rounded bg-black/5 px-1 dark:bg-white/10">/api/v1/admin/pages</code>
        while the visual builder is being built.
      </p>
    </main>
  );
}
