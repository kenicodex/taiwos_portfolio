import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { checkSlug } from "@/features/pages/slug";
import { PublishedPage } from "@/features/pages/PublishedPage";
import { getPublishedPage } from "@/features/pages/service";
import { sharePreview } from "@/features/site/share";

type Props = { params: Promise<{ slug: string }> };

// Reserved slugs (including "home", which is served at "/") never reach the database lookup.
function isServable(slug: string) {
  return checkSlug(slug).valid;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  if (!isServable(slug)) notFound();
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  return sharePreview({ title: page.title, path: `/${slug}` });
}

// Blocking render, so a missing page can return a real 404 status.
export const instant = false;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!isServable(slug)) notFound();
  return (
    <Suspense fallback={null}>
      <PublishedPage slug={slug} />
    </Suspense>
  );
}
