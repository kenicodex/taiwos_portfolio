import { describe, expect, it, vi } from "vitest";
import * as yup from "yup";
import { mergeWithDefaults, resolveValue, withFallback } from "@/features/content/resolve";

const titleSchema = yup.string().trim().required().max(20);

describe("resolveValue", () => {
  it("uses the default when nothing is stored", () => {
    expect(resolveValue("Default", undefined, titleSchema)).toBe("Default");
    expect(resolveValue("Default", null, titleSchema)).toBe("Default");
  });

  it("uses the default for an empty or whitespace-only value", () => {
    expect(resolveValue("Default", "", titleSchema)).toBe("Default");
    expect(resolveValue("Default", "   ", titleSchema)).toBe("Default");
  });

  it("uses a stored value that passes validation", () => {
    expect(resolveValue("Default", "  Saved  ", titleSchema)).toBe("Saved");
  });

  it("falls back to the default when the stored value fails validation", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveValue("Default", "x".repeat(50), titleSchema)).toBe("Default");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("mergeWithDefaults", () => {
  const defaults = { heading: "About me", body: "Default body", email: "a@example.com" };

  it("returns the defaults when no row exists", () => {
    expect(mergeWithDefaults(defaults, null)).toEqual(defaults);
    expect(mergeWithDefaults(defaults, undefined)).toEqual(defaults);
  });

  it("overrides only the fields that have a stored value", () => {
    expect(mergeWithDefaults(defaults, { heading: "Hello" })).toEqual({ ...defaults, heading: "Hello" });
  });

  it("treats empty fields as unset, so they take the default", () => {
    expect(mergeWithDefaults(defaults, { heading: "", body: "  " })).toEqual(defaults);
  });
});

describe("withFallback", () => {
  it("returns the read value when the read succeeds", async () => {
    expect(await withFallback("fallback", async () => "from db")).toBe("from db");
  });

  it("returns the fallback when the read throws (database unreachable)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      await withFallback("fallback", async () => {
        throw new Error("connection refused");
      }),
    ).toBe("fallback");
    warn.mockRestore();
  });

  it("returns the fallback when the read resolves to nothing", async () => {
    expect(await withFallback("fallback", async () => null as unknown as string)).toBe("fallback");
  });
});
