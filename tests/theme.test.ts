import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIMARY,
  DEFAULT_THEME,
  darken,
  parseTheme,
  themeFromPrimary,
  themeStyle,
} from "@/features/site/theme";

describe("theme", () => {
  it("uses #97683F as the primary colour", () => {
    expect(DEFAULT_PRIMARY).toBe("#97683F");
    expect(DEFAULT_THEME.primary).toBe("#97683F");
  });

  it("derives a darker footer shade", () => {
    expect(DEFAULT_THEME.primaryDeep).toBe("#7C5534");
    expect(darken("#FFFFFF", 0)).toBe("#FFFFFF");
    expect(darken("#000000", 0.5)).toBe("#000000");
  });

  it("rejects malformed colours in darken", () => {
    expect(() => darken("red", 0.2)).toThrow();
  });

  it("normalises the primary to upper case", () => {
    expect(themeFromPrimary("#97683f").primary).toBe("#97683F");
  });

  it("accepts a valid stored theme", async () => {
    await expect(parseTheme({ primary: "#97683F", primaryDeep: "#7C5534" })).resolves.toEqual({
      primary: "#97683F",
      primaryDeep: "#7C5534",
    });
  });

  it.each([
    ["bad hex", { primary: "brown", primaryDeep: "#7C5534" }],
    ["missing field", { primary: "#97683F" }],
    ["script injection", { primary: "red;}</style><script>", primaryDeep: "#000000" }],
    ["null", null],
  ])("falls back to the default for %s", async (_label, input) => {
    await expect(parseTheme(input)).resolves.toEqual(DEFAULT_THEME);
  });

  it("sets brand custom properties", () => {
    expect(themeStyle(DEFAULT_THEME)).toEqual({
      "--color-brand": "#97683F",
      "--color-brand-deep": "#7C5534",
    });
  });
});
