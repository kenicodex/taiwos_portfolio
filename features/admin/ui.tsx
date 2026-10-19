"use client";

import type { ReactNode } from "react";

// Small form primitives shared by the admin screens. Colours follow the public site tokens.

export const INPUT =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500";

export const BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const PRIMARY = `${BUTTON} bg-brand text-white`;
export const SECONDARY = `${BUTTON} border border-neutral-300 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100`;
export const DANGER = `${BUTTON} border border-red-300 text-red-700 dark:border-red-800 dark:text-red-400`;

export const CARD = "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function Notice({ kind, children }: { kind: "success" | "error" | "info"; children: ReactNode }) {
  const tone =
    kind === "success"
      ? "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
      : kind === "error"
        ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        : "border-neutral-300 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200";
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
