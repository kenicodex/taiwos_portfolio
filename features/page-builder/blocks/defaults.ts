import type { Block, BlockConfigMap, BlockStyle, BlockType, PageContent } from "./types";

export const DEFAULT_STYLE: BlockStyle = { background: "default", paddingY: "md", align: "left" };

export const DEFAULT_CONFIGS: { [K in BlockType]: BlockConfigMap[K] } = {
  hero: {
    eyebrow: "Product Designer",
    headline: "Designing products people *trust* and are *happy* to use.",
    subheadline:
      "Hi, I'm a Product Designer with 5+ years of experience creating intuitive Fintech, AI, Healthcare and enterprise products. I simplify complex workflows into experiences that drive business and user satisfaction.",
    primaryCtaLabel: "Let's Work Together!",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "View My works",
    secondaryCtaHref: "/projects",
    imageSrc: "",
    imageAlt: "",
    showConnect: true,
  },
  about: { heading: "About me", body: "Tell visitors who you are and what you care about." },
  projects: {
    eyebrow: "Featured Works",
    heading: "Recent Projects",
    viewAllLabel: "View all projects",
    viewAllHref: "/projects",
    featuredOnly: true,
    limit: 4,
  },
  skills: { heading: "Skills" },
  experience: { heading: "Experience", limit: 10 },
  education: { heading: "Education", items: [] },
  services: { heading: "What I offer", items: [] },
  testimonials: { heading: "Kind words", items: [] },
  statistics: { items: [] },
  contact: { heading: "Get in touch", body: "Open to interesting projects and conversations.", email: "" },
  social_links: { links: [] },
  rich_text: { content: "Write anything here. Separate paragraphs with a blank line." },
  call_to_action: {
    heading: "Ready to start?",
    body: "Let's talk about what you need.",
    buttonLabel: "Contact me",
    buttonHref: "/contact",
  },
  spacer: { size: "md" },
};

export function createBlock<K extends BlockType>(type: K, id: string): Extract<Block, { type: K }> {
  return {
    id,
    type,
    enabled: true,
    style: { ...DEFAULT_STYLE },
    config: structuredClone(DEFAULT_CONFIGS[type]),
  } as unknown as Extract<Block, { type: K }>;
}

export function createEmptyPageContent(): PageContent {
  return { schemaVersion: 1, blocks: [] };
}
