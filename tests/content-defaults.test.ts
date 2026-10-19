import { describe, expect, it } from "vitest";
import { COLLECTIONS, DOCUMENTS } from "@/features/content/registry";

// A default that fails its own schema would make the fallback page invalid, so every default is checked here.

describe.each(DOCUMENTS.map((d) => [d.key, d] as const))("document default: %s", (_key, definition) => {
  it("passes its own schema", () => {
    expect(() => definition.schema.validateSync(definition.defaults, { stripUnknown: true })).not.toThrow();
  });

  it("declares a field for every key in the default", () => {
    const fieldNames = definition.fields.map((f) => f.name);
    for (const key of Object.keys(definition.defaults)) expect(fieldNames).toContain(key);
  });
});

describe.each(COLLECTIONS.map((c) => [c.name, c] as const))("collection default: %s", (_name, definition) => {
  it("has at least one and at most the allowed number of items", () => {
    expect(definition.defaults.length).toBeGreaterThan(0);
    expect(definition.defaults.length).toBeLessThanOrEqual(definition.max);
  });

  it("every item passes the item schema", () => {
    for (const item of definition.defaults) {
      expect(() => definition.itemSchema.validateSync(item, { stripUnknown: true })).not.toThrow();
    }
  });
});
