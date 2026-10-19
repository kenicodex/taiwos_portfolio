import * as yup from "yup";

// Validation for structured site content. The same schemas guard API writes, the public read path
// (an invalid stored value falls back to defaults) and the admin forms.

// Iconify ids such as "carbon:finance". Only bundled icons render, so the admin picker is the only way to set these.
const iconId = yup
  .string()
  .trim()
  .matches(/^[a-z0-9-]+:[a-z0-9-]+$/, "Use an icon id such as carbon:finance")
  .max(80)
  .required();

const text = (max: number) => yup.string().trim().max(max).required();
const optionalText = (max: number) => yup.string().trim().max(max).default("");

const paragraphs = yup.array().of(text(600)).min(1).max(4).required();

export const aboutIntroSchema = yup.object({
  pill: text(40),
  headingBefore: text(120),
  headingHighlight: text(60),
  paragraphs,
  resumeLabel: text(40),
  connectLabel: text(40),
  basedInLabel: text(30),
  basedInValue: text(60),
});

export const aboutSectionsSchema = yup.object({
  services: text(60),
  process: text(60),
  journey: text(60),
  tools: text(60),
  toolsDesign: text(40),
  toolsResearch: text(40),
  toolsCollaboration: text(40),
  industries: text(60),
  funFacts: text(60),
});

const ctaSchema = yup.object({
  heading: text(120),
  body: text(240),
  buttonLabel: text(40),
});

export const aboutCtaSchema = ctaSchema;
export const projectsCtaSchema = ctaSchema;
export const experienceCtaSchema = ctaSchema;

export const projectsPageSchema = yup.object({
  pill: text(40),
  heading: text(80),
  intro: text(400),
  resumeLabel: text(40),
  connectLabel: text(40),
  caseStudyLabel: text(40),
});

export const experiencePageSchema = yup.object({
  pill: text(40),
  headingBefore: text(120),
  headingHighlight: text(120),
  intro: text(600),
  quote: text(200),
});

export const contactPageSchema = yup.object({
  pill: text(40),
  heading: text(120),
  introLines: yup.array().of(text(200)).min(1).max(3).required(),
});

// Collection items. Each list is saved as a whole, so these describe one row.
export const aboutServiceSchema = yup.object({ icon: iconId, title: text(80), body: text(240) });
export const aboutProcessSchema = yup.object({
  icon: iconId,
  title: text(60),
  body: text(200),
  column: yup.string().oneOf(["left", "right"]).required(),
});
export const aboutJourneySchema = yup.object({
  year: text(20),
  body: text(400),
  current: yup.boolean().default(false),
});
export const aboutIndustrySchema = yup.object({ name: text(40), icon: iconId });
export const aboutFunFactSchema = yup.object({ text: text(160) });
export const contactDetailSchema = yup.object({
  icon: iconId,
  label: text(40),
  value: text(120),
  href: optionalText(300),
  // Optional Tailwind colour class for the icon, e.g. the red location pin.
  iconClassName: yup.string().trim().max(80).default(""),
});
export const contactTimelineSchema = yup.object({ label: text(60) });

/** Shared by the admin API and the defaults test: the list shape for a collection, with a size cap. */
export function listSchema<T extends yup.AnyObject>(item: yup.ObjectSchema<T>, max: number) {
  return yup.array().of(item).min(1).max(max).required();
}
