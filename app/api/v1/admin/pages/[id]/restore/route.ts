import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { restoreSchema } from "@/features/pages/schemas";
import { restoreVersion } from "@/features/pages/service";

type Params = { id: string };

// Creates a new draft from an old version. Nothing goes live until the draft is published.
export const POST = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const body = await readJsonBody(request);
  const input = await restoreSchema.validate(body, { abortEarly: false, stripUnknown: true });
  const result = await restoreVersion({
    pageId: assertUuid(id),
    versionId: assertUuid(input.versionId, "version id"),
    expectedDraftVersionId: input.expectedDraftVersionId,
  });
  return jsonOk(result, 201);
});
