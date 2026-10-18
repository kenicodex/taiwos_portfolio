"use client";

import { addCollection, Icon as IconifyIcon } from "@iconify/react/offline";
import type { ComponentProps } from "react";
import lucideIcons from "@iconify-json/lucide/icons.json";
import tablerIcons from "@iconify-json/tabler/icons.json";

// Icon sets are bundled and registered here, so rendering never calls the Iconify API. That keeps
// working under the CSP (connect-src 'self') and offline.
addCollection(lucideIcons as Parameters<typeof addCollection>[0]);
addCollection(tablerIcons as Parameters<typeof addCollection>[0]);

type IconProps = Omit<ComponentProps<typeof IconifyIcon>, "icon"> & {
  /** Full Iconify id, e.g. "tabler:brand-linkedin" or "lucide:file-question". */
  name: `lucide:${string}` | `tabler:${string}`;
};

export function Icon({ name, ...props }: IconProps) {
  return <IconifyIcon icon={name} aria-hidden="true" {...props} />;
}
