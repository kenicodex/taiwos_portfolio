import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/features/site/projects";

export const CARD = "flex flex-col overflow-hidden rounded-3xl bg-[#FFFCF9] dark:bg-neutral-900 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)]";

export const CASE_STUDY_LINK =
  "inline-flex w-fit items-center gap-2 text-[15px] font-medium text-neutral-900 dark:text-neutral-100 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function Cover({ project, className = "" }: { project: Project; className?: string }) {
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


/** A project card: cover, category, title, summary and a link to its case study. */
export function ProjectCard({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <article className={`${CARD} h-full ${className}`}>
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
  );
}
