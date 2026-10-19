"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiClientError } from "../api-client";
import { CARD, DANGER, Field, INPUT, Notice, PRIMARY, SECONDARY } from "../ui";

// One screen for every record list (projects, experience, tools). Each page passes its field config.

export type RecordField = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "boolean" | "select" | "date" | "list" | "media" | "color" | "url";
  required?: boolean;
  options?: readonly string[];
  hint?: string;
};

type Row = Record<string, unknown> & { id: string };
type Values = Record<string, unknown>;

export function RecordManager(props: {
  endpoint: "projects" | "experiences" | "skills";
  singular: string;
  plural: string;
  fields: RecordField[];
  columns: { key: string; label: string }[];
  blank: Values;
  /** Field whose value is used to label a row in the list and in confirmations. */
  titleKey: string;
  /** Keep this field's existing value on update when left blank, e.g. a slug. */
  keepOnBlank?: string[];
  hasOrder: boolean;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [media, setMedia] = useState<{ id: string; url: string; altText: string }[]>([]);
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [values, setValues] = useState<Values>(props.blank);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      setRows(await api<Row[]>(`/admin/${props.endpoint}`));
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
      setRows([]);
    }
  }

  useEffect(() => {
    // Loaded once when the screen opens. Later reloads go through load().
    let active = true;
    api<Row[]>(`/admin/${props.endpoint}`)
      .then((data) => active && setRows(data))
      .catch((error: unknown) => {
        if (active) {
          setNotice({ kind: "error", text: messageOf(error) });
          setRows([]);
        }
      });
    if (props.fields.some((field) => field.kind === "media")) {
      api<{ id: string; url: string; altText: string }[]>("/admin/media")
        .then((items) => active && setMedia(items))
        .catch(() => active && setMedia([]));
    }
    return () => {
      active = false;
    };
    // The endpoint and fields are fixed per screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open(row: Row | "new") {
    setNotice(null);
    setErrors({});
    if (row === "new") {
      setSelected("new");
      setValues(props.blank);
      return;
    }
    setSelected(row.id);
    const next: Values = {};
    for (const field of props.fields) next[field.name] = row[field.name] ?? props.blank[field.name];
    setValues(next);
  }

  function setField(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function payload() {
    const body: Values = {};
    for (const field of props.fields) {
      const value = values[field.name];
      if (field.kind === "list") {
        body[field.name] = String(value ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else if (field.kind === "media" || (field.kind === "date" && !value)) {
        body[field.name] = value || null;
      } else {
        body[field.name] = value;
      }
    }
    // A blank value that must not change (such as a slug) keeps its stored value on update.
    const original = rows?.find((row) => row.id === selected);
    for (const key of props.keepOnBlank ?? []) {
      if (!body[key] && selected !== "new" && original) body[key] = original[key] ?? "";
    }
    return body;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      if (selected === "new") {
        const created = await api<{ id: string }>(`/admin/${props.endpoint}`, { method: "POST", body: payload() });
        setSelected(created.id);
        setNotice({ kind: "success", text: `${props.singular} added.` });
      } else {
        await api(`/admin/${props.endpoint}/${selected}`, { method: "PATCH", body: payload() });
        setNotice({ kind: "success", text: `${props.singular} saved.` });
      }
      await load();
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
      if (error instanceof ApiClientError) setErrors(fieldErrors(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete “${String(row[props.titleKey] ?? props.singular)}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/admin/${props.endpoint}/${row.id}`, { method: "DELETE" });
      if (selected === row.id) setSelected(null);
      await load();
      setNotice({ kind: "success", text: `${props.singular} deleted.` });
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!rows) return;
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ids = rows.map((row) => row.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy(true);
    try {
      await api(`/admin/${props.endpoint}/reorder`, { method: "POST", body: { ids } });
      await load();
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
    } finally {
      setBusy(false);
    }
  }

  const mediaLabel = (id: unknown) => media.find((item) => item.id === id)?.url ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-label={`${props.plural} list`} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{props.plural}</h2>
          <button type="button" onClick={() => open("new")} className={PRIMARY}>
            Add {props.singular.toLowerCase()}
          </button>
        </div>

        {rows === null && <p className="text-sm text-neutral-500">Loading…</p>}
        {rows?.length === 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Nothing here yet. Add one to get started.</p>
        )}

        <ol className="flex flex-col gap-2">
          {rows?.map((row, index) => (
            <li
              key={row.id}
              className={`${CARD} flex flex-wrap items-center gap-3 p-4 ${selected === row.id ? "ring-2 ring-brand" : ""}`}
            >
              <button type="button" onClick={() => open(row)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-neutral-950 dark:text-neutral-50">
                  {String(row[props.titleKey] ?? "")}
                </span>
                <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {props.columns
                    .filter((column) => column.key !== props.titleKey)
                    .map((column) => (
                      <span key={column.key}>
                        {column.label}: {formatCell(row[column.key])}
                      </span>
                    ))}
                </span>
              </button>
              {props.hasOrder && (
                <div className="flex gap-1">
                  <button type="button" aria-label={`Move ${String(row[props.titleKey])} up`} disabled={busy || index === 0} onClick={() => move(index, -1)} className={`${SECONDARY} h-8 px-3 text-xs`}>
                    Up
                  </button>
                  <button type="button" aria-label={`Move ${String(row[props.titleKey])} down`} disabled={busy || index === rows.length - 1} onClick={() => move(index, 1)} className={`${SECONDARY} h-8 px-3 text-xs`}>
                    Down
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-label={`${props.singular} form`} className="flex flex-col gap-4">
        {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
        {selected === null ? (
          <div className={`${CARD} text-sm text-neutral-600 dark:text-neutral-400`}>Choose an item to edit it, or add a new one.</div>
        ) : (
          <form onSubmit={save} className={`${CARD} flex flex-col gap-5`} noValidate>
            {props.fields.map((field) => {
              const id = `${props.endpoint}-${field.name}`;
              const value = values[field.name];
              return (
                <Field key={field.name} label={`${field.label}${field.required ? " *" : ""}`} htmlFor={id} hint={field.hint} error={errors[field.name]}>
                  {field.kind === "boolean" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => setField(field.name, event.target.checked)} />
                      Yes
                    </label>
                  ) : field.kind === "select" ? (
                    <select id={id} value={String(value ?? "")} onChange={(event) => setField(field.name, event.target.value)} className={INPUT}>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === "media" ? (
                    <div className="flex flex-col gap-2">
                      <select id={id} value={String(value ?? "")} onChange={(event) => setField(field.name, event.target.value || null)} className={INPUT}>
                        <option value="">None</option>
                        {media.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.altText || item.url.split("/").pop()}
                          </option>
                        ))}
                      </select>
                      {mediaLabel(value) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaLabel(value) ?? ""} alt="" className="h-20 w-auto rounded-lg object-contain" />
                      )}
                      <Link href="/admin/media" className="text-xs text-brand underline-offset-2 hover:underline">
                        Upload a new file
                      </Link>
                    </div>
                  ) : field.kind === "textarea" || field.kind === "list" ? (
                    <textarea
                      id={id}
                      rows={field.kind === "list" ? 5 : 4}
                      value={field.kind === "list" ? ((value as string[] | undefined) ?? []).join("\n") : String(value ?? "")}
                      onChange={(event) => setField(field.name, field.kind === "list" ? event.target.value.split("\n") : event.target.value)}
                      className={INPUT}
                    />
                  ) : field.kind === "color" ? (
                    <div className="flex items-center gap-3">
                      <input id={id} type="color" value={String(value ?? "#1A1A1A")} onChange={(event) => setField(field.name, event.target.value.toUpperCase())} className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-700" />
                      <input aria-label={`${field.label} hex`} value={String(value ?? "")} onChange={(event) => setField(field.name, event.target.value)} className={INPUT} />
                    </div>
                  ) : (
                    <input
                      id={id}
                      type={field.kind === "date" ? "date" : field.kind === "url" ? "text" : "text"}
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                      className={INPUT}
                    />
                  )}
                </Field>
              );
            })}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className={PRIMARY}>
                {busy ? "Saving…" : "Save"}
              </button>
              {selected !== "new" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const row = rows?.find((item) => item.id === selected);
                    if (row) void remove(row);
                  }}
                  className={`${DANGER} h-10 px-5`}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function fieldErrors(error: ApiClientError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.path && !out[detail.path]) out[detail.path] = detail.message;
  }
  return out;
}
