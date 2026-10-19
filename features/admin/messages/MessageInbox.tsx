"use client";

import { useState } from "react";
import { api } from "../api-client";
import { BUTTON, CARD, DANGER, Notice, SECONDARY } from "../ui";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  phone: string | null;
  website: string | null;
  timeline: string | null;
  notifiedAt: string | null;
  notifyError: string | null;
  createdAt: string;
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Archived", value: "archived" },
] as const;

export function MessageInbox({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = useState(initial);
  const [filter, setFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = messages.find((message) => message.id === selectedId) ?? null;

  async function load(next: string) {
    setFilter(next);
    setBusy(true);
    try {
      const rows = await api<Message[]>(`/admin/messages${next ? `?status=${next}` : ""}`);
      setMessages(rows);
      setSelectedId(rows[0]?.id ?? null);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load messages." });
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(message: Message, status: Message["status"]) {
    setBusy(true);
    try {
      await api(`/admin/messages/${message.id}`, { method: "PATCH", body: { status } });
      setMessages((current) => current.map((item) => (item.id === message.id ? { ...item, status } : item)));
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not update the message." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(message: Message) {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/admin/messages/${message.id}`, { method: "DELETE" });
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setSelectedId(null);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not delete the message." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div role="group" aria-label="Filter messages" className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => load(item.value)}
            disabled={busy}
            className={`${BUTTON} h-9 px-4 text-sm ${filter === item.value ? "bg-brand text-white" : "border border-neutral-300 dark:border-neutral-700"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">No messages here yet.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ul className="flex flex-col gap-2">
            {messages.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(message.id)}
                  aria-current={message.id === selectedId ? "true" : undefined}
                  className={`${CARD} block w-full p-4 text-left ${message.id === selectedId ? "ring-2 ring-brand" : ""}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium">{message.name}</span>
                    {message.status === "new" && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white">New</span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-neutral-600 dark:text-neutral-400">{message.message}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{new Date(message.createdAt).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <article className={`${CARD} flex flex-col gap-4`} aria-label="Message">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <a href={`mailto:${selected.email}`} className="text-sm text-brand underline-offset-2 hover:underline">
                  {selected.email}
                </a>
                {selected.phone && <p className="text-sm">Phone: {selected.phone}</p>}
                {selected.website && <p className="text-sm break-all">Website: {selected.website}</p>}
                {selected.timeline && <p className="text-sm">Timeline: {selected.timeline}</p>}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800 dark:text-neutral-200">{selected.message}</p>
              {selected.notifyError && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  Email not sent: {selected.notifyError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.status !== "read" && (
                  <button type="button" disabled={busy} onClick={() => setStatus(selected, "read")} className={`${SECONDARY} h-9 px-4 text-xs`}>
                    Mark as read
                  </button>
                )}
                {selected.status !== "archived" && (
                  <button type="button" disabled={busy} onClick={() => setStatus(selected, "archived")} className={`${SECONDARY} h-9 px-4 text-xs`}>
                    Archive
                  </button>
                )}
                <button type="button" disabled={busy} onClick={() => remove(selected)} className={`${DANGER} h-9 px-4 text-xs`}>
                  Delete
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
