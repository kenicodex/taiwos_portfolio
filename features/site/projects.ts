// Projects shown on the Projects page and in each case study's "View Other Projects" slider.

export type Project = {
  title: string;
  category: string;
  summary: string;
  /** Cover image in /public/projects. Omit to show a branded placeholder instead. */
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
  cover: { src: "/projects/wove.png", width: 617, height: 477 },
  placeholder: "#0F1A14",
  href: "/projects/wovenremit",
};

export const PROJECTS: Project[] = [
  {
    title: "Office One AI",
    category: "AI/SaaS",
    summary: "Designed an AI-powered platform that streamlines collaboration, knowledge sharing and productivity.",
    cover: { src: "/projects/officeai.png", width: 393, height: 309 },
    placeholder: "#3E4A3A",
    href: "/projects/office-one-ai",
  },
  {
    title: "DeltaLine Transport",
    category: "Transport Service",
    summary: "Built a transport management system that helps organisations easily book trips and monitor, access and mitigate risks.",
    cover: { src: "/projects/deltaline.png", width: 393, height: 309 },
    placeholder: "#1D4A7A",
    href: "/projects/deltaline-transport",
  },
  {
    title: "SMATVIRTUAL",
    category: "Gaming",
    summary: "Designed dashboards that give game providers real-time insights and improve user gaming experience.",
    cover: { src: "/projects/smartvirtual.png", width: 393, height: 309 },
    placeholder: "#0B1B2E",
    href: "/contact",
  },
  {
    title: "SportsDey",
    category: "Blog & Gaming",
    summary: "Created a sports news and betting experience focused on engagement, discovery and user retention.",
    cover: { src: "/projects/SportsDey.png", width: 393, height: 309 },
    placeholder: "#14361F",
    href: "/projects/sportsdey",
  },
  {
    title: "TrustComply",
    category: "RegTech",
    summary: "Built a compliance management system that helps organisations monitor, access and mitigate risks.",
    cover: { src: "/projects/trustcomply.png", width: 393, height: 309 },
    placeholder: "#111133",
    href: "/contact",
  },
  {
    title: "DP Logistics",
    category: "Logistics",
    summary: "Designed an end-to-end delivery management experience for riders, customers and fleet managers.",
    cover: { src: "/projects/dplogistics.png", width: 393, height: 309 },
    placeholder: "#1A3F8C",
    href: "/projects/dp-logistics",
  },
];
