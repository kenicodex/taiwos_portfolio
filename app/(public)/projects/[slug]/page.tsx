import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { CASE_STUDIES, type CaseStudyImage, getCaseStudy } from "@/features/site/case-studies";
import { sharePreview } from "@/features/site/share";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return sharePreview({ title: study.title, path: `/projects/${study.slug}`, description: study.summary });
}

function Figure({
  image,
  priority = false,
  className = "",
  style,
}: {
  image: CaseStudyImage;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      priority={priority}
      sizes="(min-width: 1024px) 60vw, 100vw"
      className={`h-auto max-w-full ${className}`}
      style={style}
    />
  );
}

// An image with `overlay` belongs to the group of the image before it, so device mockups stack as one picture.
function groupImages(images: CaseStudyImage[]) {
  return images.reduce<CaseStudyImage[][]>((groups, image) => {
    if (image.overlay && groups.length > 0) groups[groups.length - 1].push(image);
    else groups.push([image]);
    return groups;
  }, []);
}

// Stacks a group's images. Without a `frame` the first image sets the box; with one, the box has the frame's aspect
// and every image is placed inside it.
function Composite({ images, priority = false, className = "" }: { images: CaseStudyImage[]; priority?: boolean; className?: string }) {
  const [base, ...overlays] = images;
  const frame = base.frame;
  return (
    <div className={`relative ${className}`} style={frame ? { aspectRatio: frame.aspect } : undefined}>
      {frame ? (
        <Figure
          image={base}
          priority={priority}
          className="absolute"
          style={{ left: frame.left, top: frame.top, width: frame.width }}
        />
      ) : (
        <Figure image={base} priority={priority} className="block w-full" />
      )}
      {overlays.map((image) => (
        <Figure
          key={image.src}
          image={image}
          className="absolute drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
          style={{ left: image.overlay?.left, top: image.overlay?.top, width: image.overlay?.width }}
        />
      ))}
    </div>
  );
}

// Blocking route: the slug is checked before streaming starts, so unknown slugs get a real 404 status.
export const instant = false;

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/projects"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <Icon name="lucide:arrow-left" width={16} height={16} />
          All Projects
          <span aria-hidden="true" className="text-neutral-400">
            /
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">{study.title}</span>
        </Link>

        <header className="mt-8 flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{study.title}</h1>
          {study.intro.map((paragraph) => (
            <p key={paragraph} className="max-w-3xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              {paragraph}
            </p>
          ))}
          <ul className="flex flex-wrap gap-6 text-sm text-neutral-800 dark:text-neutral-200">
            <li className="flex items-center gap-2">
              <Icon name="lucide:landmark" width={18} height={18} className="text-brand" />
              {study.category}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="lucide:user-round" width={18} height={18} className="text-brand" />
              {study.role}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="lucide:clock" width={18} height={18} className="text-brand" />
              {study.duration}
            </li>
          </ul>
        </header>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-3xl px-6 py-12 sm:px-12 sm:py-16"
          style={{ backgroundColor: study.heroBackground }}
        >
          {groupImages(study.hero).map((group, index) => (
            <Composite key={group[0].src} images={group} priority={index === 0} className="w-full max-w-2xl" />
          ))}
        </div>

        {study.sections.map((section) => (
          <section key={section.heading} className="mt-16 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
            {section.images.length > 0 && (
              <div
                className={`mt-2 items-center justify-items-center gap-8 rounded-3xl bg-[#F4F0EA] p-6 sm:p-10 dark:bg-neutral-900 ${
                  groupImages(section.images).length > 1 ? "grid sm:grid-cols-2" : "flex justify-center"
                }`}
              >
                {groupImages(section.images).map((group) => (
                  <Composite
                    key={group[0].src}
                    images={group}
                    className={group[0].frame ? "w-full max-w-4xl" : "w-full max-w-2xl"}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {study.closing.length > 0 && (
          <div className="mt-16 flex flex-col gap-6">
            {study.closing.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {study.footerImage && (
          <div className="mt-16 flex justify-center rounded-3xl bg-[#F4F0EA] p-6 sm:p-10 dark:bg-neutral-900">
            <Figure image={study.footerImage} className="max-h-96" />
          </div>
        )}

        <div className="mt-20 flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-brand px-7 text-[15px] font-medium text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon name="lucide:arrow-left" width={18} height={18} />
            Back to Projects
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Let&apos;s Connect
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </Link>
        </div>
      </article>
    </main>
  );
}
