import * as yup from "yup";
import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { deleteMedia, updateAltText } from "@/features/media/service";

type Params = { id: string };

const altSchema = yup.object({ altText: yup.string().trim().max(200).required() });

export const PATCH = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const { altText } = await altSchema.validate(await readJsonBody(request), { stripUnknown: true });
  await updateAltText(assertUuid(id), altText);
  return jsonOk({ updated: true });
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  await deleteMedia(assertUuid(id));
  return new Response(null, { status: 204 });
});
