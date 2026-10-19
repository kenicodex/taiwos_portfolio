// Browser-side client for the admin API. Errors become ApiClientError so screens can show the server's message.

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: { path?: string; message: string }[] = [],
  ) {
    super(message);
  }
}

type Json = Record<string, unknown> | unknown[];

export async function api<T = unknown>(path: string, options: { method?: string; body?: Json } = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "same-origin",
  });

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { code: string; message: string; details?: { path?: string; message: string }[] } }
    | null;

  if (!response.ok || !payload || payload.error) {
    throw new ApiClientError(
      response.status,
      payload?.error?.code ?? "INTERNAL_ERROR",
      payload?.error?.message ?? "Something went wrong. Please try again.",
      payload?.error?.details ?? [],
    );
  }
  return payload.data as T;
}

/** Uploads a file to Blob (step 1 gets a token, then the file goes straight to Blob) and records it (step 2). */
export async function uploadMedia(file: File, altText: string) {
  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(`site/${file.name.replace(/[^A-Za-z0-9._-]/g, "-")}`, file, {
    access: "public",
    handleUploadUrl: "/api/v1/admin/media/upload",
    contentType: file.type,
  });

  let width: number | null = null;
  let height: number | null = null;
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    const size = await imageSize(file).catch(() => null);
    width = size?.width ?? null;
    height = size?.height ?? null;
  }
  return api<{ id: string; url: string }>("/admin/media", {
    method: "POST",
    body: { url: blob.url, altText, width, height },
  });
}

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error("Could not read image size"));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}
