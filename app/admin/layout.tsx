import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Blocking render, so unauthenticated visitors get a real redirect instead of a streamed one.
export const instant = false;

// Each admin page also calls requireAdminPage(), and every API route re-checks the session on its own.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
