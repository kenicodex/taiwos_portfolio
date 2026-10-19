"use client";

import { useState, type FormEvent } from "react";
import { api, ApiClientError } from "../api-client";
import { BUTTON, CARD, Field, INPUT, Notice, PRIMARY, SECONDARY } from "../ui";

type Link = { label: string; href: string; icon?: string };
type Media = { id: string; url: string; altText: string };
type Settings = {
  profile: Record<string, string>;
  headerNav: Link[];
  footerNav: Link[];
  socialLinks: Link[];
  primaryColor: string;
  avatar: { id: string; url: string | null } | null;
  resume: { id: string; url: string | null } | null;
  shareImage: { id: string; url: string | null } | null;
  updatedAt: string | null;
};

const PROFILE_FIELDS: { name: string; label: string; hint?: string }[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role", hint: "For example Product Designer." },
  { name: "initials", label: "Initials", hint: "Shown in the logo circle, up to 4 characters." },
  { name: "location", label: "Location", hint: "Shown in the footer." },
  { name: "contactEmail", label: "Contact email" },
  { name: "phone", label: "Phone" },
  { name: "availability", label: "Availability", hint: "For example Open to new opportunities." },
  { name: "copyrightText", label: "Copyright line", hint: "Leave empty to use “© year Name. All rights reserved.”" },
];

export function SettingsForm({ initial, media }: { initial: Settings; media: Media[] }) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function patch(next: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...next }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const result = await api<{ updatedAt: string }>("/admin/settings", {
        method: "PUT",
        body: {
          expectedUpdatedAt: settings.updatedAt,
          settings: {
            profile: settings.profile,
            headerNav: settings.headerNav.map(({ label, href }) => ({ label, href })),
            footerNav: settings.footerNav.map(({ label, href }) => ({ label, href })),
            socialLinks: settings.socialLinks,
            primaryColor: settings.primaryColor,
            avatarMediaId: settings.avatar?.id ?? null,
            resumeMediaId: settings.resume?.id ?? null,
            shareImageId: settings.shareImage?.id ?? null,
          },
        },
      });
      patch({ updatedAt: result.updatedAt });
      setNotice({ kind: "success", text: "Settings saved. The site is updated." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save. Please try again." });
      if (error instanceof ApiClientError) {
        const out: Record<string, string> = {};
        for (const detail of error.details) if (detail.path && !out[detail.path]) out[detail.path] = detail.message;
        setErrors(out);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6" noValidate>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {Object.keys(errors).length > 0 && <Notice kind="error">Check the highlighted fields and try again.</Notice>}

      <section aria-labelledby="profile-heading" className={`${CARD} flex flex-col gap-5`}>
        <h2 id="profile-heading" className="text-lg font-semibold">Profile</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <Field key={field.name} label={field.label} htmlFor={`profile-${field.name}`} hint={field.hint} error={errors[`profile.${field.name}`]}>
              <input
                id={`profile-${field.name}`}
                value={settings.profile[field.name] ?? ""}
                onChange={(event) => patch({ profile: { ...settings.profile, [field.name]: event.target.value } })}
                className={INPUT}
              />
            </Field>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FilePicker label="Profile photo" value={settings.avatar?.id ?? null} media={media} onChange={(id) => patch({ avatar: id ? { id, url: null } : null })} />
          <FilePicker label="CV (PDF)" value={settings.resume?.id ?? null} media={media} onChange={(id) => patch({ resume: id ? { id, url: null } : null })} />
          <FilePicker label="Share image" value={settings.shareImage?.id ?? null} media={media} onChange={(id) => patch({ shareImage: id ? { id, url: null } : null })} />
        </div>
      </section>

      <section aria-labelledby="brand-heading" className={`${CARD} flex flex-col gap-4`}>
        <h2 id="brand-heading" className="text-lg font-semibold">Brand colour</h2>
        <div className="flex items-center gap-3">
          <input
            id="brand-colour"
            type="color"
            value={settings.primaryColor}
            onChange={(event) => patch({ primaryColor: event.target.value.toUpperCase() })}
            className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-700"
          />
          <input aria-label="Brand colour hex" value={settings.primaryColor} onChange={(event) => patch({ primaryColor: event.target.value })} className={`${INPUT} max-w-40`} />
          <span className="h-10 w-10 rounded-full border border-neutral-200" style={{ backgroundColor: settings.primaryColor }} aria-hidden="true" />
        </div>
      </section>

      <LinkList title="Header menu" items={settings.headerNav} max={8} onChange={(headerNav) => patch({ headerNav })} />
      <LinkList title="Footer menu" items={settings.footerNav} max={10} onChange={(footerNav) => patch({ footerNav })} />
      <LinkList title="Social links" items={settings.socialLinks} max={6} withIcon onChange={(socialLinks) => patch({ socialLinks })} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

function FilePicker({ label, value, media, onChange }: { label: string; value: string | null; media: Media[]; onChange: (id: string | null) => void }) {
  const id = `file-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const selected = media.find((item) => item.id === value);
  return (
    <Field label={label} htmlFor={id} hint="Upload files in Media first.">
      <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} className={INPUT}>
        <option value="">None (use the default)</option>
        {media.map((item) => (
          <option key={item.id} value={item.id}>
            {item.altText || item.url.split("/").pop()}
          </option>
        ))}
      </select>
      {selected && selected.url.endsWith(".pdf") === false && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={selected.url} alt="" className="h-16 w-auto rounded-lg object-contain" />
      )}
    </Field>
  );
}

function LinkList({
  title,
  items,
  max,
  withIcon = false,
  onChange,
}: {
  title: string;
  items: Link[];
  max: number;
  withIcon?: boolean;
  onChange: (items: Link[]) => void;
}) {
  function update(index: number, patch: Partial<Link>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <section aria-label={title} className={`${CARD} flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          disabled={items.length >= max}
          onClick={() => onChange([...items, { label: "", href: "", ...(withIcon ? { icon: "" } : {}) }])}
          className={`${SECONDARY} h-9 px-4 text-xs`}
        >
          Add
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-neutral-500">None. The default links are used.</p>}
      <ol className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_1fr_auto]">
            <input aria-label={`${title} label ${index + 1}`} placeholder="Label" value={item.label} onChange={(event) => update(index, { label: event.target.value })} className={INPUT} />
            <input aria-label={`${title} link ${index + 1}`} placeholder="/path or https://…" value={item.href} onChange={(event) => update(index, { href: event.target.value })} className={INPUT} />
            {withIcon && (
              <input aria-label={`${title} icon ${index + 1}`} placeholder="tabler:brand-linkedin" value={item.icon ?? ""} onChange={(event) => update(index, { icon: event.target.value })} className={INPUT} />
            )}
            <div className="flex gap-1">
              <button type="button" aria-label={`Move ${title} item ${index + 1} up`} onClick={() => move(index, -1)} disabled={index === 0} className={`${BUTTON} ${SECONDARY} h-10 px-3 text-xs`}>
                ↑
              </button>
              <button type="button" aria-label={`Move ${title} item ${index + 1} down`} onClick={() => move(index, 1)} disabled={index === items.length - 1} className={`${BUTTON} ${SECONDARY} h-10 px-3 text-xs`}>
                ↓
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className={`${BUTTON} ${SECONDARY} h-10 px-3 text-xs`}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
