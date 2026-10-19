import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { getCollectionForAdmin, resetCollection, saveCollection } from "@/features/content/admin-service";

type Params = { name: string };

const saveSchema = yup.object({
  items: yup.array().of(yup.object()).required(),
  expectedUpdatedAt: yup.string().nullable().default(null),
});

export const GET = adminRoute<Params>(async (_request, { params }) => {
  const { name } = await params;
  return jsonOk(await getCollectionForAdmin(name));
});

export const PUT = adminRoute<Params>(async (request, { params }) => {
  const { name } = await params;
  const body = await readJsonBody(request);
  const input = await saveSchema.validate(body, { abortEarly: false, stripUnknown: true });
  return jsonOk(
    await saveCollection(name, {
      items: input.items as Array<Record<string, unknown> & { visible?: boolean }>,
      expectedUpdatedAt: input.expectedUpdatedAt,
    }),
  );
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { name } = await params;
  await resetCollection(name);
  return new Response(null, { status: 204 });
});
