import { ApiError, jsonOk } from "@/lib/api";
import { publicRoute } from "@/lib/route";
import { checkSlug } from "@/features/pages/slug";
import { getPublishedPage } from "@/features/pages/service";

// Public: returns only the published version. Drafts and unpublished pages are indistinguishable from missing ones.
export const GET = publicRoute<{ slug: string }>(async (_request, { params }) => {
  const { slug } = await params;
  if (!checkSlug(slug).valid) throw new ApiError("NOT_FOUND", "Page not found");

  const page = await getPublishedPage(slug);
  if (!page) throw new ApiError("NOT_FOUND", "Page not found");

  return jsonOk({
    slug: page.slug,
    title: page.title,
    versionNumber: page.versionNumber,
    publishedAt: page.publishedAt,
    content: page.content,
  });
});
