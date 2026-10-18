import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Icon } from "@/components/ui/icon";
import { FOOTER_NAV, PROFILE, SOCIAL_LINKS } from "@/features/site/profile";

// Read per request so the year is never frozen at build time.
async function CopyrightYear() {
  await connection();
  return new Date().getFullYear();
}

export function SiteFooter() {
  return (
    <footer className="grain relative mt-auto bg-brand-deep text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-12 pb-6 text-center">
        <div className="flex items-center gap-4">
          <Image
            src={PROFILE.avatarSrc}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-full bg-black object-cover ring-1 ring-black/40"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xl font-bold">{PROFILE.name}</span>
            <span className="text-base text-white/85">{PROFILE.role}</span>
          </div>
        </div>

        <nav aria-label="Footer" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-[15px]">
            {FOOTER_NAV.map((item) => (
              <li key={item.href + item.label} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-white/80">
                  •
                </span>
                <Link
                  href={item.href}
                  className="hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="mt-8 flex items-center gap-6">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                aria-label={link.label}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                className="inline-flex rounded-md p-1 text-white hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Icon name={link.icon} width={30} height={30} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-white/70 px-6 py-6 text-sm text-white/90 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ©{" "}
          <Suspense fallback={null}>
            <CopyrightYear />
          </Suspense>{" "}
          {PROFILE.name}. All rights reserved.
        </p>
        <p className="flex items-center gap-2">
          <Icon name="tabler:map-pin" width={16} height={16} className="text-red-400" />
          {PROFILE.location}
        </p>
      </div>
    </footer>
  );
}
