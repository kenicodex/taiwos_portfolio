import type { ComponentType } from "react";
import { getBlockDefinition, type AnyBlockDefinition } from "../blocks/registry";
import type { Block, BlockType } from "../blocks/types";
import type { BlockData, BlockRenderProps } from "./blocks";

type Props = { blocks: Block[]; data: BlockData };

/** Renders enabled blocks in stored order. Unknown types are skipped rather than failing the page. */
export function BlockRenderer({ blocks, data }: Props) {
  return blocks.map((block) => {
    if (!block.enabled) return null;
    const definition: AnyBlockDefinition | undefined = getBlockDefinition(block.type);
    if (!definition) return null;

    // The registry pairs each type with its own renderer; widening the props type here is safe
    // because `block.config` was validated against the same type's schema.
    const Render = definition.Render as ComponentType<BlockRenderProps<BlockType>>;
    return <Render key={block.id} id={block.id} config={block.config} style={block.style} data={data} />;
  });
}
