import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertSameOrigin, jsonOk, toErrorResponse } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-session";
import { ALLOWED_TYPES, assertUploadPathname, requireBlobToken } from "@/features/media/service";

// Step 1 of an upload: the browser asks for a token, then uploads straight to Blob. Only signed-in
// admins get tokens, and each token is limited to the allowed types and sizes below.
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdminApi();
    const token = requireBlobToken();
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      token,
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        assertUploadPathname(pathname);
        return {
          allowedContentTypes: Object.keys(ALLOWED_TYPES),
          maximumSizeInBytes: Math.max(...Object.values(ALLOWED_TYPES)),
          addRandomSuffix: true,
        };
      },
      // Recording the file happens in step 2 (POST /admin/media), which checks it with Blob. The
      // webhook is not relied on, because it cannot reach a local development server.
      onUploadCompleted: async () => {},
    });
    return jsonOk(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
