import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AuthSession } from "./auth";
import { ApiError } from "./api";

/** Returns the session only when it belongs to the administrator. Never trust UI-level checks alone. */
export async function getAdminSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;
  return session;
}

/** For Route Handlers: throws 401/403 as an ApiError. */
export async function requireAdminApi(): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new ApiError("UNAUTHENTICATED", "Sign in required");
  if (session.user.role !== "admin") throw new ApiError("FORBIDDEN", "Administrator access required");
  return session;
}

/** For admin pages: redirects non-administrators to sign-in. Called by each admin page, not only the layout. */
export async function requireAdminPage(): Promise<AuthSession> {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
