import { describe, expect, it } from "vitest";
import { checkSlug, slugify } from "@/features/pages/slug";

describe("checkSlug", () => {
  it.each(["about-me", "case-study-1", "a", "2026"])("accepts %s", (slug) => {
    expect(checkSlug(slug).valid).toBe(true);
  });

  it.each([
    ["", "required"],
    ["Has-Caps", "lowercase"],
    ["double--hyphen", "single hyphens"],
    ["-leading", "single hyphens"],
    ["trailing-", "single hyphens"],
    ["has space", "single hyphens"],
    ["../etc", "single hyphens"],
    ["x".repeat(81), "80 characters"],
  ])("rejects %j (%s)", (slug) => {
    expect(checkSlug(slug).valid).toBe(false);
  });

  it.each(["admin", "api", "projects", "home", "_next"])("reserves %s", (slug) => {
    const result = checkSlug(slug);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("reserved");
  });
});

describe("slugify", () => {
  it("produces a slug that passes checkSlug", () => {
    expect(checkSlug(slugify("  Café Projects & Notes!  ")).valid).toBe(true);
    expect(slugify("  Café Projects & Notes!  ")).toBe("cafe-projects-notes");
  });
});
