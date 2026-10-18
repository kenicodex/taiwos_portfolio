import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { PageContent } from "@/features/page-builder/blocks/types";

/* ------------------------------------------------------------------ */
/* Administrator authentication (single admin account)                  */
/* ------------------------------------------------------------------ */

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  // Format: scrypt$N$r$p$salt$hash (see lib/crypto.ts). Never store plain text.
  passwordHash: text("password_hash").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    // SHA-256 of the cookie value. The raw token is never stored.
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("admin_sessions_admin_id_idx").on(table.adminId)],
);

/* ------------------------------------------------------------------ */
/* Application tables                                                  */
/* ------------------------------------------------------------------ */

export const pageStatusEnum = pgEnum("page_status", ["draft", "published", "archived"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published"]);
export const contactStatusEnum = pgEnum("contact_status", ["new", "read", "archived"]);

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageProvider: text("storage_provider").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  url: text("url").notNull(),
  altText: text("alt_text").notNull().default(""),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    status: pageStatusEnum("status").notNull().default("draft"),
    // Circular reference with page_versions; resolved lazily.
    draftVersionId: uuid("draft_version_id").references((): AnyPgColumn => pageVersions.id, {
      onDelete: "set null",
    }),
    publishedVersionId: uuid("published_version_id").references((): AnyPgColumn => pageVersions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("pages_slug_unique").on(table.slug)],
);

export const pageVersions = pgTable(
  "page_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    contentJson: jsonb("content_json").$type<PageContent>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    unique("page_versions_page_number_unique").on(table.pageId, table.versionNumber),
    index("page_versions_page_id_idx").on(table.pageId),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    category: text("category").notNull().default(""),
    description: text("description").notNull().default(""),
    coverImageId: uuid("cover_image_id").references(() => media.id, { onDelete: "set null" }),
    technologies: text("technologies").array().notNull().default([]),
    repositoryUrl: text("repository_url"),
    liveUrl: text("live_url"),
    featured: boolean("featured").notNull().default(false),
    status: contentStatusEnum("status").notNull().default("draft"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("projects_slug_unique").on(table.slug),
    index("projects_display_order_idx").on(table.displayOrder),
  ],
);

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company: text("company").notNull(),
    role: text("role").notNull(),
    employmentType: text("employment_type"),
    location: text("location"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    description: text("description").notNull().default(""),
    achievements: text("achievements").array().notNull().default([]),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [index("experiences_display_order_idx").on(table.displayOrder)],
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    icon: text("icon"),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [index("skills_display_order_idx").on(table.displayOrder)],
);

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteTitle: text("site_title").notNull(),
  siteDescription: text("site_description").notNull().default(""),
  ownerName: text("owner_name").notNull(),
  profileImageId: uuid("profile_image_id").references(() => media.id, { onDelete: "set null" }),
  resumeUrl: text("resume_url"),
  themeConfiguration: jsonb("theme_configuration").notNull().default({}),
  socialLinks: jsonb("social_links").notNull().default([]),
  seoDefaults: jsonb("seo_defaults").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: contactStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contact_messages_status_idx").on(table.status)],
);
