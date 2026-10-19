import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { reorder } from "@/features/content/records-service";

const schema = yup.object({ ids: yup.array().of(yup.string().required()).min(0).max(200).required() });

export const POST = adminRoute(async (request) => {
  const { ids } = await schema.validate(await readJsonBody(request), { stripUnknown: true });
  await reorder("projects", ids);
  return jsonOk({ reordered: true });
});
