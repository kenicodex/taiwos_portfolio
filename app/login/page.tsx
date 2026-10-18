import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Signed-in administrators skip the form. The session read is per request, so it streams behind Suspense.
async function LoginGate() {
  await connection();
  if (await getAdminSession()) redirect("/admin");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Administrator sign in</h1>
      <Suspense fallback={null}>
        <LoginGate />
      </Suspense>
    </main>
  );
}
