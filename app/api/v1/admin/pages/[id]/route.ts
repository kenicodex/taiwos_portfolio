import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { updatePageSchema } from "@/features/pages/schemas";
import { deletePage, getPageWithDraft, updatePageMeta } from "@/features/pages/service";

type Params = { id: string };

export const GET = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  return jsonOk(await getPageWithDraft(assertUuid(id)));
});

export const PATCH = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const body = await readJsonBody(request);
  const input = await updatePageSchema.validate(body, { abortEarly: false, stripUnknown: true });
  const page = await updatePageMeta(assertUuid(id), input);
  return jsonOk(page);
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  await deletePage(assertUuid(id));
  return new Response(null, { status: 204 });
});
