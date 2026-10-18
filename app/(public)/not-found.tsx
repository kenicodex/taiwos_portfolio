import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Icon name="lucide:file-question" width={48} height={48} className="opacity-70" />
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="opacity-80">The page you are looking for does not exist or is not published.</p>
      <Link href="/" className="font-medium underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}
