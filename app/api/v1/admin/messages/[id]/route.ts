import * as yup from "yup";
import { assertUuid, jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { deleteMessage, MESSAGE_STATUSES, setMessageStatus } from "@/features/contact/admin-service";

type Params = { id: string };

const statusSchema = yup.object({ status: yup.string().oneOf([...MESSAGE_STATUSES]).required() });

export const PATCH = adminRoute<Params>(async (request, { params }) => {
  const { id } = await params;
  const { status } = await statusSchema.validate(await readJsonBody(request), { stripUnknown: true });
  await setMessageStatus(assertUuid(id), status);
  return jsonOk({ updated: true });
});

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  await deleteMessage(assertUuid(id));
  return new Response(null, { status: 204 });
});
