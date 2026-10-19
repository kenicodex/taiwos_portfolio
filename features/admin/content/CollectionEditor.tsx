"use client";

import { useState } from "react";
import { api, ApiClientError } from "../api-client";
import { CARD, Field, INPUT, Notice, PRIMARY, SECONDARY } from "../ui";
import type { FieldSpec } from "@/features/content/registry";

type Item = Record<string, unknown> & { visible: boolean };

export function CollectionEditor(props: {
  name: string;
  fields: FieldSpec[];
  max: number;
  initialItems: Item[];
  initialSource: "defaults" | "saved";
  initialUpdatedAt: string | null;
}) {
  const [items, setItems] = useState<Item[]>(props.initialItems);
  const [source, setSource] = useState(props.initialSource);
  const [updatedAt, setUpdatedAt] = useState(props.initialUpdatedAt);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function update(index: number, patch: Partial<Item>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function add() {
    const blank: Item = { visible: true };
    for (const field of props.fields) {
      blank[field.name] = field.kind === "boolean" ? false : field.kind === "select" ? (field.options?.[0] ?? "") : "";
    }
    setItems((current) => [...current, blank]);
  }

  function remove(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function save() {
    setBusy(true);
    setNotice(null);
    try {
      const result = await api<{ count: number; updatedAt: string }>(`/admin/content/collections/${props.name}`, {
        method: "PUT",
        body: { items, expectedUpdatedAt: updatedAt },
      });
      setSource("saved");
      setUpdatedAt(result.updatedAt);
      setNotice({ kind: "success", text: `Saved ${result.count} item${result.count === 1 ? "" : "s"}. The public page is updated.` });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save. Please try again." });
      if (error instanceof ApiClientError && error.code === "CONFLICT") setSource("saved");
    } finally {
      setBusy(false);
    }
  }

  async function resetList() {
    if (!window.confirm("Remove the saved list and show the original items again?")) return;
    setBusy(true);
    try {
      await api(`/admin/content/collections/${props.name}`, { method: "DELETE" });
      window.location.reload();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not reset. Please try again." });
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {source === "defaults"
          ? "This list shows the original items. Saving it stores your copy, so you can edit it."
          : "This list is saved. Hidden items are not shown on the site."}
      </p>

      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li key={index} className={`${CARD} flex flex-col gap-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Item {index + 1}</span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) => update(index, { visible: event.target.checked })}
                  />
                  Show on site
                </label>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={`${SECONDARY} h-8 px-3 text-xs`}>
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className={`${SECONDARY} h-8 px-3 text-xs`}
                >
                  Move down
                </button>
                <button type="button" onClick={() => remove(index)} className={`${SECONDARY} h-8 px-3 text-xs`}>
                  Remove
                </button>
              </div>
            </div>

            {props.fields.map((field) => {
              const id = `item-${index}-${field.name}`;
              const value = item[field.name];
              return (
                <Field key={field.name} label={field.label} htmlFor={id} hint={field.kind === "icon" ? "A bundled icon id, such as carbon:finance." : undefined}>
                  {field.kind === "boolean" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        id={id}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => update(index, { [field.name]: event.target.checked })}
                      />
                      Yes
                    </label>
                  ) : field.kind === "select" ? (
                    <select id={id} value={String(value ?? "")} onChange={(event) => update(index, { [field.name]: event.target.value })} className={INPUT}>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === "textarea" ? (
                    <textarea id={id} rows={3} maxLength={field.max} value={String(value ?? "")} onChange={(event) => update(index, { [field.name]: event.target.value })} className={INPUT} />
                  ) : (
                    <input
                      id={id}
                      type="text"
                      maxLength={field.max}
                      value={String(value ?? "")}
                      onChange={(event) => update(index, { [field.name]: event.target.value })}
                      className={INPUT}
                    />
                  )}
                </Field>
              );
            })}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={add} disabled={busy || items.length >= props.max} className={SECONDARY}>
          Add item
        </button>
        <button type="button" onClick={save} disabled={busy || items.length === 0} className={PRIMARY}>
          {busy ? "Saving…" : "Save list"}
        </button>
        {source === "saved" && (
          <button type="button" onClick={resetList} disabled={busy} className={SECONDARY}>
            Reset to original items
          </button>
        )}
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {items.length} of {props.max} items
        </span>
      </div>
    </div>
  );
}
