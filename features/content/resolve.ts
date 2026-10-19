import type * as yup from "yup";

// Pure fallback logic shared by the public queries, the admin "Reset to default" action and tests.
// Order of precedence: a stored value that passes validation, otherwise the hardcoded default.

function isEmpty(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

/** Resolves one value. A missing, invalid or empty stored value falls back to the default. */
export function resolveValue<T>(fallback: T, stored: unknown, schema?: yup.Schema<T>): T {
  if (isEmpty(stored)) return fallback;
  if (!schema) return stored as T;
  try {
    return schema.validateSync(stored, { stripUnknown: true }) as T;
  } catch {
    // An invalid stored value must never break the page. Log it so the admin can fix the row.
    console.warn("content: stored value failed validation, using default");
    return fallback;
  }
}

/** Merges a stored object over its defaults field by field. Empty fields take the default. */
export function mergeWithDefaults<T extends Record<string, unknown>>(defaults: T, stored: Partial<T> | null | undefined): T {
  if (!stored) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = stored[key];
    if (!isEmpty(value)) merged[key] = value as T[keyof T];
  }
  return merged;
}

/** Runs a database read, and returns the fallback if it throws (for example when the database is unreachable). */
export async function withFallback<T>(fallback: T, read: () => Promise<T>): Promise<T> {
  try {
    const value = await read();
    return value ?? fallback;
  } catch (error) {
    console.warn("content: database read failed, using defaults", error);
    return fallback;
  }
}
