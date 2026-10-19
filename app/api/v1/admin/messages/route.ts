import * as yup from "yup";
import { jsonOk } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { listMessages, MESSAGE_STATUSES } from "@/features/contact/admin-service";

const filter = yup.string().oneOf([...MESSAGE_STATUSES]).nullable().default(null);

export const GET = adminRoute(async (request) => {
  const status = await filter.validate(new URL(request.url).searchParams.get("status") ?? null);
  return jsonOk(await listMessages(status));
});
