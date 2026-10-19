import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/ui/icon";
import { sharePreview } from "@/features/site/share";
import { getDocument, getProjectsPage, getSiteProfile, type ProjectCard } from "@/features/content/queries";

export const metadata: Metadata = sharePreview({
  title: "Projects",
  path: "/projects",
  description:
    "A collection of product design projects that show how I solve complex problems through research, strategy and thoughtful design.",
});

const CARD = "flex flex-col overflow-hidden rounded-3xl bg-[#FFFCF9] dark:bg-neutral-900 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)]";
const CASE_STUDY_LINK =
  "inline-flex w-fit items-center gap-2 text-[15px] font-medium text-neutral-900 dark:text-neutral-100 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function Cover({ project, className = "" }: { project: ProjectCard; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: project.placeholder }}>
      {project.cover ? (
        <Image
          src={project.cover.src}
          alt={`${project.title} cover`}
          width={project.cover.width}
          height={project.cover.height}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center p-6 text-center text-xl font-semibold text-white/90">
          {project.title}
        </div>
      )}
    </div>
  );
}

async function ProjectsContent() {
  await connection();
  const [profile, page, cta, { featured, list }] = await Promise.all([
    getSiteProfile(),
    getDocument("projects.page"),
    getDocument("projects.cta"),
    getProjectsPage(),
  ]);

  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <section aria-labelledby="projects-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              {page.pill}
            </p>
            <h1 id="projects-heading" className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
              {page.heading}
            </h1>
            <p className="max-w-xl text-base leading-7 text-neutral-700 dark:text-neutral-300">{page.intro}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href={profile.resumeHref}
              download
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {page.resumeLabel}
              <Icon name="lucide:download" width={18} height={18} />
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-brand px-7 text-[15px] font-medium text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {page.connectLabel}
              <Icon name="lucide:arrow-right" width={18} height={18} />
            </Link>
          </div>
        </div>

        {/* Featured project */}
        <article className="mt-12 grid overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-[#FFFCF9] dark:bg-neutral-900 lg:grid-cols-2">
          <Cover project={featured} className="min-h-72 lg:min-h-[28rem]" />
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <p className="text-sm font-medium uppercase tracking-wider text-brand">{featured.category}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">{featured.title}</h2>
            <ul className="flex flex-wrap gap-6 text-sm text-neutral-800 dark:text-neutral-200">
              <li className="flex items-center gap-2">
                <Icon name="lucide:landmark" width={18} height={18} className="text-brand" />
                {featured.category}
              </li>
              {featured.role && (
                <li className="flex items-center gap-2">
                  <Icon name="lucide:user-round" width={18} height={18} className="text-brand" />
                  {featured.role}
                </li>
              )}
              {featured.duration && (
                <li className="flex items-center gap-2">
                  <Icon name="lucide:clock" width={18} height={18} className="text-brand" />
                  {featured.duration}
                </li>
              )}
            </ul>
            <p className="max-w-md text-lg leading-8 text-neutral-700 dark:text-neutral-300">{featured.summary}</p>
            <Link href={featured.href} className={CASE_STUDY_LINK}>
              {page.caseStudyLabel}
              <Icon name="lucide:arrow-right" width={18} height={18} />
            </Link>
          </div>
        </article>

        {/* Project grid */}
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <li key={project.href}>
              <article className={`${CARD} h-full`}>
                <Cover project={project} className="aspect-[393/309]" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-sm font-medium uppercase tracking-wider text-brand">{project.category}</p>
                  <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">{project.title}</h2>
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{project.summary}</p>
                  <Link href={project.href} className={`${CASE_STUDY_LINK} mt-auto pt-4`}>
                    {page.caseStudyLabel}
                    <Icon name="lucide:arrow-right" width={18} height={18} />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="projects-cta" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-brand-deep to-brand p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex flex-col gap-2">
            <h2 id="projects-cta" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {cta.heading}
            </h2>
            <p className="text-base text-white/85">{cta.body}</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-[#FFFCF9] dark:bg-neutral-900 px-7 text-[15px] font-medium text-neutral-900 dark:text-neutral-100 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {cta.buttonLabel}
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
