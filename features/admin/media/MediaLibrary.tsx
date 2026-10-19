"use client";

import { useState, type FormEvent } from "react";
import { api, uploadMedia } from "../api-client";
import { CARD, DANGER, Field, INPUT, Notice, PRIMARY } from "../ui";

type Item = { id: string; url: string; altText: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null };

export function MediaLibrary({ initial, uploadsEnabled }: { initial: Item[]; uploadsEnabled: boolean }) {
  const [items, setItems] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setNotice(null);
    try {
      await uploadMedia(file, altText);
      const fresh = await api<Item[]>("/admin/media");
      setItems(fresh);
      setFile(null);
      setAltText("");
      setNotice({ kind: "success", text: "Uploaded. Pick it in the relevant setting or project." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Upload failed. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function saveAlt(item: Item, text: string) {
    try {
      await api(`/admin/media/${item.id}`, { method: "PATCH", body: { altText: text } });
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, altText: text } : row)));
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the description." });
    }
  }

  async function remove(item: Item) {
    if (!window.confirm("Delete this file? It cannot be undone.")) return;
    setBusy(true);
    try {
      await api(`/admin/media/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((row) => row.id !== item.id));
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not delete the file." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {!uploadsEnabled && (
        <Notice kind="info">File uploads are not set up yet. Add BLOB_READ_WRITE_TOKEN to enable them.</Notice>
      )}

      <form onSubmit={upload} className={`${CARD} grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end`} noValidate>
        <Field label="File" htmlFor="media-file" hint="PNG, JPEG, WebP, AVIF, SVG or PDF. Images up to 8 MB, PDFs up to 15 MB.">
          <input
            id="media-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,application/pdf"
            disabled={!uploadsEnabled || busy}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </Field>
        <Field label="Description" htmlFor="media-alt" hint="Read by screen readers. Leave empty for decorative images.">
          <input id="media-alt" value={altText} onChange={(event) => setAltText(event.target.value)} className={INPUT} maxLength={200} />
        </Field>
        <button type="submit" disabled={!uploadsEnabled || !file || busy} className={PRIMARY}>
          {busy ? "Uploading…" : "Upload"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">No files yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className={`${CARD} flex flex-col gap-3`}>
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {item.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.altText} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{item.mimeType}</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatSize(item.sizeBytes)}
                {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
              </p>
              <AltEditor initial={item.altText} onSave={(text) => saveAlt(item, text)} />
              <button type="button" disabled={busy} onClick={() => remove(item)} className={`${DANGER} h-9 self-start px-4 text-xs`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AltEditor({ initial, onSave }: { initial: string; onSave: (text: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex items-center gap-2">
      <input aria-label="Description" value={value} onChange={(event) => setValue(event.target.value)} className={INPUT} maxLength={200} />
      <button type="button" disabled={value === initial} onClick={() => onSave(value)} className="text-xs font-medium text-brand underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline">
        Save
      </button>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
