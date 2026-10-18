import type { Metadata } from "next";
import { PROFILE } from "./profile";

// Used when a page has no description of its own. Keep it under about 160 characters so search and link previews don't cut it off.
export const SITE_DESCRIPTION = `${PROFILE.name} is a ${PROFILE.role} in Lagos, Nigeria, designing fintech, AI, healthcare, logistics and enterprise products.`;

// Shown in link previews. Relative paths resolve against metadataBase in app/layout.tsx.
const SHARE_IMAGE = { url: "/hero/headshot.png", width: 563, height: 713, alt: PROFILE.name };

/** Title, description, canonical URL and social preview tags for a public page. */
export function sharePreview({
  title,
  path,
  description = SITE_DESCRIPTION,
}: {
  title: string;
  path: string;
  description?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: PROFILE.name,
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
