import type * as yup from "yup";
import {
  ABOUT_CTA,
  ABOUT_INTRO,
  ABOUT_SECTIONS,
  CONTACT_PAGE,
  EXPERIENCE_CTA,
  EXPERIENCE_PAGE,
  PROJECTS_CTA,
  PROJECTS_PAGE,
} from "./defaults/copy";
import { FUN_FACTS, INDUSTRIES, JOURNEY, PROCESS_LEFT, PROCESS_RIGHT, SERVICES } from "./defaults/about";
import { DETAILS, TIMELINES } from "./defaults/contact";
import {
  aboutCtaSchema,
  aboutFunFactSchema,
  aboutIndustrySchema,
  aboutIntroSchema,
  aboutJourneySchema,
  aboutProcessSchema,
  aboutSectionsSchema,
  aboutServiceSchema,
  contactDetailSchema,
  contactPageSchema,
  contactTimelineSchema,
  experienceCtaSchema,
  experiencePageSchema,
  projectsCtaSchema,
  projectsPageSchema,
} from "./schemas";

// The single list of editable site content. The public queries, the seed script and the admin
// editors all read from here. Adding an editable section means adding one entry.

export type FieldKind = "text" | "textarea" | "list" | "icon" | "select" | "boolean" | "url";

export type FieldSpec = {
  name: string;
  label: string;
  kind: FieldKind;
  max?: number;
  options?: readonly string[];
};

export type DocumentDefinition = {
  kind: "document";
  key: string;
  label: string;
  usedBy: string;
  schema: yup.AnyObject | yup.ObjectSchema<yup.AnyObject>;
  defaults: Record<string, unknown>;
  fields: FieldSpec[];
};

export type CollectionDefinition = {
  kind: "collection";
  name: string;
  label: string;
  usedBy: string;
  max: number;
  // Items are validated one by one with this schema.
  itemSchema: yup.ObjectSchema<yup.AnyObject>;
  defaults: readonly Record<string, unknown>[];
  fields: FieldSpec[];
};

export const DOCUMENTS = [
  {
    kind: "document",
    key: "about.intro",
    label: "About: intro",
    usedBy: "/about",
    schema: aboutIntroSchema,
    defaults: { ...ABOUT_INTRO, paragraphs: [...ABOUT_INTRO.paragraphs] },
    fields: [
      { name: "pill", label: "Pill label", kind: "text", max: 40 },
      { name: "headingBefore", label: "Heading (before highlight)", kind: "text", max: 120 },
      { name: "headingHighlight", label: "Heading highlight (brand colour)", kind: "text", max: 60 },
      { name: "paragraphs", label: "Paragraphs", kind: "list", max: 4 },
      { name: "resumeLabel", label: "Resume button", kind: "text", max: 40 },
      { name: "connectLabel", label: "Connect button", kind: "text", max: 40 },
      { name: "basedInLabel", label: "Location badge label", kind: "text", max: 30 },
      { name: "basedInValue", label: "Location badge value", kind: "text", max: 60 },
    ],
  },
  {
    kind: "document",
    key: "about.sections",
    label: "About: section titles",
    usedBy: "/about",
    schema: aboutSectionsSchema,
    defaults: { ...ABOUT_SECTIONS },
    fields: [
      { name: "services", label: "Services title", kind: "text", max: 60 },
      { name: "process", label: "Process title", kind: "text", max: 60 },
      { name: "journey", label: "Journey title", kind: "text", max: 60 },
      { name: "tools", label: "Tools title", kind: "text", max: 60 },
      { name: "toolsDesign", label: "Tools: design", kind: "text", max: 40 },
      { name: "toolsResearch", label: "Tools: research", kind: "text", max: 40 },
      { name: "toolsCollaboration", label: "Tools: collaboration", kind: "text", max: 40 },
      { name: "industries", label: "Industries title", kind: "text", max: 60 },
      { name: "funFacts", label: "Fun facts title", kind: "text", max: 60 },
    ],
  },
  {
    kind: "document",
    key: "about.cta",
    label: "About: closing banner",
    usedBy: "/about",
    schema: aboutCtaSchema,
    defaults: { ...ABOUT_CTA },
    fields: ctaFields(),
  },
  {
    kind: "document",
    key: "projects.page",
    label: "Projects: page header",
    usedBy: "/projects",
    schema: projectsPageSchema,
    defaults: { ...PROJECTS_PAGE },
    fields: [
      { name: "pill", label: "Pill label", kind: "text", max: 40 },
      { name: "heading", label: "Heading", kind: "text", max: 80 },
      { name: "intro", label: "Intro", kind: "textarea", max: 400 },
      { name: "resumeLabel", label: "Resume button", kind: "text", max: 40 },
      { name: "connectLabel", label: "Connect button", kind: "text", max: 40 },
      { name: "caseStudyLabel", label: "Case study link", kind: "text", max: 40 },
    ],
  },
  {
    kind: "document",
    key: "projects.cta",
    label: "Projects: closing banner",
    usedBy: "/projects",
    schema: projectsCtaSchema,
    defaults: { ...PROJECTS_CTA },
    fields: ctaFields(),
  },
  {
    kind: "document",
    key: "experience.page",
    label: "Experience: page header",
    usedBy: "/experience",
    schema: experiencePageSchema,
    defaults: { ...EXPERIENCE_PAGE },
    fields: [
      { name: "pill", label: "Pill label", kind: "text", max: 40 },
      { name: "headingBefore", label: "Heading (before highlight)", kind: "text", max: 120 },
      { name: "headingHighlight", label: "Heading highlight (brand colour)", kind: "text", max: 120 },
      { name: "intro", label: "Intro", kind: "textarea", max: 600 },
      { name: "quote", label: "Quote card", kind: "text", max: 200 },
    ],
  },
  {
    kind: "document",
    key: "experience.cta",
    label: "Experience: closing banner",
    usedBy: "/experience",
    schema: experienceCtaSchema,
    defaults: { ...EXPERIENCE_CTA },
    fields: ctaFields(),
  },
  {
    kind: "document",
    key: "contact.page",
    label: "Contact: page header",
    usedBy: "/contact",
    schema: contactPageSchema,
    defaults: { ...CONTACT_PAGE, introLines: [...CONTACT_PAGE.introLines] },
    fields: [
      { name: "pill", label: "Pill label", kind: "text", max: 40 },
      { name: "heading", label: "Heading", kind: "text", max: 120 },
      { name: "introLines", label: "Intro lines", kind: "list", max: 3 },
    ],
  },
] as const satisfies readonly DocumentDefinition[];

export const COLLECTIONS = [
  {
    kind: "collection",
    name: "about.services",
    label: "About: services",
    usedBy: "/about",
    max: 8,
    itemSchema: aboutServiceSchema,
    defaults: SERVICES,
    fields: [
      { name: "icon", label: "Icon", kind: "icon" },
      { name: "title", label: "Title", kind: "text", max: 80 },
      { name: "body", label: "Description", kind: "textarea", max: 240 },
    ],
  },
  {
    kind: "collection",
    name: "about.process",
    label: "About: design process",
    usedBy: "/about",
    max: 9,
    itemSchema: aboutProcessSchema,
    defaults: [...PROCESS_LEFT.map((s) => ({ ...s, column: "left" })), ...PROCESS_RIGHT.map((s) => ({ ...s, column: "right" }))],
    fields: [
      { name: "icon", label: "Icon", kind: "icon" },
      { name: "title", label: "Title", kind: "text", max: 60 },
      { name: "body", label: "Description", kind: "textarea", max: 200 },
      { name: "column", label: "Column", kind: "select", options: ["left", "right"] },
    ],
  },
  {
    kind: "collection",
    name: "about.journey",
    label: "About: journey",
    usedBy: "/about",
    max: 10,
    itemSchema: aboutJourneySchema,
    // Every item carries `current` so the type is uniform; the schema default is false too.
    defaults: JOURNEY.map((entry) => ({ current: false, ...entry })),
    fields: [
      { name: "year", label: "Year", kind: "text", max: 20 },
      { name: "body", label: "Description", kind: "textarea", max: 400 },
      { name: "current", label: "Current role (shows “present”)", kind: "boolean" },
    ],
  },
  {
    kind: "collection",
    name: "about.industries",
    label: "About: industries",
    usedBy: "/about",
    max: 9,
    itemSchema: aboutIndustrySchema,
    defaults: INDUSTRIES,
    fields: [
      { name: "name", label: "Name", kind: "text", max: 40 },
      { name: "icon", label: "Icon", kind: "icon" },
    ],
  },
  {
    kind: "collection",
    name: "about.funFacts",
    label: "About: fun facts",
    usedBy: "/about",
    max: 8,
    itemSchema: aboutFunFactSchema,
    defaults: FUN_FACTS.map((text) => ({ text })),
    fields: [{ name: "text", label: "Fact", kind: "text", max: 160 }],
  },
  {
    kind: "collection",
    name: "contact.details",
    label: "Contact: details",
    usedBy: "/contact",
    max: 6,
    itemSchema: contactDetailSchema,
    // Every item carries the optional keys so the type is uniform. Empty means "not set".
    defaults: DETAILS.map((detail) => ({ href: "", iconClassName: "", ...detail })),
    fields: [
      { name: "icon", label: "Icon", kind: "icon" },
      { name: "label", label: "Label", kind: "text", max: 40 },
      { name: "value", label: "Value", kind: "text", max: 120 },
      { name: "href", label: "Link (optional)", kind: "url", max: 300 },
    ],
  },
  {
    kind: "collection",
    name: "contact.timelines",
    label: "Contact: project timelines",
    usedBy: "/contact",
    max: 8,
    itemSchema: contactTimelineSchema,
    defaults: TIMELINES.map((label) => ({ label })),
    fields: [{ name: "label", label: "Option", kind: "text", max: 60 }],
  },
] as const satisfies readonly CollectionDefinition[];

function ctaFields(): FieldSpec[] {
  return [
    { name: "heading", label: "Heading", kind: "text", max: 120 },
    { name: "body", label: "Body", kind: "textarea", max: 240 },
    { name: "buttonLabel", label: "Button", kind: "text", max: 40 },
  ];
}

export const DOCUMENT_KEYS = DOCUMENTS.map((d) => d.key);
export const COLLECTION_NAMES = COLLECTIONS.map((c) => c.name);

export function getDocumentDefinition(key: string) {
  return DOCUMENTS.find((d) => d.key === key);
}

export function getCollectionDefinition(name: string) {
  return COLLECTIONS.find((c) => c.name === name);
}
