import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SOCIAL_LINKS } from "@/features/site/profile";
import type { ReactNode } from "react";
import type { BlockConfigMap, BlockStyle, SpacerConfig } from "../blocks/types";

/** Published data a block may display. Loaded server-side and passed in; never fetched by blocks themselves. */
export type BlockData = {
  projects: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: string;
    featured: boolean;
    coverSrc: string | null;
  }[];
  skills: { id: string; name: string; category: string }[];
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string;
  }[];
};

export type BlockRenderProps<K extends keyof BlockConfigMap> = {
  id: string;
  config: BlockConfigMap[K];
  style: BlockStyle;
  data: BlockData;
};

// Style tokens map to fixed class strings. Stored data selects a token; it never supplies CSS.
const BACKGROUND_CLASS: Record<BlockStyle["background"], string> = {
  default: "bg-background text-foreground",
  muted: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
  inverse: "bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950",
};

const PADDING_CLASS: Record<BlockStyle["paddingY"], string> = {
  none: "py-0",
  sm: "py-8",
  md: "py-16",
  lg: "py-24",
};

const SPACER_CLASS: Record<SpacerConfig["size"], string> = {
  sm: "h-6",
  md: "h-12",
  lg: "h-24",
};

function Section({
  id,
  style,
  children,
  labelled = true,
}: {
  id: string;
  style: BlockStyle;
  children: ReactNode;
  labelled?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelled ? `${id}-heading` : undefined}
      className={`${BACKGROUND_CLASS[style.background]} ${PADDING_CLASS[style.paddingY]}`}
    >
      <div
        className={`mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 ${
          style.align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function Heading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={`${id}-heading`} className="text-3xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className={`max-w-2xl text-lg leading-8 opacity-80 ${className}`}>
        {paragraph}
      </p>
    ));
}

function isInternalHref(href: string) {
  return href.startsWith("/");
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";
  if (!href) return null;
  return isInternalHref(href) ? (
    <Link href={href} className={className}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className} rel="noopener noreferrer">
      {label}
    </a>
  );
}

/** Splits "*word*" markers into brand-coloured spans. Only plain text is produced, never markup. */
function Emphasis({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-brand">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function PillLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}) {
  if (!href || !label) return null;
  const className =
    variant === "primary"
      ? "bg-brand text-white hover:opacity-90"
      : "border border-brand text-brand hover:bg-brand/5";
  const base =
    "inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  const content = (
    <>
      {label}
      <Icon name="lucide:arrow-right" width={18} height={18} />
    </>
  );
  return isInternalHref(href) ? (
    <Link href={href} className={`${base} ${className}`}>
      {content}
    </Link>
  ) : (
    <a href={href} rel="noopener noreferrer" className={`${base} ${className}`}>
      {content}
    </a>
  );
}

export function HeroBlock({ id, config }: BlockRenderProps<"hero">) {
  const c = config;
  const connect = c.showConnect ? SOCIAL_LINKS.filter((link) => link.label !== "Dribbble") : [];
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="flex flex-col gap-7">
          {c.eyebrow && (
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              {c.eyebrow}
            </p>
          )}
          <h1
            id={`${id}-heading`}
            className="text-4xl font-semibold leading-[1.15] tracking-tight text-neutral-950 sm:text-5xl lg:text-[56px]"
          >
            <Emphasis text={c.headline} />
          </h1>
          {c.subheadline && <p className="max-w-xl text-lg leading-8 text-neutral-700">{c.subheadline}</p>}
          <div className="flex flex-wrap gap-4">
            <PillLink href={c.primaryCtaHref} label={c.primaryCtaLabel} variant="primary" />
            <PillLink href={c.secondaryCtaHref} label={c.secondaryCtaLabel} variant="secondary" />
          </div>
          {connect.length > 0 && (
            <div className="flex items-center gap-6 pt-2">
              <span className="font-medium text-neutral-950">Let&apos;s connect</span>
              <ul className="flex items-center gap-5">
                {connect.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      aria-label={link.label}
                      className="inline-flex rounded-md text-neutral-900 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <Icon name={link.icon} width={28} height={28} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F4F0EA]">
            <div
              aria-hidden="true"
              className="absolute right-10 top-10 h-32 w-32"
              style={{
                backgroundImage: "radial-gradient(circle, #CFC6BA 3px, transparent 3.5px)",
                backgroundSize: "24px 24px",
              }}
            />
            {c.imageSrc && (
              <Image
                src={c.imageSrc}
                alt={c.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 36rem, 90vw"
                className="object-contain object-bottom mix-blend-multiply"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutBlock({ id, config, style }: BlockRenderProps<"about">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      <Paragraphs text={c.body} />
    </Section>
  );
}

export function ProjectsBlock({ id, config, data }: BlockRenderProps<"projects">) {
  const c = config;
  const items = data.projects.filter((project) => !c.featuredOnly || project.featured).slice(0, c.limit);
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-brand py-16 text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            {c.eyebrow && <p className="text-base text-white/85">{c.eyebrow}</p>}
            <h2 id={`${id}-heading`} className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {c.heading}
            </h2>
          </div>
          {c.viewAllHref && c.viewAllLabel && (
            <Link
              href={c.viewAllHref}
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#FFFBF5] px-7 text-[15px] font-medium text-neutral-900 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {c.viewAllLabel}
              <Icon name="lucide:arrow-right" width={18} height={18} />
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-white/85">No projects published yet.</p>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((project) => (
              <li key={project.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#FFFCF7] text-neutral-900 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[4/3] bg-neutral-200">
                    {project.coverSrc && (
                      <Image
                        src={project.coverSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    {project.category && (
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        {project.category}
                      </p>
                    )}
                    <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
                    <p className="flex-1 leading-7 text-neutral-700">{project.summary}</p>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="mt-2 inline-flex w-fit items-center gap-2 rounded-md font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      View Case Study
                      <Icon name="lucide:arrow-right" width={18} height={18} />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function SkillsBlock({ id, config, style, data }: BlockRenderProps<"skills">) {
  const c = config;
  const groups = Map.groupBy(data.skills, (skill) => skill.category);
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      {groups.size === 0 ? (
        <p className="opacity-70">No skills published yet.</p>
      ) : (
        <div className="grid w-full gap-6 sm:grid-cols-2">
          {[...groups].map(([category, skills]) => (
            <div key={category}>
              <h3 className="font-semibold">{category}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill.id} className="rounded-full border border-current/15 px-3 py-1 text-sm">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function ExperienceBlock({ id, config, style, data }: BlockRenderProps<"experience">) {
  const c = config;
  const items = data.experience.slice(0, c.limit);
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      {items.length === 0 ? (
        <p className="opacity-70">No experience published yet.</p>
      ) : (
        <ol className="flex w-full flex-col gap-6">
          {items.map((job) => (
            <li key={job.id} className="border-l-2 border-current/20 pl-6">
              <h3 className="text-xl font-semibold">
                {job.role} · {job.company}
              </h3>
              <p className="text-sm opacity-70">
                {job.startDate} – {job.isCurrent ? "Present" : (job.endDate ?? "")}
              </p>
              {job.description && <p className="mt-2 opacity-80">{job.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

export function EducationBlock({ id, config, style }: BlockRenderProps<"education">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      <ul className="flex w-full flex-col gap-4">
        {c.items.map((item, index) => (
          <li key={index} className="rounded-2xl border border-current/10 p-6">
            <h3 className="font-semibold">{item.institution}</h3>
            <p className="opacity-80">
              {item.qualification}
              {item.year && ` · ${item.year}`}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ServicesBlock({ id, config, style }: BlockRenderProps<"services">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      <ul className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.items.map((item, index) => (
          <li key={index} className="rounded-2xl border border-current/10 p-6">
            <h3 className="font-semibold">{item.title}</h3>
            {item.description && <p className="mt-2 opacity-80">{item.description}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function TestimonialsBlock({ id, config, style }: BlockRenderProps<"testimonials">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      <ul className="grid w-full gap-4 sm:grid-cols-2">
        {c.items.map((item, index) => (
          <li key={index} className="rounded-2xl border border-current/10 p-6">
            <blockquote className="text-lg leading-7">“{item.quote}”</blockquote>
            <p className="mt-4 text-sm opacity-80">
              {item.author}
              {item.role && `, ${item.role}`}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const STAT_TONE = "bg-[#F4F0EA] text-neutral-900";

export function StatisticsBlock({ id, config }: BlockRenderProps<"statistics">) {
  const c = config;
  if (c.items.length === 0) return null;
  return (
    <section
      id={id}
      aria-label="Key figures"
      className="relative z-10 bg-background px-4 pb-16 lg:-mt-40 lg:px-0"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-8 rounded-3xl bg-white p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.04] sm:grid-cols-2 sm:p-10 lg:grid-cols-4 lg:gap-0 lg:p-10">
        {c.items.map((item, index) => (
          <li
            key={index}
            className={`flex flex-col gap-4 lg:px-8 ${index > 0 ? "lg:border-l lg:border-neutral-200" : ""}`}
          >
            <span className={`flex size-12 items-center justify-center rounded-xl ${STAT_TONE}`}>
              <Icon name={`lucide:${item.icon}`} width={22} height={22} />
            </span>
            <span className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
              {item.value}
            </span>
            <span className="font-semibold text-neutral-950">{item.label}</span>
            {item.description && (
              <span className="text-sm leading-6 text-neutral-600">{item.description}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ContactBlock({ id, config, style }: BlockRenderProps<"contact">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      {c.body && <p className="max-w-2xl text-lg leading-8 opacity-80">{c.body}</p>}
      {c.email && (
        <a href={`mailto:${c.email}`} className="text-lg font-medium underline underline-offset-4">
          {c.email}
        </a>
      )}
    </Section>
  );
}

export function SocialLinksBlock({ id, config, style }: BlockRenderProps<"social_links">) {
  const c = config;
  if (c.links.length === 0) return null;
  return (
    <Section id={id} style={style} labelled={false}>
      <ul className="flex flex-wrap gap-4">
        {c.links.map((link, index) => (
          <li key={index}>
            <a
              href={link.url}
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function RichTextBlock({ id, config, style }: BlockRenderProps<"rich_text">) {
  const c = config;
  return (
    <Section id={id} style={style} labelled={false}>
      <Paragraphs text={c.content} />
    </Section>
  );
}

export function CallToActionBlock({ id, config, style }: BlockRenderProps<"call_to_action">) {
  const c = config;
  return (
    <Section id={id} style={style}>
      <Heading id={id}>{c.heading}</Heading>
      {c.body && <p className="max-w-2xl text-lg leading-8 opacity-80">{c.body}</p>}
      <ButtonLink href={c.buttonHref} label={c.buttonLabel} />
    </Section>
  );
}

export function SpacerBlock({ id, config }: BlockRenderProps<"spacer">) {
  const c = config;
  return <div id={id} aria-hidden="true" className={SPACER_CLASS[c.size]} />;
}
