import * as yup from "yup";
import {
  ALIGN_TOKENS,
  STAT_ICONS,
  type StatIcon,
  BACKGROUND_TOKENS,
  BLOCK_TYPES,
  type Block,
  type BlockConfigMap,
  type BlockType,
  type BlockStyle,
  type PageContent,
  PADDING_TOKENS,
} from "./types";

export const MAX_BLOCKS_PER_PAGE = 60;
export const BLOCK_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

// Allows same-site paths, http(s) URLs and mailto links. Blocks javascript:, data: and protocol-relative URLs.
const SAFE_HREF = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/;

const text = (max: number, label: string) =>
  yup.string().trim().max(max, `${label} must be ${max} characters or fewer`).default("");

const required = (max: number, label: string) => text(max, label).required(`${label} is required`);

const href = (label: string) =>
  yup
    .string()
    .trim()
    .max(2048)
    .matches(SAFE_HREF, `${label} must be a path, http(s) link or mailto link`)
    .default("");

const list = <T extends yup.AnyObject>(schema: yup.ObjectSchema<T>, max: number) =>
  yup.array().of(schema).max(max, `Use ${max} items or fewer`).default([]);

const schemas = {
  hero: yup.object({
    eyebrow: text(80, "Eyebrow"),
    headline: required(140, "Headline"),
    subheadline: text(300, "Subheadline"),
    primaryCtaLabel: text(40, "Button label"),
    primaryCtaHref: href("Button link"),
    secondaryCtaLabel: text(40, "Secondary button label"),
    secondaryCtaHref: href("Secondary button link"),
    imageSrc: yup
      .string()
      .trim()
      .max(200)
      .matches(/^(\/[^\s]*)?$/, "Image must be a local path starting with /")
      .default(""),
    imageAlt: text(160, "Image description"),
    showConnect: yup.boolean().default(false),
  }),
  about: yup.object({
    heading: required(120, "Heading"),
    body: text(4000, "Body"),
  }),
  projects: yup.object({
    eyebrow: text(80, "Eyebrow"),
    heading: text(120, "Heading"),
    viewAllLabel: text(40, "Button label"),
    viewAllHref: href("Button link"),
    featuredOnly: yup.boolean().default(false),
    limit: yup.number().integer().min(1).max(12).default(6),
  }),
  skills: yup.object({
    heading: text(120, "Heading"),
  }),
  experience: yup.object({
    heading: text(120, "Heading"),
    limit: yup.number().integer().min(1).max(20).default(10),
  }),
  education: yup.object({
    heading: text(120, "Heading"),
    items: list(
      yup.object({
        institution: required(160, "Institution"),
        qualification: text(160, "Qualification"),
        year: text(20, "Year"),
      }),
      10,
    ),
  }),
  services: yup.object({
    heading: text(120, "Heading"),
    items: list(
      yup.object({
        title: required(120, "Service title"),
        description: text(600, "Service description"),
      }),
      12,
    ),
  }),
  testimonials: yup.object({
    eyebrow: text(60, "Eyebrow"),
    heading: text(120, "Heading"),
    items: list(
      yup.object({
        quote: required(800, "Quote"),
        author: text(120, "Author"),
        role: text(160, "Role"),
        company: text(120, "Company"),
        logo: yup
          .string()
          .trim()
          .max(200)
          .matches(/^(\/companies\/[A-Za-z0-9._-]+)?$/, "Logo must be a file in /companies/")
          .default(""),
      }),
      12,
    ),
  }),
  statistics: yup.object({
    items: list(
      yup.object({
        value: required(20, "Value"),
        label: required(80, "Label"),
        description: text(160, "Description"),
        icon: yup.mixed<StatIcon>().oneOf(STAT_ICONS).required().default("briefcase"),
      }),
      8,
    ),
  }),
  contact: yup.object({
    heading: text(120, "Heading"),
    body: text(600, "Body"),
    email: yup.string().trim().email("Enter a valid email address").max(254).default(""),
  }),
  social_links: yup.object({
    links: list(
      yup.object({
        label: required(60, "Label"),
        url: yup
          .string()
          .trim()
          .required("URL is required")
          .matches(/^(https?:\/\/|mailto:)[^\s]+$/, "URL must be an http(s) or mailto link"),
      }),
      12,
    ),
  }),
  rich_text: yup.object({
    content: text(10000, "Content"),
  }),
  call_to_action: yup.object({
    heading: required(140, "Heading"),
    body: text(600, "Body"),
    buttonLabel: required(40, "Button label"),
    buttonHref: href("Button link").required("Button link is required"),
    showAvatar: yup.boolean().default(true),
  }),
  logo_cloud: yup.object({
    eyebrow: text(60, "Eyebrow"),
    heading: text(120, "Heading"),
    logos: list(
      yup.object({
        name: required(80, "Logo name"),
        src: yup
          .string()
          .trim()
          .required("Logo file is required")
          .matches(/^\/companies\/[A-Za-z0-9._-]+$/, "Logo must be a file in /companies/"),
      }),
      24,
    ),
  }),
  spacer: yup.object({
    size: yup.mixed<"sm" | "md" | "lg">().oneOf(["sm", "md", "lg"]).required().default("md"),
  }),
} satisfies { [K in BlockType]: yup.Schema<BlockConfigMap[K]> };

export const blockConfigSchemas = schemas;

export const blockStyleSchema: yup.ObjectSchema<BlockStyle> = yup.object({
  background: yup.mixed<BlockStyle["background"]>().oneOf(BACKGROUND_TOKENS).required().default("default"),
  paddingY: yup.mixed<BlockStyle["paddingY"]>().oneOf(PADDING_TOKENS).required().default("md"),
  align: yup.mixed<BlockStyle["align"]>().oneOf(ALIGN_TOKENS).required().default("left"),
}) as yup.ObjectSchema<BlockStyle>;

const blockEnvelopeSchema = yup.object({
  id: yup
    .string()
    .required("Block id is required")
    .matches(BLOCK_ID_PATTERN, "Block id contains invalid characters"),
  type: yup.mixed<BlockType>().oneOf(BLOCK_TYPES, "Unknown block type").required(),
  enabled: yup.boolean().default(true),
  style: blockStyleSchema.default({ background: "default", paddingY: "md", align: "left" }),
  config: yup.mixed().required("Block config is required"),
});

/**
 * Validates one block: the envelope first, then the config with the schema for its type.
 * Unknown keys are stripped so stored data cannot smuggle extra fields into renderers.
 */
export async function validateBlock(input: unknown): Promise<Block> {
  const envelope = await blockEnvelopeSchema.validate(input, { stripUnknown: true });
  const type = envelope.type;
  let config: unknown;
  try {
    config = await schemas[type].validate(envelope.config, { abortEarly: false, stripUnknown: true });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const field = error.inner[0]?.path;
      throw new yup.ValidationError(
        error.errors.join("; "),
        error.value,
        field ? `config.${field}` : "config",
      );
    }
    throw error;
  }
  return { ...envelope, type, config } as Block;
}

/** Validates a complete page definition: block count, unique ids and every block. */
export async function validatePageContent(input: unknown): Promise<PageContent> {
  const shape = yup
    .object({
      schemaVersion: yup.number().oneOf([1]).required(),
      blocks: yup
        .array()
        .max(MAX_BLOCKS_PER_PAGE, `A page can have at most ${MAX_BLOCKS_PER_PAGE} blocks`)
        .required(),
    })
    .validate(input, { stripUnknown: true });

  const parsed = await shape;
  const blocks: Block[] = [];

  for (const [index, raw] of parsed.blocks.entries()) {
    try {
      blocks.push(await validateBlock(raw));
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const path = `blocks[${index}]${error.path ? `.${error.path}` : ""}`;
        throw new yup.ValidationError(error.message, error.value, path);
      }
      throw error;
    }
  }

  const seen = new Set<string>();
  for (const block of blocks) {
    if (seen.has(block.id)) {
      throw new yup.ValidationError(`Duplicate block id "${block.id}"`, block.id, "blocks");
    }
    seen.add(block.id);
  }

  return { schemaVersion: 1, blocks };
}
