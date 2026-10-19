import { jsonOk } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { requireAdminApi } from "@/lib/admin-session";
import { currentSessionTokenHash } from "@/lib/session";
import { listAdminSessions } from "@/features/auth/sessions";

export const GET = adminRoute(async () => {
  const session = await requireAdminApi();
  return jsonOk(await listAdminSessions(session.adminId, await currentSessionTokenHash()));
});
