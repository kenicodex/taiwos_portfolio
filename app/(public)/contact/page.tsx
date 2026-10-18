import type { Metadata } from "next";
import { Icon } from "@/components/ui/icon";
import { sharePreview } from "@/features/site/share";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = sharePreview({
  title: "Contact",
  path: "/contact",
  description: "Get in touch about a project, or just to say hello.",
});

const CONTACT_EMAIL = "salaudeentaiwo8@gmail.com";

const DETAILS = [
  { icon: "griddy-icons:email-fast", label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: "proicons:call", label: "Phone", value: "+234 705 400 8872", href: "tel:+2347054008872" },
  { icon: "at-icons:location", label: "Location", value: "Lagos State, Nigeria GMT +1", iconClassName: "text-[#E53E2F]" },
  { icon: "formkit:time", label: "Availability", value: "Open to new opportunities" },
] as const;

export default function ContactPage() {
  return (
    <main id="main" className="flex flex-1 flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <section aria-labelledby="contact-heading" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F4F0EA] px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
                Get in Touch
              </p>
              <h1
                id="contact-heading"
                className="text-4xl font-semibold leading-[1.15] tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl lg:text-[56px]"
              >
                Let&apos;s build something amazing together.
              </h1>
              <p className="max-w-md text-lg leading-8 text-neutral-700 dark:text-neutral-300">
                Have a project in mind or just want to say hello?
                <br />
                I&apos;d love to hear from you.
              </p>
            </div>

            <ul className="flex flex-col gap-6">
              {DETAILS.map((item) => {
                const body = (
                  <>
                    <span className="flex size-[88px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03] dark:bg-neutral-900 dark:ring-white/[0.06]">
                      <Icon
                        name={item.icon}
                        width={32}
                        height={32}
                        className={"iconClassName" in item ? item.iconClassName : "text-brand"}
                      />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">{item.label}</span>
                      <span className="text-[17px] text-neutral-700 dark:text-neutral-300">{item.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={item.label} className="flex items-center gap-5">
                    {"href" in item ? (
                      <a
                        href={item.href}
                        className="flex items-center gap-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                      >
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <ContactForm email={CONTACT_EMAIL} />
        </div>
      </section>
    </main>
  );
}
