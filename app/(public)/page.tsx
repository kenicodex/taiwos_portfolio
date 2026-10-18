import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { env } from "@/lib/env";
import { PublishedPage } from "@/features/pages/PublishedPage";
import { getPublishedPage } from "@/features/pages/service";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const page = await getPublishedPage("home");
  const url = new URL("/", env.NEXT_PUBLIC_SITE_URL).toString();
  return {
    title: page?.title ?? "Portfolio",
    alternates: { canonical: url },
    openGraph: { url, title: page?.title ?? "Portfolio", type: "website" },
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <PublishedPage slug="home" />
    </Suspense>
  );
}
