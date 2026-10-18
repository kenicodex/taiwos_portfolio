import { describe, expect, it } from "vitest";
import {
  validateBlock,
  validatePageContent,
  MAX_BLOCKS_PER_PAGE,
} from "@/features/page-builder/blocks/schemas";
import { createBlock } from "@/features/page-builder/blocks/defaults";
import { BLOCK_TYPES, type BlockType } from "@/features/page-builder/blocks/types";

const ID = "block-0001";

describe("validateBlock", () => {
  it.each(BLOCK_TYPES)("accepts the default configuration for %s", async (type: BlockType) => {
    const block = createBlock(type, ID);
    await expect(validateBlock(block)).resolves.toMatchObject({ id: ID, type, enabled: true });
  });

  it("rejects an unknown block type", async () => {
    await expect(validateBlock({ ...createBlock("hero", ID), type: "script" })).rejects.toThrow();
  });

  it("rejects a javascript: link in a button", async () => {
    const block = createBlock("call_to_action", ID);
    block.config.buttonHref = "javascript:alert(1)";
    await expect(validateBlock(block)).rejects.toThrow(/Button link/);
  });

  it("rejects protocol-relative links", async () => {
    const block = createBlock("hero", ID);
    block.config.primaryCtaHref = "//evil.example";
    await expect(validateBlock(block)).rejects.toThrow(/Button link/);
  });

  it("rejects style values outside the token list", async () => {
    const block = {
      ...createBlock("about", ID),
      style: { background: "url(https://x.test/a.png)", paddingY: "md", align: "left" },
    };
    await expect(validateBlock(block)).rejects.toThrow();
  });

  it("strips unknown keys so stored data cannot add fields", async () => {
    const block = { ...createBlock("skills", ID), injected: "<script>" } as Record<string, unknown>;
    const result = await validateBlock(block);
    expect(result).not.toHaveProperty("injected");
  });

  it("enforces required text fields", async () => {
    const block = createBlock("about", ID);
    block.config.heading = "   ";
    await expect(validateBlock(block)).rejects.toThrow(/Heading is required/);
  });

  it("enforces list limits", async () => {
    const block = createBlock("statistics", ID);
    block.config.items = Array.from({ length: 9 }, (_, i) => ({ value: String(i), label: "x", description: "", icon: "briefcase" as const }));
    await expect(validateBlock(block)).rejects.toThrow(/8 items or fewer/);
  });
});

describe("validatePageContent", () => {
  it("accepts a page with several block types", async () => {
    const content = await validatePageContent({
      schemaVersion: 1,
      blocks: [createBlock("hero", "hero-0001"), createBlock("spacer", "space-01")],
    });
    expect(content.blocks.map((b) => b.type)).toEqual(["hero", "spacer"]);
  });

  it("rejects duplicate block ids", async () => {
    await expect(
      validatePageContent({
        schemaVersion: 1,
        blocks: [createBlock("hero", "same-id-1"), createBlock("spacer", "same-id-1")],
      }),
    ).rejects.toThrow(/Duplicate block id/);
  });

  it("rejects pages over the block limit", async () => {
    const blocks = Array.from({ length: MAX_BLOCKS_PER_PAGE + 1 }, (_, i) =>
      createBlock("spacer", `sp-${i}-abc`),
    );
    await expect(validatePageContent({ schemaVersion: 1, blocks })).rejects.toThrow(/at most/);
  });

  it("reports the path of the failing block", async () => {
    const bad = createBlock("hero", "hero-0002");
    bad.config.headline = "";
    await expect(
      validatePageContent({ schemaVersion: 1, blocks: [createBlock("spacer", "sp-0001"), bad] }),
    ).rejects.toMatchObject({ path: "blocks[1].config.headline" });
  });

  it("rejects unsupported schema versions", async () => {
    await expect(validatePageContent({ schemaVersion: 2, blocks: [] })).rejects.toThrow();
  });
});
