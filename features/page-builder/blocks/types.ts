// Block definitions are plain data. The database stores these shapes; the
// trusted registry (registry.tsx) decides how each type is rendered.

export const BLOCK_TYPES = [
  "hero",
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "services",
  "testimonials",
  "statistics",
  "contact",
  "social_links",
  "rich_text",
  "call_to_action",
  "spacer",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BACKGROUND_TOKENS = ["default", "muted", "inverse"] as const;
export const PADDING_TOKENS = ["none", "sm", "md", "lg"] as const;
export const ALIGN_TOKENS = ["left", "center"] as const;

export type BlockStyle = {
  background: (typeof BACKGROUND_TOKENS)[number];
  paddingY: (typeof PADDING_TOKENS)[number];
  align: (typeof ALIGN_TOKENS)[number];
};

export type LinkItem = { label: string; url: string };

export const STAT_ICONS = ["briefcase", "layers", "globe", "monitor"] as const;
export type StatIcon = (typeof STAT_ICONS)[number];

export type HeroConfig = {
  eyebrow: string;
  /** Use *word* to highlight a word in the brand colour. */
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  /** Local path (starts with /) to the portrait. */
  imageSrc: string;
  imageAlt: string;
  /** Shows the "Let's connect" row with the profile's social links. */
  showConnect: boolean;
};

export type AboutConfig = { heading: string; body: string };
export type ProjectsConfig = {
  eyebrow: string;
  heading: string;
  viewAllLabel: string;
  viewAllHref: string;
  featuredOnly: boolean;
  limit: number;
};
export type SkillsConfig = { heading: string };
export type ExperienceConfig = { heading: string; limit: number };
export type EducationConfig = {
  heading: string;
  items: { institution: string; qualification: string; year: string }[];
};
export type ServicesConfig = {
  heading: string;
  items: { title: string; description: string }[];
};
export type TestimonialsConfig = {
  heading: string;
  items: { quote: string; author: string; role: string }[];
};
export type StatisticsConfig = {
  items: { value: string; label: string; description: string; icon: StatIcon }[];
};
export type ContactConfig = { heading: string; body: string; email: string };
export type SocialLinksConfig = { links: LinkItem[] };
export type RichTextConfig = { content: string };
export type CallToActionConfig = {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
};
export type SpacerConfig = { size: "sm" | "md" | "lg" };

export type BlockConfigMap = {
  hero: HeroConfig;
  about: AboutConfig;
  projects: ProjectsConfig;
  skills: SkillsConfig;
  experience: ExperienceConfig;
  education: EducationConfig;
  services: ServicesConfig;
  testimonials: TestimonialsConfig;
  statistics: StatisticsConfig;
  contact: ContactConfig;
  social_links: SocialLinksConfig;
  rich_text: RichTextConfig;
  call_to_action: CallToActionConfig;
  spacer: SpacerConfig;
};

/** Discriminated union: narrowing on `type` gives the matching config. */
export type Block = {
  [K in BlockType]: {
    id: string;
    type: K;
    enabled: boolean;
    style: BlockStyle;
    config: BlockConfigMap[K];
  };
}[BlockType];

export type PageContent = {
  schemaVersion: 1;
  blocks: Block[];
};
