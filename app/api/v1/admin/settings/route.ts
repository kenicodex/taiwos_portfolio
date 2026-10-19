import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { getSettingsForAdmin, saveSettings } from "@/features/content/settings-service";

const envelope = yup.object({
  settings: yup.object().required(),
  expectedUpdatedAt: yup.string().nullable().default(null),
});

export const GET = adminRoute(async () => jsonOk(await getSettingsForAdmin()));

export const PUT = adminRoute(async (request) => {
  const body = await envelope.validate(await readJsonBody(request), { stripUnknown: true });
  return jsonOk(await saveSettings(body.settings, body.expectedUpdatedAt));
});
