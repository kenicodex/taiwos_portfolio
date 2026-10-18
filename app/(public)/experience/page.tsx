import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PROFILE } from "@/features/site/profile";
import { sharePreview } from "@/features/site/share";

export const metadata: Metadata = sharePreview({
  title: "Experience",
  path: "/experience",
  description: `Work experience of ${PROFILE.name}, a ${PROFILE.role} who has designed fintech, healthcare, gaming, logistics and enterprise products.`,
});

const JOBS = [
  {
    company: "Lordwin Group",
    role: "Game & Product UI/UX Designer",
    location: "Remote",
    period: "Mar 2025 - Present",
    points: [
      "Designed web and mobile experiences that streamlined logistics workflows, reduced manual tasks, and improved operational efficiency, with designs successfully handed off to developers.",
      "Redesigned a transport service ecosystem across mobile apps, web applications, and an administrative back-office, simplifying booking flows, reducing manual work, and improving operational visibility.",
      "Improved gameplay clarity, color contrast, and responsive layouts across digital games built for business clients, creating more intuitive and accessible gaming experiences.",
      "Designed a hotel booking service, translating client requirements into a cohesive booking experience while improving visual clarity across key features, including property investment and management.",
    ],
  },
  {
    company: "WovenRemit",
    role: "Product UI/UX Designer",
    location: "Remote",
    period: "Aug 2025 - Nov 2025",
    points: [
      "Spearheaded the full redesign of WovenRemit, enhancing exchange rate transparency and simplifying global money transfer flows to increase user trust and usability.",
      "Led the entire design of Dropatgate, delivering a seamless mobile concierge experience that improved booking clarity and operational efficiency for airport travelers.",
      "Translated complex operational and financial requirements into intuitive, scalable product experiences across mobile and web.",
      "Contributed to the UX optimization of Trustcomply, improving audit workflows, compliance tracking, and overall enterprise platform usability.",
    ],
  },
  {
    company: "Halla Gaming Company Limited",
    role: "Product (UI/UX) & Graphic Designer",
    location: "Hybrid",
    period: "Jan 2024 – Present",
    points: [
      "Designed and launched a sports blog platform (news, videos, odds, predictions), increasing returning user engagement by 25%.",
      "Collaborated closely with developers to build and maintain a scalable design system, reducing design-to-dev handoff time by 20%.",
      "Contributed to UX and content strategy to enhance fan experience, readability, and accessibility across devices.",
      "Created high-performing social media and marketing assets, improving campaign CTR by 15%.",
    ],
  },
  {
    company: "Bridged Centre for Impact (BCI)",
    role: "Product UI/UX Designer",
    location: "Remote",
    period: "Aug 2025 - Nov 2025",
    points: [
      "Redesigned a hospital EMR system to improve usability and streamline daily workflows for clinical staff.",
      "Worked directly with doctors and nurses to identify pain points and simplify complex medical task flows.",
      "Translated real-world healthcare challenges into practical, user-centred design solutions.",
      "Facilitated cross-team collaboration to align technical constraints with medical requirements.",
    ],
  },
  {
    company: "Syncskills",
    role: "UI/UX Designer",
    location: "Remote",
    period: "March 2024 – Feb 2025",
    points: [
      "Spearheaded the full redesign of WovenRemit, enhancing exchange rate transparency and simplifying global money transfer flows to increase user trust and usability.",
      "Led the entire design of Dropatgate, delivering a seamless mobile concierge experience that improved booking clarity and operational efficiency for airport travelers.",
      "Translated complex operational and financial requirements into intuitive, scalable product experiences across mobile and web.",
      "Contributed to the UX optimization of Trustcomply, improving audit workflows, compliance tracking, and overall enterprise platform usability.",
    ],
  },
  {
    company: "Freelance",
    role: "UI/UX and Graphic Designer",
    location: "Remote",
    period: "Aug 2025 - Nov 2025",
    points: [
      "Designed end-to-end user flows, wireframes, and high-fidelity interfaces for clients across finance, social platforms, art galleries, and service products.",
      "Collaborated with clients across different regions and industries, adapting designs to varied user needs.",
      "Delivered production-ready UI designs for applications with 25+ screens.",
      "Conducted usability testing and iterative improvements prior to product launch.",
    ],
  },
] as const;

const CARD = "rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] sm:p-8";
const PILL = "inline-flex w-fit items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100";

export default function ExperiencePage() {
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
            <figcaption className="mt-1 text-xs leading-5 text-neutral-700 dark:text-neutral-300">
              Turning complex problems into simple, intuitive products people love using.
            </figcaption>
          </figure>

          <p className={PILL}>
            <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
            My Journey
          </p>
          <h1 id="experience-heading" className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            5+ years of designing solutions that solve <span className="text-brand">real business problems.</span>
          </h1>
          <p className="max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
            I&apos;ve had the opportunity to work across fintech, healthcare, gaming, enterprise software, logistics, AI,
            E-commerce and more. Partnering with startups and growing teams to create products that are reliable,
            scalable, and built around real user needs.
          </p>
        </div>
      </section>

      {/* Roles */}
      <section aria-label="Work history" className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6">
        {JOBS.map((job) => (
          <article key={`${job.company}-${job.period}`} className={CARD}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">{job.company}</h2>
                <p className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  <Icon name="lucide:briefcase" width={16} height={16} className="text-neutral-700 dark:text-neutral-300" />
                  {job.role}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <p className="text-xs font-semibold italic text-neutral-900 dark:text-neutral-100">{job.location}</p>
                <p className="rounded-xl bg-brand-light px-4 py-2 text-sm font-semibold italic text-neutral-900 dark:text-neutral-100">
                  {job.period}
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {job.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
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
              src={PROFILE.avatarSrc}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full bg-black object-cover"
            />
            <div className="flex flex-col gap-1">
              <h2 id="experience-cta-heading" className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                Let&apos;s create something impactful together.
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                I&apos;m always open to discussing new opportunities and interesting projects.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Let&apos;s Talk
            <Icon name="lucide:arrow-right" width={18} height={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
