import Link from "next/link";
import { connection } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, experiences, media, projects, skills } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin-session";
import { env } from "@/lib/env";
import { PageHeader, CARD } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdminPage();
  await connection();

  const [unread, projectCount, experienceCount, toolCount, mediaCount] = await Promise.all([
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(experiences),
    db.select({ value: count() }).from(skills),
    db.select({ value: count() }).from(media),
  ]);

  // Only whether each feature is configured is shown. The values themselves are never sent to the browser.
  const setup = [
    { ok: Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL), label: "Contact email notifications", hint: "Set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL." },
    { ok: Boolean(env.BLOB_READ_WRITE_TOKEN), label: "File uploads", hint: "Set BLOB_READ_WRITE_TOKEN." },
  ];
  const missing = setup.filter((item) => !item.ok);

  const stats = [
    { label: "New messages", value: unread[0]?.value ?? 0, href: "/admin/messages" },
    { label: "Projects", value: projectCount[0]?.value ?? 0, href: "/admin/projects" },
    { label: "Experience roles", value: experienceCount[0]?.value ?? 0, href: "/admin/experience" },
    { label: "Tools & skills", value: toolCount[0]?.value ?? 0, href: "/admin/tools" },
    { label: "Files", value: mediaCount[0]?.value ?? 0, href: "/admin/media" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" description="Edit what visitors see on the site. Changes to the copy and lists go live on save." />

      {missing.length > 0 && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Some features are not set up yet:</p>
          <ul className="mt-1 list-disc pl-5">
            {missing.map((item) => (
              <li key={item.label}>
                {item.label}. {item.hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className={`${CARD} block transition-shadow hover:shadow-md`}>
              <p className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="quick-links" className="flex flex-col gap-3">
        <h2 id="quick-links" className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Start here
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link href="/admin/content/about.intro" className={`${CARD} block`}>
              <span className="font-medium">About page</span>
              <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">Intro, section titles and closing banner</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className={`${CARD} block`}>
              <span className="font-medium">Site settings</span>
              <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">Name, navigation, social links and brand colour</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/messages" className={`${CARD} block`}>
              <span className="font-medium">Messages</span>
              <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">Contact form submissions</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/media" className={`${CARD} block`}>
              <span className="font-medium">Media</span>
              <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">Upload the CV, covers and logos</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
