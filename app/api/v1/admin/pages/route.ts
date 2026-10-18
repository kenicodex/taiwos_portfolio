import { jsonOk, parsePagination, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { createPageSchema } from "@/features/pages/schemas";
import { createPage, listPages } from "@/features/pages/service";

export const GET = adminRoute(async (request) => {
  const { page, pageSize, offset } = parsePagination(request.url);
  const { items, total } = await listPages(pageSize, offset);
  return jsonOk({ items, page, pageSize, total });
});

export const POST = adminRoute(async (request) => {
  const body = await readJsonBody(request);
  const input = await createPageSchema.validate(body, { abortEarly: false, stripUnknown: true });
  const created = await createPage({ title: input.title, slug: input.slug });
  return jsonOk(created, 201);
});
