import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { DEFAULT_THEME, parseTheme, type ThemeConfiguration } from "./theme";

/** Reads the theme from site_settings. Cached, and expired whenever settings change. */
export async function getSiteTheme(): Promise<ThemeConfiguration> {
  "use cache";
  cacheTag("site-settings");

  const [row] = await db
    .select({ themeConfiguration: siteSettings.themeConfiguration })
    .from(siteSettings)
    .limit(1);

  return row ? parseTheme(row.themeConfiguration) : DEFAULT_THEME;
}
