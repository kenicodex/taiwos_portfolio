import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PublishedPage } from "@/features/pages/PublishedPage";
import { getPublishedPage } from "@/features/pages/service";
import { sharePreview } from "@/features/site/share";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const page = await getPublishedPage("home");
  return sharePreview({ title: page?.title ?? "Portfolio", path: "/" });
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <PublishedPage slug="home" />
    </Suspense>
  );
}
