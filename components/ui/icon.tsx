"use client";

import { addCollection, Icon as IconifyIcon } from "@iconify/react/offline";
import type { ComponentProps } from "react";
import lucideIcons from "@iconify-json/lucide/icons.json";
import tablerIcons from "@iconify-json/tabler/icons.json";
// Subsets of other sets, holding only the icons the site uses. Regenerate them from the full packages if more are needed.
import streamlineIcons from "./iconify/streamline.json";
import streamlineUltimateIcons from "./iconify/streamline-ultimate.json";
import griddyIcons from "./iconify/griddy-icons.json";
import carbonIcons from "./iconify/carbon.json";
import hugeiconsIcons from "./iconify/hugeicons.json";
import iconoirIcons from "./iconify/iconoir.json";
import fluentIcons from "./iconify/fluent.json";
import clarityIcons from "./iconify/clarity.json";
import mageIcons from "./iconify/mage.json";
import arcticonsIcons from "./iconify/arcticons.json";
import akarIcons from "./iconify/akar-icons.json";
import proIcons from "./iconify/proicons.json";
import atIcons from "./iconify/at-icons.json";
import formkitIcons from "./iconify/formkit.json";

// Icon sets are bundled and registered here, so rendering never calls the Iconify API. That keeps
// working under the CSP (connect-src 'self') and offline.
const COLLECTIONS = [
  lucideIcons,
  tablerIcons,
  streamlineIcons,
  streamlineUltimateIcons,
  griddyIcons,
  carbonIcons,
  hugeiconsIcons,
  iconoirIcons,
  fluentIcons,
  clarityIcons,
  mageIcons,
  arcticonsIcons,
  akarIcons,
  proIcons,
  atIcons,
  formkitIcons,
];
for (const collection of COLLECTIONS) {
  addCollection(collection as Parameters<typeof addCollection>[0]);
}

type IconProps = Omit<ComponentProps<typeof IconifyIcon>, "icon"> & {
  /** Full Iconify id, e.g. "tabler:brand-linkedin", "lucide:file-question" or "carbon:finance". */
  name: `${(typeof COLLECTIONS)[number]["prefix"]}:${string}`;
};

export function Icon({ name, ...props }: IconProps) {
  return <IconifyIcon icon={name} aria-hidden="true" {...props} />;
}
