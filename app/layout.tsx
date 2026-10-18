import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { PROFILE } from "@/features/site/profile";
import { SITE_DESCRIPTION } from "@/features/site/share";

const overlock = localFont({
  variable: "--font-overlock",
  display: "swap",
  src: [
    { path: "../public/font/Overlock/Overlock-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/font/Overlock/Overlock-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/font/Overlock/Overlock-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/font/Overlock/Overlock-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/font/Overlock/Overlock-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/font/Overlock/Overlock-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fallback for pages that don't set their own metadata. Page-level metadata uses sharePreview (features/site/share.ts).
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: PROFILE.name, template: "%s · Portfolio" },
  description: SITE_DESCRIPTION,
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${overlock.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Applies the saved or system theme before first paint, so dark mode never flashes light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">{children}</body>
    </html>
  );
}
