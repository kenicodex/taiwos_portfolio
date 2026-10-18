import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PROFILE } from "@/features/site/profile";
import { sharePreview } from "@/features/site/share";

export const metadata: Metadata = sharePreview({
  title: "Projects",
  path: "/projects",
  description:
    "A collection of product design projects that show how I solve complex problems through research, strategy and thoughtful design.",
});

type Project = {
  title: string;
  category: string;
  summary: string;
  /** Cover image in /public/work. Omit to show a branded placeholder instead. */
  cover?: { src: string; width: number; height: number };
  /** Used for the placeholder background when there is no cover image. */
  placeholder: string;
  href: string;
};

const FEATURED: Project & { role: string; duration: string; summary: string } = {
  title: "WovenRemit",
  category: "Fintech",
  role: "Product Designer",
  duration: "4 Months",
  summary: "Redesigned a remittance platform to simplify money transfers and improve user trust and engagement.",
  cover: { src: "/work/woven-remit.png", width: 617, height: 477 },
  placeholder: "#0F1A14",
  href: "/contact",
};

const PROJECTS: Project[] = [
  {
    title: "Office One AI",
    category: "AI/SaaS",
    summary: "Designed an AI-powered platform that streamlines collaboration, knowledge sharing and productivity.",
    cover: { src: "/work/office-one-ai.png", width: 393, height: 309 },
    placeholder: "#3E4A3A",
    href: "/contact",
  },
  {
    title: "DeltaLine Transport",
    category: "Transport Service",
    summary: "Built a transport management system that helps organisations easily book trips and monitor, access and mitigate risks.",
    placeholder: "#1D4A7A",
    href: "/contact",
  },
  {
    title: "SMATVIRTUAL",
    category: "Gaming",
    summary: "Designed dashboards that give game providers real-time insights and improve user gaming experience.",
    cover: { src: "/work/smatvirtual.png", width: 393, height: 309 },
    placeholder: "#0B1B2E",
    href: "/contact",
  },
  {
    title: "SportsDey",
    category: "Blog & Gaming",
    summary: "Created a sports news and betting experience focused on engagement, discovery and user retention.",
    placeholder: "#14361F",
    href: "/contact",
  },
  {
    title: "TrustComply",
    category: "RegTech",
    summary: "Built a compliance management system that helps organisations monitor, access and mitigate risks.",
    placeholder: "#111133",
    href: "/contact",
  },
  {
    title: "DP Logistics",
    category: "Logistics",
    summary: "Designed an end-to-end delivery management experience for riders, customers and fleet managers.",
    cover: { src: "/work/dp-logistics.png", width: 393, height: 309 },
    placeholder: "#1A3F8C",
    href: "/contact",
  },
];

const CARD = "flex flex-col overflow-hidden rounded-3xl bg-[#FFFCF9] dark:bg-neutral-900 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)]";
const CASE_STUDY_LINK =
  "inline-flex w-fit items-center gap-2 text-[15px] font-medium text-neutral-900 dark:text-neutral-100 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function Cover({ project, className = "" }: { project: Project; className?: string }) {
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

export default function ProjectsPage() {
  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <section aria-labelledby="projects-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              My Projects
            </p>
            <h1 id="projects-heading" className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
              Recent Projects
            </h1>
            <p className="max-w-xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
              A collection of product design projects that demonstrate how I solve complex problems through research,
              strategy and thoughtful design.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href={PROFILE.resumeHref}
              download
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Download Resume
              <Icon name="lucide:download" width={18} height={18} />
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-brand px-7 text-[15px] font-medium text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Let&apos;s Connect
              <Icon name="lucide:arrow-right" width={18} height={18} />
            </Link>
          </div>
        </div>

        {/* Featured project */}
        <article className="mt-12 grid overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-[#FFFCF9] dark:bg-neutral-900 lg:grid-cols-2">
          <Cover project={FEATURED} className="min-h-72 lg:min-h-[28rem]" />
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <p className="text-sm font-medium uppercase tracking-wider text-brand">{FEATURED.category}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">{FEATURED.title}</h2>
            <ul className="flex flex-wrap gap-6 text-sm text-neutral-800 dark:text-neutral-200">
              <li className="flex items-center gap-2">
                <Icon name="lucide:landmark" width={18} height={18} className="text-brand" />
                {FEATURED.category}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="lucide:user-round" width={18} height={18} className="text-brand" />
                {FEATURED.role}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="lucide:clock" width={18} height={18} className="text-brand" />
                {FEATURED.duration}
              </li>
            </ul>
            <p className="max-w-md text-lg leading-8 text-neutral-700 dark:text-neutral-300">{FEATURED.summary}</p>
            <Link href={FEATURED.href} className={CASE_STUDY_LINK}>
              View Case Study
              <Icon name="lucide:arrow-right" width={18} height={18} />
            </Link>
          </div>
        </article>

        {/* Project grid */}
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <li key={project.title}>
              <article className={`${CARD} h-full`}>
                <Cover project={project} className="aspect-[393/309]" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-sm font-medium uppercase tracking-wider text-brand">{project.category}</p>
                  <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">{project.title}</h2>
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{project.summary}</p>
                  <Link href={project.href} className={`${CASE_STUDY_LINK} mt-auto pt-4`}>
                    View Case Study
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
              Interested in working together?
            </h2>
            <p className="text-base text-white/85">Let&apos;s create products that solve real problems and deliver meaningful experiences.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-[#FFFCF9] dark:bg-neutral-900 px-7 text-[15px] font-medium text-neutral-900 dark:text-neutral-100 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact me
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
