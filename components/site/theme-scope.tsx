import "server-only";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { getSiteTheme } from "@/features/site/settings";
import { DEFAULT_THEME, themeStyle } from "@/features/site/theme";

// Applies the stored brand colours to everything inside it. If the database is unreachable the
// default theme is used, so public pages still render.
export async function ThemeScope({ children }: { children: ReactNode }) {
  await connection();
  const theme = await getSiteTheme().catch(() => DEFAULT_THEME);
  return <div style={themeStyle(theme)}>{children}</div>;
}
