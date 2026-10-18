import "server-only";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BlockRenderer } from "@/features/page-builder/render/BlockRenderer";
import { getBlockData } from "./public-data";
import { getPublishedPage } from "./service";
import type { PageContent } from "@/features/page-builder/blocks/types";

const DATA_BLOCKS = ["projects", "skills", "experience"] as const;

/** Server component that renders the published version of a page, or 404s. */
export async function PublishedPage({ slug }: { slug: string }) {
  // Published content is read per request, while the data itself is cached and tag-revalidated on publish.
  await connection();

  const page = await getPublishedPage(slug);
  if (!page) notFound();

  const content = page.content as PageContent;
  const needs = content.blocks
    .filter((block) => block.enabled && (DATA_BLOCKS as readonly string[]).includes(block.type))
    .map((block) => block.type);
  const data = await getBlockData([...new Set(needs)]);

  return (
    <main id="main" className="flex min-h-full flex-1 flex-col">
      <BlockRenderer blocks={content.blocks} data={data} />
    </main>
  );
}
