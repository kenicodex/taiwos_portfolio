"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";

const TIMELINES = ["Less than 1 month", "1 to 3 months", "3 to 6 months", "More than 6 months", "Not sure yet"] as const;

const LABEL = "text-[15px] font-medium text-neutral-950 dark:text-neutral-50";
const FIELD =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500";

/**
 * There is no contact endpoint yet, so submitting opens the visitor's email app with the
 * message filled in, addressed to the site owner.
 */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const lines = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      get("website") && `Existing website: ${get("website")}`,
      `Timeline: ${get("timeline") || "Not specified"}`,
      "",
      get("details"),
    ].filter((line): line is string => Boolean(line));

    const subject = get("website") ? `Project inquiry: ${get("website")}` : "Project inquiry";
    const params = new URLSearchParams({ subject, body: lines.join("\n") });
    window.location.href = `mailto:${email}?${params.toString()}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] dark:bg-neutral-900 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">Project Inquiry</h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className={LABEL}>
          Name
        </label>
        <input id="contact-name" name="name" required autoComplete="name" placeholder="Enter your name" className={FIELD} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className={LABEL}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-website" className={LABEL}>
          Existing website <span className="font-normal text-neutral-500 dark:text-neutral-400">(subject)</span>
        </label>
        <div className="relative">
          <input
            id="contact-website"
            name="website"
            type="url"
            placeholder="https://yourwebsite.com"
            className={`${FIELD} pr-24`}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-details" className={LABEL}>
          Project details <span className="font-normal text-neutral-500 dark:text-neutral-400">(Subject)</span>
        </label>
        <textarea
          id="contact-details"
          name="details"
          required
          rows={5}
          placeholder="Tell me about your project"
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-timeline" className={LABEL}>
          Project Timeline
        </label>
        <div className="relative">
          <select id="contact-timeline" name="timeline" defaultValue="" className={`${FIELD} appearance-none pr-12`}>
            <option value="" disabled>
              Select a timeline
            </option>
            {TIMELINES.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
          <Icon
            name="lucide:chevron-down"
            width={18}
            height={18}
            className="pointer-events-none absolute inset-y-0 right-4 my-auto text-neutral-600 dark:text-neutral-300"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="submit"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Send a Message
          <Icon name="lucide:arrow-right" width={18} height={18} />
        </button>
        {sent && (
          <p role="status" className="text-sm text-neutral-600 dark:text-neutral-400">
            Your email app should open with the message ready to send.
          </p>
        )}
      </div>
    </form>
  );
}
