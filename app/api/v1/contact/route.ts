import { createHash } from "node:crypto";
import { assertSameOrigin, jsonOk, readJsonBody } from "@/lib/api";
import { publicRoute } from "@/lib/route";
import { clientKey } from "@/lib/request-ip";
import { consumeRateLimit } from "@/features/auth/rate-limit";
import { contactSchema, saveContactMessage } from "@/features/contact/service";

// At most five messages per visitor per hour. The limit is keyed by a hash of the IP, never the raw address.
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

export const POST = publicRoute(async (request) => {
  assertSameOrigin(request);
  const body = await readJsonBody(request);
  const input = await contactSchema.validate(body, { abortEarly: false, stripUnknown: true });

  if (input.company) return jsonOk({ received: true }, 201);

  const key = clientKey(request, "contact");
  await consumeRateLimit(key, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  const ipHash = createHash("sha256").update(key).digest("hex");

  const { notified } = await saveContactMessage(input, ipHash);
  return jsonOk({ received: true, notified }, 201);
});
