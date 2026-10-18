"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

const OPTIONS: { value: Theme; label: string; icon: `tabler:${string}` }[] = [
  { value: "light", label: "Light", icon: "tabler:sun" },
  { value: "dark", label: "Dark", icon: "tabler:moon" },
  { value: "system", label: "System", icon: "tabler:device-desktop" },
];

// Storage can be blocked (private mode). Without a saved choice the theme follows the system.
function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeToggle() {
  // The server cannot read the saved choice, so it renders "system" and the client catches up on mount.
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "system" as Theme);

  // While on "system", follow changes to the OS setting without a reload.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  function choose(next: Theme) {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this page view.
    }
    applyTheme(next);
    listeners.forEach((notify) => notify());
  }

  return (
    <div role="group" aria-label="Theme" className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={`${option.label} theme`}
            onClick={() => choose(option.value)}
            className={`inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            <Icon name={option.icon} width={18} height={18} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
