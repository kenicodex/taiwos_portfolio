import { assertUuid, jsonOk } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { listVersions } from "@/features/pages/service";

type Params = { id: string };

export const GET = adminRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  return jsonOk(await listVersions(assertUuid(id)));
});
