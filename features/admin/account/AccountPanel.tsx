"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, ApiClientError } from "../api-client";
import { CARD, DANGER, Field, INPUT, Notice, PRIMARY } from "../ui";

type Session = { id: string; createdAt: string; expiresAt: string; current: boolean };

export function AccountPanel({ minPasswordLength }: { minPasswordLength: number }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    api<Session[]>("/admin/account/sessions")
      .then((rows) => active && setSessions(rows))
      .catch(() => active && setSessions([]));
    return () => {
      active = false;
    };
  }, []);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      await api("/admin/account/password", { method: "POST", body: { currentPassword: current, newPassword: next } });
      setCurrent("");
      setNext("");
      setSessions(await api<Session[]>("/admin/account/sessions"));
      setNotice({ kind: "success", text: "Password changed. Other devices have been signed out." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not change the password." });
      if (error instanceof ApiClientError && error.details.length > 0) {
        const out: Record<string, string> = {};
        for (const detail of error.details) if (detail.path && !out[detail.path]) out[detail.path] = detail.message;
        setErrors(out);
      }
    } finally {
      setBusy(false);
    }
  }

  async function revoke(session: Session) {
    setBusy(true);
    try {
      await api(`/admin/account/sessions/${session.id}`, { method: "DELETE" });
      setSessions((rows) => rows?.filter((row) => row.id !== session.id) ?? null);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not sign that session out." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={changePassword} className={`${CARD} flex flex-col gap-5`} noValidate>
        <h2 className="text-lg font-semibold">Change password</h2>
        {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
        <Field label="Current password" htmlFor="account-current" error={errors.currentPassword}>
          <input id="account-current" type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} className={INPUT} />
        </Field>
        <Field label="New password" htmlFor="account-next" hint={`At least ${minPasswordLength} characters. Changing it signs out your other devices.`} error={errors.newPassword}>
          <input id="account-next" type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} className={INPUT} />
        </Field>
        <button type="submit" disabled={busy || !current || !next} className={`${PRIMARY} self-start`}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>

      <section aria-labelledby="sessions-heading" className={`${CARD} flex flex-col gap-4`}>
        <h2 id="sessions-heading" className="text-lg font-semibold">Signed-in devices</h2>
        {sessions === null && <p className="text-sm text-neutral-500">Loading…</p>}
        <ul className="flex flex-col gap-3">
          {sessions?.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                Signed in {new Date(session.createdAt).toLocaleString()}
                {session.current && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">This device</span>}
              </span>
              {!session.current && (
                <button type="button" disabled={busy} onClick={() => revoke(session)} className={`${DANGER} h-8 px-3 text-xs`}>
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
