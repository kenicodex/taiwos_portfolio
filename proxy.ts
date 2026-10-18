import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: a session cookie is present. The real check (signature, expiry, role) happens
// in the page or API route through getAdminSession / requireAdminApi, so this cannot be the only gate.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
