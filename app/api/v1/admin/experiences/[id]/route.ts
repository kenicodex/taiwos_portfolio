import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { deleteExperience, updateExperience } from "@/features/content/records-service";

type Params = { id: string };

export const PATCH = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  await updateExperience(assertUuid(id), await readJsonBody(request));
  return jsonOk({ updated: true });
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  await deleteExperience(assertUuid(id));
  return new Response(null, { status: 204 });
});
