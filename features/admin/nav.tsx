"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api-client";

export const ADMIN_NAV = [
  { group: "Overview", items: [{ label: "Dashboard", href: "/admin" }] },
  {
    group: "Content",
    items: [
      { label: "About", href: "/admin/content/about.intro" },
      { label: "Projects page", href: "/admin/content/projects.page" },
      { label: "Experience page", href: "/admin/content/experience.page" },
      { label: "Contact page", href: "/admin/content/contact.page" },
      { label: "Projects", href: "/admin/projects" },
      { label: "Experience", href: "/admin/experience" },
      { label: "Tools & skills", href: "/admin/tools" },
    ],
  },
  {
    group: "Inbox & media",
    items: [
      { label: "Messages", href: "/admin/messages" },
      { label: "Media", href: "/admin/media" },
    ],
  },
  {
    group: "Site",
    items: [
      { label: "Settings", href: "/admin/settings" },
      { label: "Account", href: "/admin/account" },
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await api("/admin/session", { method: "DELETE" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {ADMIN_NAV.map((section) => (
        <div key={section.group} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {section.group}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                      active
                        ? "bg-brand text-white"
                        : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        className="mt-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </nav>
  );
}
