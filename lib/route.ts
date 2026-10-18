import "server-only";
import { assertSameOrigin, toErrorResponse } from "./api";
import { requireAdminApi } from "./admin-session";

type Context<P extends Record<string, string>> = { params: Promise<P> };
type Handler<P extends Record<string, string>> = (request: Request, context: Context<P>) => Promise<Response>;

/** Wraps a public handler so unexpected errors never leak internals. */
export function publicRoute<P extends Record<string, string> = Record<string, never>>(handler: Handler<P>) {
  return async (request: Request, context: Context<P>) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/**
 * Wraps an admin handler: same-origin check for mutations, then session and role verification.
 * Every admin route goes through here, so none can forget the check.
 */
export function adminRoute<P extends Record<string, string> = Record<string, never>>(handler: Handler<P>) {
  return async (request: Request, context: Context<P>) => {
    try {
      if (request.method !== "GET") assertSameOrigin(request);
      await requireAdminApi();
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
