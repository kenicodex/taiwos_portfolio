import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { createExperience, listExperiencesForAdmin } from "@/features/content/records-service";

export const GET = adminRoute(async () => jsonOk(await listExperiencesForAdmin()));

export const POST = adminRoute(async (request) => jsonOk(await createExperience(await readJsonBody(request)), 201));
