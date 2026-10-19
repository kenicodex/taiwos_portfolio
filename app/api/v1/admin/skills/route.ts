import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { createSkill, listSkillsForAdmin } from "@/features/content/records-service";

export const GET = adminRoute(async () => jsonOk(await listSkillsForAdmin()));

export const POST = adminRoute(async (request) => jsonOk(await createSkill(await readJsonBody(request)), 201));
