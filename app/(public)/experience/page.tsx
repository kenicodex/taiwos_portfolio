import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/ui/icon";
import { PROFILE } from "@/features/site/profile";
import { sharePreview } from "@/features/site/share";
import { getDocument, getExperiences, getSiteProfile } from "@/features/content/queries";

export const metadata: Metadata = sharePreview({
  title: "Experience",
  path: "/experience",
  description: `Work experience of ${PROFILE.name}, a ${PROFILE.role} who has designed fintech, healthcare, gaming, logistics and enterprise products.`,
});

const CARD = "rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] sm:p-8";
const PILL = "inline-flex w-fit items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100";

async function ExperienceContent() {
  await connection();
  const [profile, page, cta, jobs] = await Promise.all([
    getSiteProfile(),
    getDocument("experience.page"),
    getDocument("experience.cta"),
    getExperiences(),
  ]);

  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Intro */}
      <section aria-labelledby="experience-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:pt-16">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-28 w-44 rounded-2xl bg-brand-light xl:block"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-brand) 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
              backgroundPosition: "18px 18px",
              opacity: 0.35,
            }}
          />
          <figure className="absolute right-0 top-0 hidden max-w-[200px] rounded-2xl bg-white dark:bg-neutral-900 p-5 text-left shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] xl:block">
            <Icon name="lucide:quote" width={28} height={28} className="ml-auto text-brand" />
            <figcaption className="mt-1 text-xs leading-5 text-neutral-700 dark:text-neutral-300">{page.quote}</figcaption>
          </figure>

          <p className={PILL}>
            <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
            {page.pill}
          </p>
          <h1 id="experience-heading" className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            {page.headingBefore} <span className="text-brand">{page.headingHighlight}</span>
          </h1>
          <p className="max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300">{page.intro}</p>
        </div>
      </section>

      {/* Roles */}
      <section aria-label="Work history" className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6">
        {jobs.map((job, index) => (
          <article key={`${index}-${job.company}`} className={CARD}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">{job.company}</h2>
                <p className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  <Icon name="lucide:briefcase" width={16} height={16} className="text-neutral-700 dark:text-neutral-300" />
                  {job.role}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                {job.location && (
                  <p className="text-xs font-semibold italic text-neutral-900 dark:text-neutral-100">{job.location}</p>
                )}
                <p className="rounded-xl bg-brand-light px-4 py-2 text-sm font-semibold italic text-neutral-900 dark:text-neutral-100">
                  {job.period}
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {job.points.map((point, pointIndex) => (
                <li key={pointIndex} className="flex items-start gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  <Icon name="akar-icons:circle-check-fill" width={18} height={18} className="mt-1 shrink-0 text-brand" />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="experience-cta-heading" className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-brand-light p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <Image
              src={profile.avatarSrc}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full bg-black object-cover"
            />
            <div className="flex flex-col gap-1">
              <h2 id="experience-cta-heading" className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                {cta.heading}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{cta.body}</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {cta.buttonLabel}
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ExperiencePage() {
  return (
    <Suspense fallback={null}>
      <ExperienceContent />
    </Suspense>
  );
}
