import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { publishSchema } from "@/features/pages/schemas";
import { publishDraft } from "@/features/pages/service";

type Params = { id: string };

export const POST = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const body = await readJsonBody(request);
  const input = await publishSchema.validate(body, { abortEarly: false, stripUnknown: true });
  const result = await publishDraft({
    pageId: assertUuid(id),
    expectedDraftVersionId: input.expectedDraftVersionId,
  });
  return jsonOk({
    slug: result.page.slug,
    publishedVersionId: result.version.id,
    versionNumber: result.version.versionNumber,
  });
});
