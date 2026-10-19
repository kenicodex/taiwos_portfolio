import { jsonOk, readJsonBody } from "@/lib/api";
import { adminRoute } from "@/lib/route";
import { createProject, listProjectsForAdmin } from "@/features/content/records-service";

export const GET = adminRoute(async () => jsonOk(await listProjectsForAdmin()));

export const POST = adminRoute(async (request) => jsonOk(await createProject(await readJsonBody(request)), 201));
