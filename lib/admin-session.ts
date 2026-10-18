import "server-only";
import { redirect } from "next/navigation";
import { ApiError } from "./api";
import { type AdminSession, readAdminSession } from "./session";

/** Returns the session only for the administrator. Route-level checks are not enough on their own. */
export async function getAdminSession(): Promise<AdminSession | null> {
  return readAdminSession();
}

/** For Route Handlers: throws 401 when signed out. */
export async function requireAdminApi(): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session) throw new ApiError("UNAUTHENTICATED", "Sign in required");
  return session;
}

/** For admin pages: redirects to sign-in. Each admin page calls this, not only the layout. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session) redirect("/login");
  return session;
}
