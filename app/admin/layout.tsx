import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/features/admin/nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Blocking render, so unauthenticated visitors get a real redirect instead of a streamed one.
export const instant = false;

// Every admin page also calls requireAdminPage(), and every API route re-checks the session on its own.
// The shell only lays out the navigation, so it has no access to data of its own.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50 lg:flex-row">
      <aside className="border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <Link href="/admin" className="mb-5 block px-3 text-base font-semibold text-brand">
          Site admin
        </Link>
        <AdminNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
