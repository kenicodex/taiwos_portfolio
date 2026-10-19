import { assertUuid } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { requireAdminApi } from "@/lib/admin-session";
import { currentSessionTokenHash } from "@/lib/session";
import { revokeAdminSession } from "@/features/auth/sessions";

type Params = { id: string };

export const DELETE = adminRoute<Params>(async (_request, { params }) => {
  const session = await requireAdminApi();
  const { id } = await params;
  await revokeAdminSession(session.adminId, assertUuid(id), await currentSessionTokenHash());
  return new Response(null, { status: 204 });
});
