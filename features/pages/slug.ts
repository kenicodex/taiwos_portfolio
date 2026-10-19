// Slugs become URL paths, so they are restricted to lowercase kebab-case and must not shadow
// application routes. "home" is reserved for the site's root page.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

export const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "login",
  "logout",
  "projects",
  "about",
  "experience",
  "contact",
  "home",
  "sitemap",
  "robots",
  "favicon",
  "_next",
  "static",
]);

export type SlugCheck = { valid: true } | { valid: false; reason: string };

export function checkSlug(slug: string): SlugCheck {
  if (slug.length === 0) return { valid: false, reason: "Slug is required" };
  if (slug.length > SLUG_MAX_LENGTH) {
    return { valid: false, reason: `Slug must be ${SLUG_MAX_LENGTH} characters or fewer` };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, reason: `"${slug}" is reserved` };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return { valid: false, reason: "Use lowercase letters, numbers and single hyphens" };
  }
  return { valid: true };
}

/** Converts free text into a candidate slug. The result still goes through checkSlug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);
}
