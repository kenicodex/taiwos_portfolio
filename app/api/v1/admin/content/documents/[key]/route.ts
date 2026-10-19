import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { getDocumentForAdmin, resetDocument, saveDocument } from "@/features/content/admin-service";

type Params = { key: string };

const saveSchema = yup.object({
  values: yup.object().required(),
  expectedUpdatedAt: yup.string().nullable().default(null),
});

export const GET = adminRoute<Params>(async (_request, { params }) => {
  const { key } = await params;
  return jsonOk(await getDocumentForAdmin(key));
});

export const PUT = adminRoute<Params>(async (request, { params }) => {
  const { key } = await params;
  const body = await readJsonBody(request);
  const input = await saveSchema.validate(body, { abortEarly: false, stripUnknown: true });
  return jsonOk(await saveDocument(key, { values: input.values as Record<string, unknown>, expectedUpdatedAt: input.expectedUpdatedAt }));
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { key } = await params;
  await resetDocument(key);
  return new Response(null, { status: 204 });
});
