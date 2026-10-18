import { describe, expect, it } from "vitest";
import { BLOCK_LIBRARY, BLOCK_REGISTRY, getBlockDefinition } from "@/features/page-builder/blocks/registry";
import { BLOCK_TYPES } from "@/features/page-builder/blocks/types";

describe("block registry", () => {
  it("has exactly one definition per block type", () => {
    expect(Object.keys(BLOCK_REGISTRY).sort()).toEqual([...BLOCK_TYPES].sort());
    for (const type of BLOCK_TYPES) {
      expect(BLOCK_REGISTRY[type].type).toBe(type);
    }
  });

  it("exposes the initial library of 14 blocks", () => {
    expect(BLOCK_LIBRARY).toHaveLength(14);
  });

  it("returns a definition for known types", () => {
    expect(getBlockDefinition("hero")?.label).toBe("Hero");
  });

  it.each(["constructor", "__proto__", "toString", "script", ""])("returns undefined for %j", (type) => {
    expect(getBlockDefinition(type)).toBeUndefined();
  });

  it("gives each definition a renderer and a schema", () => {
    for (const definition of BLOCK_LIBRARY) {
      expect(typeof definition.Render).toBe("function");
      expect(typeof definition.schema.validate).toBe("function");
    }
  });
});
