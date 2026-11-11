import type { Metadata } from "next";
import Image from "next/image";
import { Kurale, Open_Sans, Plus_Jakarta_Sans } from "next/font/google";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectSlider } from "@/components/site/project-slider";
import { Icon } from "@/components/ui/icon";
import { CASE_STUDIES, type CaseStudyImage, getCaseStudy } from "@/features/site/case-studies";
import { FEATURED, PROJECTS } from "@/features/site/projects";
import { sharePreview } from "@/features/site/share";

type Props = { params: Promise<{ slug: string }> };

const heroFont = Open_Sans({ subsets: ["latin"], weight: "700" });
const headingFont = Kurale({ subsets: ["latin"], weight: "400" });
const plusJakartaFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "700"] });

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
      quality={100}
      sizes="(min-width: 1024px) 60vw, 100vw"
      className={`h-auto max-w-full ${className}`}
      style={style}
    />
  );
}

// An image with `overlay` belongs to the group of the image before it, so device mockups stack as one picture.
// Decorative art at the far right of a picture panel. It is absolutely positioned and comes first in the DOM,
// so the device images paint above it.
function PictureArt({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={374}
      height={493}
      aria-hidden="true"
      sizes="20rem"
      className="pointer-events-none absolute top-1/2 right-0 h-[90%] w-auto -translate-y-1/2"
    />
  );
}

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
          {(study.introAfterHero ? study.intro.slice(0, 1) : study.intro).map((paragraph) => (
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
          className={`relative mt-10 flex flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl ${
            study.heroPadding
              ? study.heroPadding
              : study.heroImagesFlush
                ? "px-6 pt-8 pb-0 sm:px-12 sm:pt-10"
                : study.wideImages
                  ? "px-10 py-5 sm:px-20 sm:py-8"
                  : "px-6 py-12 sm:px-12 sm:py-16"
          } ${study.heroTopTitle ? "" : "lg:flex-row lg:gap-6"}`}
          style={{ background: study.pictureBackground ?? study.heroBackground }}
        >
          <PictureArt src={study.pictureArt} />
          {study.heroTopTitle && (
            <h2
              className={`${headingFont.className} w-full text-center text-[40px] leading-none tracking-[0.05px] text-white sm:text-[52px] lg:text-[64px]`}
            >
              {study.heroTopTitle.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          )}
          {study.heroTitle && (
            <div className="flex shrink-0 flex-col gap-6">
              <h2
                className={`${study.heroTitleFont === "plus-jakarta-sans" ? plusJakartaFont.className : heroFont.className} whitespace-nowrap text-left text-[40px] leading-none tracking-[0.03px] text-white sm:text-[52px] ${
                  study.heroTitleSize === 64 ? "lg:text-[64px]" : "lg:text-[60px]"
                }`}
              >
                {study.heroTitle.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              {study.heroSubtitle && (
                <p className={`${plusJakartaFont.className} whitespace-nowrap text-base font-medium leading-none text-white`}>
                  {study.heroSubtitle.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
          {/* A phone overlay reaches about 14% past its laptop, so overlay groups are narrower to stay inside the column. */}
          <div
            className={`flex min-w-0 flex-wrap items-center justify-center gap-6 ${study.heroTitle ? "flex-1" : "w-full"} ${
              study.heroImagesFlush ? "self-end" : ""
            }`}
          >
            {groupImages(study.hero).map((group, index) => (
              <Composite
                key={group[0].src}
                images={group}
                priority={index === 0}
                className={
                  study.wideImages ? "w-full" : group.length > 1 ? "w-[85%] max-w-2xl" : "w-full max-w-2xl"
                }
              />
            ))}
          </div>
        </div>

        {study.heroParagraphs && (
          <div className="mt-16 flex flex-col gap-6">
            {study.heroParagraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {study.introAfterHero && study.intro.length > 1 && (
          <div className="mt-16 flex flex-col gap-6">
            {study.intro.slice(1).map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {study.sections.map((section, index) => (
          <section key={index} className="mt-16 flex flex-col gap-6">
            {section.heading && <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{section.heading}</h2>}
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
            {section.images.length > 0 && (
              <div
                className={`relative mt-2 items-center justify-items-center overflow-hidden rounded-3xl ${
                  section.panelPadding ?? (study.wideImages ? "px-10 py-5 sm:px-20 sm:py-8" : "p-8 sm:p-14")
                } ${
                  section.pictureBackground ?? study.pictureBackground ? "" : "bg-[#F4F0EA] dark:bg-neutral-900"
                } ${groupImages(section.images).length > 1 ? "grid gap-12 sm:grid-cols-2 sm:gap-x-16" : "flex justify-center"}`}
                style={
                  section.pictureBackground ?? study.pictureBackground
                    ? { background: section.pictureBackground ?? study.pictureBackground }
                    : undefined
                }
              >
                <PictureArt src={study.pictureArt} />
                {groupImages(section.images).map((group) => (
                  <Composite
                    key={group[0].src}
                    images={group}
                    className={
                      section.imageClassName ??
                      (group[0].frame ? "w-full max-w-4xl" : study.wideImages ? "w-full" : "w-full max-w-2xl")
                    }
                  />
                ))}
              </div>
            )}
            {section.afterImages?.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {paragraph}
              </p>
            ))}
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
          <div
            className={`mt-16 flex justify-center rounded-3xl p-6 sm:p-10 ${study.footerBackground ? "" : "bg-[#F4F0EA] dark:bg-neutral-900"}`}
            style={study.footerBackground ? { background: study.footerBackground } : undefined}
          >
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

        <section aria-labelledby="other-projects" className="mt-24 flex flex-col gap-8">
          <h2 id="other-projects" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            View Other Projects
          </h2>
          <ProjectSlider projects={[FEATURED, ...PROJECTS].filter((project) => project.href !== `/projects/${study.slug}`)} />
        </section>
      </article>
    </main>
  );
}
