import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { env } from "@/lib/env";
import { checkSlug } from "@/features/pages/slug";
import { PublishedPage } from "@/features/pages/PublishedPage";
import { getPublishedPage } from "@/features/pages/service";

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
  const url = new URL(`/${slug}`, env.NEXT_PUBLIC_SITE_URL).toString();
  return {
    title: page.title,
    alternates: { canonical: url },
    openGraph: { url, title: page.title, type: "website" },
  };
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
