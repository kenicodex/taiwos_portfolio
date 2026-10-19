"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";

const LABEL = "text-[15px] font-medium text-neutral-950 dark:text-neutral-50";
const FIELD =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; notified: boolean } | { kind: "error"; message: string };

/**
 * Posts the message to /api/v1/contact. If that fails, the visitor can still write by email:
 * the mailto link remains visible below the button.
 */
export function ContactForm({ email, timelines }: { email: string; timelines: readonly string[] }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: field("name"),
          email: field("email"),
          website: field("website"),
          timeline: field("timeline"),
          details: field("details"),
          company: field("company"),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { data?: { notified?: boolean }; error?: { message?: string } }
        | null;

      if (!response.ok) {
        const message =
          response.status === 429
            ? "You have sent several messages recently. Please try again later."
            : (payload?.error?.message ?? "Something went wrong. Please try again, or write to me by email.");
        setStatus({ kind: "error", message });
        return;
      }
      form.reset();
      setStatus({ kind: "sent", notified: payload?.data?.notified ?? true });
    } catch {
      setStatus({ kind: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-[0_12px_40px_-20px_rgba(60,40,20,0.18)] dark:bg-neutral-900 sm:p-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">Project Inquiry</h2>

      {/* Honeypot: hidden from people, filled in by bots. Named so autofill does not match it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

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
          minLength={10}
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
            {timelines.map((timeline) => (
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
          disabled={sending}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {sending ? "Sending…" : "Send a Message"}
          <Icon name="lucide:arrow-right" width={18} height={18} />
        </button>

        {status.kind === "sent" && (
          <p role="status" className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            {status.notified
              ? "Thanks, your message has been sent. I'll get back to you soon."
              : "Thanks, your message has been received. I'll get back to you soon."}
          </p>
        )}
        {status.kind === "error" && (
          <p role="alert" className="text-center text-sm text-red-700 dark:text-red-400">
            {status.message}
          </p>
        )}
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Prefer email?{" "}
          <a href={`mailto:${email}`} className="font-medium text-brand underline-offset-4 hover:underline">
            {email}
          </a>
        </p>
      </div>
    </form>
  );
}
