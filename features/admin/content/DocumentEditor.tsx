"use client";

import { useState, type FormEvent } from "react";
import { api, ApiClientError } from "../api-client";
import { BUTTON, CARD, Field, INPUT, Notice, PRIMARY, SECONDARY } from "../ui";
import type { FieldSpec } from "@/features/content/registry";

type Values = Record<string, unknown>;

export function DocumentEditor(props: {
  docKey: string;
  fields: FieldSpec[];
  initialValues: Values;
  defaults: Values;
  initialCustomised: string[];
  initialUpdatedAt: string | null;
}) {
  const [values, setValues] = useState<Values>(props.initialValues);
  const [customised, setCustomised] = useState<string[]>(props.initialCustomised);
  const [updatedAt, setUpdatedAt] = useState<string | null>(props.initialUpdatedAt);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDefault = (name: string) => !customised.includes(name);

  function setField(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function resetField(name: string) {
    setField(name, props.defaults[name]);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const result = await api<{ values: Values; customised: string[]; updatedAt: string }>(
        `/admin/content/documents/${props.docKey}`,
        { method: "PUT", body: { values, expectedUpdatedAt: updatedAt } },
      );
      setValues(result.values);
      setCustomised(result.customised);
      setUpdatedAt(result.updatedAt);
      setNotice({ kind: "success", text: "Saved. The public page is updated." });
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
      if (error instanceof ApiClientError) setErrors(fieldErrors(error));
    } finally {
      setBusy(false);
    }
  }

  async function resetAll() {
    if (!window.confirm("Reset every field on this page to the original text?")) return;
    setBusy(true);
    try {
      await api(`/admin/content/documents/${props.docKey}`, { method: "DELETE" });
      setValues(props.defaults);
      setCustomised([]);
      setUpdatedAt(null);
      setNotice({ kind: "success", text: "Reset to the original text." });
    } catch (error) {
      setNotice({ kind: "error", text: messageOf(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6" noValidate>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className={`${CARD} flex flex-col gap-6`}>
        {props.fields.map((field) => {
          const id = `field-${field.name}`;
          const value = values[field.name];
          const modified = !isDefault(field.name);
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{field.label}</span>
                <span className="flex items-center gap-2 text-xs">
                  <span className={modified ? "text-brand" : "text-neutral-500 dark:text-neutral-400"}>
                    {modified ? "Customised" : "Default"}
                  </span>
                  {modified && (
                    <button type="button" onClick={() => resetField(field.name)} className="underline underline-offset-2 hover:text-brand">
                      Reset
                    </button>
                  )}
                </span>
              </div>
              <Field label={field.label} htmlFor={id} error={errors[field.name]}>
                {field.kind === "list" ? (
                  <textarea
                    id={id}
                    rows={Math.max(3, (value as string[]).length + 1)}
                    value={(value as string[]).join("\n")}
                    onChange={(event) =>
                      setField(
                        field.name,
                        event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                      )
                    }
                    className={INPUT}
                  />
                ) : field.kind === "textarea" ? (
                  <textarea
                    id={id}
                    rows={4}
                    maxLength={field.max}
                    value={String(value ?? "")}
                    onChange={(event) => setField(field.name, event.target.value)}
                    className={INPUT}
                  />
                ) : (
                  <input
                    id={id}
                    type="text"
                    maxLength={field.max}
                    value={String(value ?? "")}
                    onChange={(event) => setField(field.name, event.target.value)}
                    className={INPUT}
                  />
                )}
              </Field>
              {field.kind === "list" && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">One item per line.</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" disabled={busy || customised.length === 0} onClick={resetAll} className={`${SECONDARY} ${BUTTON}`}>
          Reset page to defaults
        </button>
        {customised.length > 0 && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {customised.length} field{customised.length === 1 ? "" : "s"} customised
          </span>
        )}
      </div>
    </form>
  );
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
