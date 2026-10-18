import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Optimistic check only: a session cookie is present. The real check (token lookup and expiry)
// happens in the page or API route through getAdminSession / requireAdminApi.
export function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
