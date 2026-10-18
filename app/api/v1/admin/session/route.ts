import * as yup from "yup";
import { ApiError, assertSameOrigin, jsonOk, readJsonBody } from "@/lib/api";
import { publicRoute } from "@/lib/route";
import { createAdminSession, endAdminSession } from "@/lib/session";
import { authenticateAdmin } from "@/features/auth/service";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Enter a valid email address")
    .max(254)
    .required("Email is required"),
  password: yup.string().max(128).required("Password is required"),
});

// POST signs in, DELETE signs out. Both are cookie-authenticated mutations, so the origin is checked.
export const POST = publicRoute(async (request) => {
  assertSameOrigin(request);
  const body = await readJsonBody(request);
  const input = await loginSchema.validate(body, { abortEarly: false, stripUnknown: true });

  const admin = await authenticateAdmin(input.email, input.password);
  if (!admin) throw new ApiError("UNAUTHENTICATED", "Email or password is incorrect.");

  await createAdminSession(admin.id);
  return jsonOk({ signedIn: true });
});

export const DELETE = publicRoute(async (request) => {
  assertSameOrigin(request);
  await endAdminSession();
  return new Response(null, { status: 204 });
});
