import "server-only";
import { NextResponse } from "next/server";
import * as yup from "yup";
import { env } from "./env";

export const MAX_JSON_BODY_BYTES = 256 * 1024;

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "NOT_CONFIGURED"
  | "INTERNAL_ERROR";

export type ApiErrorDetail = { path?: string; message: string };

const STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_FAILED: 422,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RATE_LIMITED: 429,
  NOT_CONFIGURED: 503,
  INTERNAL_ERROR: 500,
};

/** Error with an HTTP-safe message. Anything else thrown becomes a generic 500 without internals. */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: ApiErrorDetail[],
  ) {
    super(message);
  }
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status, headers: noStore() });
}

export function jsonError(error: ApiError) {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    },
    { status: STATUS[error.code], headers: noStore() },
  );
}

/** Converts any thrown value into a consistent response. Internal errors are logged, not returned. */
export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) return jsonError(error);
  if (error instanceof yup.ValidationError) {
    const details = (error.inner.length > 0 ? error.inner : [error]).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return jsonError(new ApiError("VALIDATION_FAILED", "Request validation failed", details));
  }
  console.error("[api] unhandled error", error instanceof Error ? error.name : "unknown");
  return jsonError(new ApiError("INTERNAL_ERROR", "Something went wrong"));
}

function noStore() {
  return { "Cache-Control": "no-store" };
}

/**
 * Mutations authenticate with a cookie, so they must be checked against cross-site requests.
 * Requires a JSON content type (which forces a CORS preflight for cross-origin callers) and a
 * matching Origin header when the browser sends one.
 */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) return;
  const allowed = new Set([new URL(env.NEXT_PUBLIC_SITE_URL).origin]);
  if (!allowed.has(origin)) {
    throw new ApiError("FORBIDDEN", "Cross-origin request rejected");
  }
}

/** Reads and parses a JSON body with a size limit. Throws ApiError on failure. */
export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError("UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_JSON_BODY_BYTES) {
    throw new ApiError("PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    throw new ApiError("PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("BAD_REQUEST", "Request body must be valid JSON");
  }
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, label = "id") {
  if (!UUID_PATTERN.test(value)) {
    throw new ApiError("BAD_REQUEST", `Invalid ${label}`);
  }
  return value;
}

export function parsePagination(url: string) {
  const { searchParams } = new URL(url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20),
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}
