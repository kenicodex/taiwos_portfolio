import type { CSSProperties } from "react";
import * as yup from "yup";

// Shared by the seed script, the public layout and unit tests. Must not import server-only modules.

const HEX = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_PRIMARY = "#97683F";

export type ThemeConfiguration = {
  /** Brand colour used for buttons, the active nav item and the logo. */
  primary: string;
  /** Darker shade used for the footer background. */
  primaryDeep: string;
};

export const themeSchema: yup.ObjectSchema<ThemeConfiguration> = yup.object({
  primary: yup.string().required().matches(HEX, "primary must be a 6-digit hex colour"),
  primaryDeep: yup.string().required().matches(HEX, "primaryDeep must be a 6-digit hex colour"),
});

/** Mixes a hex colour towards black by `amount` (0 to 1). */
export function darken(hex: string, amount: number): string {
  if (!HEX.test(hex)) throw new Error(`Invalid hex colour: ${hex}`);
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const scaled = channels.map((c) => Math.round(c * (1 - amount)));
  return `#${scaled
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/** Builds the full theme from a primary colour, deriving the footer shade. */
export function themeFromPrimary(primary: string): ThemeConfiguration {
  return { primary: primary.toUpperCase(), primaryDeep: darken(primary, 0.18) };
}

export const DEFAULT_THEME = themeFromPrimary(DEFAULT_PRIMARY);

/** Parses stored JSON. Invalid data falls back to the default theme rather than breaking the site. */
export async function parseTheme(input: unknown): Promise<ThemeConfiguration> {
  try {
    return await themeSchema.validate(input, { stripUnknown: true });
  } catch {
    return DEFAULT_THEME;
  }
}

/** Sets the CSS custom properties that the Tailwind brand tokens read from. */
export function themeStyle(theme: ThemeConfiguration): CSSProperties {
  return {
    "--color-brand": theme.primary,
    "--color-brand-deep": theme.primaryDeep,
  } as CSSProperties;
}
