// Hardcoded Projects page content. These are the defaults and the fallback when the database has no value.
// Moved verbatim from app/(public)/projects/page.tsx. Keep this pure: no server-only imports.

export type Project = {
  title: string;
  category: string;
  summary: string;
  /** Cover image in /public/work. Omit to show a branded placeholder instead. */
  cover?: { src: string; width: number; height: number };
  /** Used for the placeholder background when there is no cover image. */
  placeholder: string;
  href: string;
};

export const FEATURED: Project & { role: string; duration: string; summary: string } = {
  title: "WovenRemit",
  category: "Fintech",
  role: "Product Designer",
  duration: "4 Months",
  summary: "Redesigned a remittance platform to simplify money transfers and improve user trust and engagement.",
  cover: { src: "/work/woven-remit.png", width: 617, height: 477 },
  placeholder: "#0F1A14",
  href: "/contact",
};

export const PROJECTS: Project[] = [
  {
    title: "Office One AI",
    category: "AI/SaaS",
    summary: "Designed an AI-powered platform that streamlines collaboration, knowledge sharing and productivity.",
    cover: { src: "/work/office-one-ai.png", width: 393, height: 309 },
    placeholder: "#3E4A3A",
    href: "/contact",
  },
  {
    title: "DeltaLine Transport",
    category: "Transport Service",
    summary: "Built a transport management system that helps organisations easily book trips and monitor, access and mitigate risks.",
    placeholder: "#1D4A7A",
    href: "/contact",
  },
  {
    title: "SMATVIRTUAL",
    category: "Gaming",
    summary: "Designed dashboards that give game providers real-time insights and improve user gaming experience.",
    cover: { src: "/work/smatvirtual.png", width: 393, height: 309 },
    placeholder: "#0B1B2E",
    href: "/contact",
  },
  {
    title: "SportsDey",
    category: "Blog & Gaming",
    summary: "Created a sports news and betting experience focused on engagement, discovery and user retention.",
    placeholder: "#14361F",
    href: "/contact",
  },
  {
    title: "TrustComply",
    category: "RegTech",
    summary: "Built a compliance management system that helps organisations monitor, access and mitigate risks.",
    placeholder: "#111133",
    href: "/contact",
  },
  {
    title: "DP Logistics",
    category: "Logistics",
    summary: "Designed an end-to-end delivery management experience for riders, customers and fleet managers.",
    cover: { src: "/work/dp-logistics.png", width: 393, height: 309 },
    placeholder: "#1A3F8C",
    href: "/contact",
  },
];
