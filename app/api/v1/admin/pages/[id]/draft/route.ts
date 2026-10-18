import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { saveDraftSchema } from "@/features/pages/schemas";
import { getPageWithDraft, saveDraft } from "@/features/pages/service";

type Params = { id: string };

export const GET = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const { draft } = await getPageWithDraft(assertUuid(id));
  return jsonOk(draft);
});

export const PUT = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const body = await readJsonBody(request);
  const input = await saveDraftSchema.validate(body, { abortEarly: false, stripUnknown: true });
  const version = await saveDraft({
    pageId: assertUuid(id),
    expectedDraftVersionId: input.expectedDraftVersionId,
    content: input.content,
    title: input.title,
  });
  return jsonOk(version);
});
