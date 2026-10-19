import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Icon } from "@/components/ui/icon";
import { sharePreview } from "@/features/site/share";
import { getCaseStudy, type CaseStudy } from "@/features/content/queries";
import { checkSlug } from "@/features/pages/slug";

type Props = { params: Promise<{ slug: string }> };

// Blocking render, as for the CMS page route: projects come from the database and are not pre-built.
export const instant = false;

// The lookup happens before anything streams, so a missing project gets a real 404 status.
async function loadProject({ params }: Props): Promise<CaseStudy> {
  await connection();
  const { slug } = await params;
  if (!checkSlug(slug).valid) notFound();
  const project = await getCaseStudy(slug);
  if (!project) notFound();
  return project;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const project = await loadProject(props);
  const { slug } = await props.params;
  return sharePreview({ title: project.title, path: `/projects/${slug}`, description: project.summary });
}

export default async function CaseStudyPage(props: Props) {
  const project = await loadProject(props);

  const paragraphs = project.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-16">
        <Link href="/projects" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-neutral-700 hover:text-brand dark:text-neutral-300">
          <Icon name="lucide:arrow-left" width={16} height={16} />
          All projects
        </Link>

        <header className="flex flex-col gap-4">
          {project.category && <p className="text-sm font-medium uppercase tracking-wider text-brand">{project.category}</p>}
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{project.title}</h1>
          <ul className="flex flex-wrap gap-6 text-sm text-neutral-800 dark:text-neutral-200">
            {project.role && (
              <li className="flex items-center gap-2">
                <Icon name="lucide:user-round" width={18} height={18} className="text-brand" />
                {project.role}
              </li>
            )}
            {project.duration && (
              <li className="flex items-center gap-2">
                <Icon name="lucide:clock" width={18} height={18} className="text-brand" />
                {project.duration}
              </li>
            )}
          </ul>
          <p className="max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">{project.summary}</p>
        </header>

        {project.coverSrc && (
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={project.coverSrc}
              alt={`${project.title} cover`}
              fill
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="flex max-w-2xl flex-col gap-4 text-base leading-7 text-neutral-800 dark:text-neutral-200">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {project.caseStudyUrl && (
          <a
            href={project.caseStudyUrl}
            rel="noopener noreferrer"
            className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            View the live project
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </a>
        )}
      </article>
    </main>
  );
}
