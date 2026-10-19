import * as yup from "yup";
import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { requireAdminApi } from "@/lib/admin-session";
import { currentSessionTokenHash } from "@/lib/session";
import { changeAdminPassword, MIN_PASSWORD_LENGTH } from "@/features/auth/service";

const passwordSchema = yup.object({
  currentPassword: yup.string().max(128).required("Enter your current password"),
  newPassword: yup
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(128)
    .required("Enter a new password"),
});

// Changing the password signs out every other session. The session making the change stays signed in.
export const POST = adminRoute(async (request) => {
  const session = await requireAdminApi();
  const body = await readJsonBody(request);
  const input = await passwordSchema.validate(body, { abortEarly: false, stripUnknown: true });
  await changeAdminPassword(session.adminId, input.currentPassword, input.newPassword, await currentSessionTokenHash());
  return jsonOk({ changed: true });
});
