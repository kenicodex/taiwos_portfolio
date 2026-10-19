import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { listMedia, registerUpload } from "@/features/media/service";

const registerSchema = yup.object({
  url: yup
    .string()
    .trim()
    .matches(/^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\/.+$/i, "Use the URL returned by the upload")
    .required(),
  altText: yup.string().trim().max(200).default(""),
  width: yup.number().integer().min(1).max(10000).nullable().default(null),
  height: yup.number().integer().min(1).max(10000).nullable().default(null),
});

export const GET = adminRoute(async () => jsonOk(await listMedia()));

// Step 2 of an upload: record the finished file after Blob confirms it.
export const POST = adminRoute(async (request) => {
  const input = await registerSchema.validate(await readJsonBody(request), { abortEarly: false, stripUnknown: true });
  return jsonOk(await registerUpload(input), 201);
});
