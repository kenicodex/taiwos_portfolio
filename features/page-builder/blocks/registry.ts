import type { ComponentType } from "react";
import * as Blocks from "../render/blocks";
import type { BlockRenderProps } from "../render/blocks";
import { blockConfigSchemas } from "./schemas";
import { DEFAULT_CONFIGS } from "./defaults";
import { BLOCK_TYPES, type BlockConfigMap, type BlockType } from "./types";
import type * as yup from "yup";

export const BLOCK_CATEGORIES = ["Intro", "Content", "Proof", "Contact", "Layout"] as const;
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

export type BlockDefinition<K extends BlockType> = {
  type: K;
  label: string;
  description: string;
  category: BlockCategory;
  defaultConfig: BlockConfigMap[K];
  schema: yup.Schema<BlockConfigMap[K]>;
  Render: ComponentType<BlockRenderProps<K>>;
};

type RegistryShape = { [K in BlockType]: BlockDefinition<K> };

// The single trusted source of block types. Database rows can only select a key from here.
export const BLOCK_REGISTRY: RegistryShape = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Headline, intro and primary call to action",
    category: "Intro",
    defaultConfig: DEFAULT_CONFIGS.hero,
    schema: blockConfigSchemas.hero,
    Render: Blocks.HeroBlock,
  },
  about: {
    type: "about",
    label: "About",
    description: "Short biography in one or more paragraphs",
    category: "Intro",
    defaultConfig: DEFAULT_CONFIGS.about,
    schema: blockConfigSchemas.about,
    Render: Blocks.AboutBlock,
  },
  projects: {
    type: "projects",
    label: "Projects",
    description: "Highlights of published projects",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.projects,
    schema: blockConfigSchemas.projects,
    Render: Blocks.ProjectsBlock,
  },
  skills: {
    type: "skills",
    label: "Skills",
    description: "Published skills grouped by category",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.skills,
    schema: blockConfigSchemas.skills,
    Render: Blocks.SkillsBlock,
  },
  experience: {
    type: "experience",
    label: "Experience",
    description: "Published work history",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.experience,
    schema: blockConfigSchemas.experience,
    Render: Blocks.ExperienceBlock,
  },
  education: {
    type: "education",
    label: "Education",
    description: "Qualifications and institutions",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.education,
    schema: blockConfigSchemas.education,
    Render: Blocks.EducationBlock,
  },
  services: {
    type: "services",
    label: "Services",
    description: "What you offer, as a list of cards",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.services,
    schema: blockConfigSchemas.services,
    Render: Blocks.ServicesBlock,
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Quotes from clients or colleagues",
    category: "Proof",
    defaultConfig: DEFAULT_CONFIGS.testimonials,
    schema: blockConfigSchemas.testimonials,
    Render: Blocks.TestimonialsBlock,
  },
  statistics: {
    type: "statistics",
    label: "Statistics",
    description: "Key numbers with labels",
    category: "Proof",
    defaultConfig: DEFAULT_CONFIGS.statistics,
    schema: blockConfigSchemas.statistics,
    Render: Blocks.StatisticsBlock,
  },
  contact: {
    type: "contact",
    label: "Contact",
    description: "Contact invitation with an email address",
    category: "Contact",
    defaultConfig: DEFAULT_CONFIGS.contact,
    schema: blockConfigSchemas.contact,
    Render: Blocks.ContactBlock,
  },
  social_links: {
    type: "social_links",
    label: "Social links",
    description: "Links to profiles and elsewhere on the web",
    category: "Contact",
    defaultConfig: DEFAULT_CONFIGS.social_links,
    schema: blockConfigSchemas.social_links,
    Render: Blocks.SocialLinksBlock,
  },
  rich_text: {
    type: "rich_text",
    label: "Rich text",
    description: "Plain paragraphs separated by blank lines",
    category: "Content",
    defaultConfig: DEFAULT_CONFIGS.rich_text,
    schema: blockConfigSchemas.rich_text,
    Render: Blocks.RichTextBlock,
  },
  call_to_action: {
    type: "call_to_action",
    label: "Call to action",
    description: "Heading with a button that links somewhere",
    category: "Contact",
    defaultConfig: DEFAULT_CONFIGS.call_to_action,
    schema: blockConfigSchemas.call_to_action,
    Render: Blocks.CallToActionBlock,
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    description: "Vertical space between sections",
    category: "Layout",
    defaultConfig: DEFAULT_CONFIGS.spacer,
    schema: blockConfigSchemas.spacer,
    Render: Blocks.SpacerBlock,
  },
};

export type AnyBlockDefinition = { [K in BlockType]: BlockDefinition<K> }[BlockType];

export function getBlockDefinition(type: string): AnyBlockDefinition | undefined {
  if (!(BLOCK_TYPES as readonly string[]).includes(type)) return undefined;
  return BLOCK_REGISTRY[type as BlockType];
}

export const BLOCK_LIBRARY = BLOCK_TYPES.map((type) => BLOCK_REGISTRY[type]);
