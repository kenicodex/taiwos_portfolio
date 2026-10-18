"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { HEADER_NAV, PROFILE, type NavItem } from "@/features/site/profile";

function isActive(pathname: string, item: NavItem) {
  // Section links (/#id) are never "current" here; the homepage link is current only at "/".
  if (item.href.includes("#")) return false;
  return pathname === item.href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold italic text-white">
            {PROFILE.initials}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-neutral-900">{PROFILE.name}</span>
            <span className="text-base text-neutral-700">{PROFILE.role}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full bg-white px-2 py-2 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03]">
            {HEADER_NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-6 py-2.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      active ? "bg-brand text-white" : "text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={PROFILE.resumeHref}
            download
            className="hidden items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:inline-flex"
          >
            Download CV
            <Icon name="tabler:download" width={22} height={22} />
          </a>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <Icon name={menuOpen ? "tabler:x" : "tabler:menu-2"} width={24} height={24} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-neutral-200 bg-white px-4 pb-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {HEADER_NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-base ${active ? "bg-brand text-white" : "text-neutral-800 hover:bg-neutral-100"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-3">
              <a
                href={PROFILE.resumeHref}
                download
                className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white"
              >
                Download CV
                <Icon name="tabler:download" width={20} height={20} />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
