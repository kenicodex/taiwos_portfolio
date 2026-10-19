import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/ui/icon";
import { PROFILE } from "@/features/site/profile";
import { sharePreview } from "@/features/site/share";
import { getCollection, getDocument, getSiteProfile, getTools } from "@/features/content/queries";

export const metadata: Metadata = sharePreview({
  title: "About",
  path: "/about",
  description: `Learn about ${PROFILE.name}, a ${PROFILE.role} designing products across Fintech, AI, Healthcare, Logistics, iGaming and enterprise software.`,
});

const CARD = "rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] sm:p-8";
const EYEBROW = "text-sm font-medium text-brand";

async function AboutContent() {
  await connection();
  const [profile, intro, sections, cta, services, processSteps, journey, tools, industries, funFacts] = await Promise.all([
    getSiteProfile(),
    getDocument("about.intro"),
    getDocument("about.sections"),
    getDocument("about.cta"),
    getCollection("about.services"),
    getCollection("about.process"),
    getCollection("about.journey"),
    getTools(),
    getCollection("about.industries"),
    getCollection("about.funFacts"),
  ]);
  const processColumns = [
    processSteps.filter((step) => step.column === "left"),
    processSteps.filter((step) => step.column === "right"),
  ];

  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Intro */}
      <section aria-labelledby="about-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col gap-7 lg:order-1">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white dark:bg-neutral-900 px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 shadow-sm">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              {intro.pill}
            </p>
            <h1
              id="about-heading"
              className="text-4xl font-semibold leading-[1.15] tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl lg:text-[56px]"
            >
              {intro.headingBefore}{" "}
              <span className="text-brand">{intro.headingHighlight}</span>
            </h1>
            <div className="flex max-w-xl flex-col gap-4 text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              {intro.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={profile.resumeHref}
                download
                className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {intro.resumeLabel}
                <Icon name="lucide:download" width={18} height={18} />
              </a>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-brand px-7 text-[15px] font-medium text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {intro.connectLabel}
                <Icon name="lucide:arrow-right" width={18} height={18} />
              </Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#FFFCF9] dark:bg-neutral-900">
              <Image
                src="/hero/headshot.png"
                alt={profile.name}
                fill
                priority
                sizes="(min-width: 1024px) 36rem, 90vw"
                className="object-contain object-bottom mix-blend-multiply"
              />
            </div>
            <div className="absolute right-4 top-4 z-20 flex flex-col rounded-2xl bg-white dark:bg-neutral-900 px-5 py-4 shadow-lg sm:right-auto sm:-left-10 sm:top-auto sm:bottom-10">
              <span className="inline-flex items-center gap-1 text-brand">
                <Icon name="lucide:map-pin" width={18} height={18} />
                <span className="text-xs">{intro.basedInLabel}</span>
              </span>
              <span className="text-base font-semibold text-neutral-950 dark:text-neutral-50">{intro.basedInValue}</span>
            </div>
          </div>
        </div>
      </section>

      {/* What I do best */}
      <section aria-labelledby="services-heading" className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6">
        <div className={CARD}>
          <p id="services-heading" className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {sections.services}
          </p>
          <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {services.map((service, index) => (
              <li
                key={`${index}-${service.title}`}
                className={`flex flex-col gap-4 lg:px-6 ${index > 0 ? "lg:border-l lg:border-neutral-200 dark:border-neutral-800" : ""}`}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Icon name={service.icon} width={22} height={22} />
                </span>
                <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">{service.title}</h2>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{service.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process + journey */}
      <section aria-label="Process and journey" className="mx-auto grid w-full max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-2">
        <div className={CARD}>
          <h2 className={`${EYEBROW} text-base`}>{sections.process}</h2>
          <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {processColumns.map((column, columnIndex) => (
              <ol key={columnIndex} className="flex flex-col gap-8">
                {column.map((step, index) => (
                  <li key={`${index}-${step.title}`} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                      <Icon name={step.icon} width={20} height={20} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-neutral-950 dark:text-neutral-50">{step.title}</h3>
                      <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <h2 className={`${EYEBROW} text-base`}>{sections.journey}</h2>
          <ol className="mt-6 flex flex-col">
            {journey.map((entry, index) => (
              <li key={`${index}-${entry.year}`} className="relative grid grid-cols-[7.5rem_1fr] gap-4 pb-8 last:pb-0">
                <span aria-hidden="true" className="absolute top-2 bottom-0 left-[0.3rem] w-px bg-neutral-200 dark:bg-neutral-700 last:hidden" />
                <span className="relative flex flex-col gap-1 pl-6 font-semibold text-neutral-950 dark:text-neutral-50">
                  <span aria-hidden="true" className="absolute top-1.5 left-0 size-2.5 rounded-full bg-brand" />
                  {entry.year}
                  {entry.current && (
                    <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">• present</span>
                  )}
                </span>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{entry.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tools + industries */}
      <section aria-label="Tools and industries" className="mx-auto grid w-full max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-2">
        <div className={CARD}>
          <h2 className={`${EYEBROW} text-base`}>{sections.tools}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">{sections.toolsDesign}</h3>
              <ul className="flex flex-col gap-3">
                {tools.design.map((tool) => (
                  <li key={tool.name} className="flex items-center gap-4 text-[15px] text-neutral-900 dark:text-neutral-100">
                    {tool.src && (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-neutral-900 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03]">
                        <Image src={tool.src} alt="" width={32} height={32} className="size-8 object-contain" />
                      </span>
                    )}
                    {tool.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">{sections.toolsResearch}</h3>
              <ul className="flex flex-wrap gap-2">
                {tools.research.map((tool) => (
                  <li key={tool} className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-[15px] text-neutral-900 dark:text-neutral-100">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="mt-8 text-sm font-semibold text-neutral-950 dark:text-neutral-50">{sections.toolsCollaboration}</h3>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.collaboration.map((tool) => (
              <li
                key={tool.name}
                className="flex h-20 items-center justify-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 text-xl font-medium text-neutral-950 dark:text-neutral-50 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.12)]"
              >
                {tool.src && <Image src={tool.src} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />}
                {tool.name}
              </li>
            ))}
          </ul>
        </div>

        <div className={CARD}>
          <h2 className={`${EYEBROW} text-base`}>{sections.industries}</h2>
          <ul className="mt-6 grid grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <li
                key={`${index}-${industry.name}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 px-3 py-6 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white dark:bg-neutral-900 text-brand shadow-md">
                  <Icon name={industry.icon} width={26} height={26} />
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{industry.name}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-semibold text-neutral-950 dark:text-neutral-50">{sections.funFacts}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {funFacts.map((fact, index) => (
              <li key={`${index}-${fact.text}`} className="flex items-start gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <Icon name="akar-icons:circle-check-fill" width={18} height={18} className="mt-1 shrink-0 text-brand" />
                {fact.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="cta-heading" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <Image
              src={profile.avatarSrc}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full bg-black object-cover"
            />
            <div className="flex flex-col gap-1">
              <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
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

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}
