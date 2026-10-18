// Cookie name shared by the session code and the proxy. Kept free of server-only imports.
// The __Host- prefix requires Secure, so it is only used in production (plain http in development).
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
