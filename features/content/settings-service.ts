import "server-only";
import { revalidateTag } from "next/cache";
import { alias } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import * as yup from "yup";
import { db } from "@/db";
import { media, siteSettings } from "@/db/schema";
import { ApiError, UUID_PATTERN } from "@/lib/api";
import { DEFAULT_PRIMARY, themeFromPrimary, themeSchema, type ThemeConfiguration } from "@/features/site/theme";
import { PUBLIC_CONTENT_TAG } from "@/features/pages/service";

// Admin reads and writes for the site profile, navigation, social links and brand colour.
// Empty values fall back to the hardcoded profile (see getSiteProfile).

const HREF = /^(\/|https?:\/\/|mailto:|tel:)/;
const ICON = /^[a-z0-9-]+:[a-z0-9-]+$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const uuidOrNull = yup
  .string()
  .nullable()
  .default(null)
  .test("uuid", "Invalid file reference", (value) => value === null || value === undefined || UUID_PATTERN.test(value));

const link = yup.object({
  label: yup.string().trim().max(40).required("Enter a label"),
  href: yup.string().trim().max(300).matches(HREF, "Use a path starting with /, or an https, mailto or tel link").required(),
});

const social = yup.object({
  label: yup.string().trim().max(40).required("Enter a label"),
  href: yup.string().trim().max(300).matches(HREF, "Use an https, mailto or tel link").required(),
  icon: yup.string().trim().matches(ICON, "Use an icon id such as tabler:brand-linkedin").required(),
});

export const settingsSchema = yup.object({
  profile: yup.object({
    name: yup.string().trim().max(120).required("Enter your name"),
    role: yup.string().trim().max(120).default(""),
    initials: yup.string().trim().max(4).default(""),
    location: yup.string().trim().max(120).default(""),
    contactEmail: yup.string().trim().max(254).email("Enter a valid email").default(""),
    phone: yup.string().trim().max(40).default(""),
    availability: yup.string().trim().max(120).default(""),
    copyrightText: yup.string().trim().max(200).default(""),
  }),
  headerNav: yup.array().of(link).max(8).default([]),
  footerNav: yup.array().of(link).max(10).default([]),
  socialLinks: yup.array().of(social).max(6).default([]),
  primaryColor: yup.string().matches(HEX, "Use a 6-digit hex colour").required(),
  avatarMediaId: uuidOrNull,
  resumeMediaId: uuidOrNull,
  shareImageId: uuidOrNull,
});

export type SettingsInput = yup.InferType<typeof settingsSchema>;

export async function getSettingsForAdmin() {
  const avatar = alias(media, "avatar_file");
  const resume = alias(media, "resume_file");
  const share = alias(media, "share_file");
  const [row] = await db
    .select({
      ownerName: siteSettings.ownerName,
      role: siteSettings.role,
      initials: siteSettings.initials,
      location: siteSettings.location,
      contactEmail: siteSettings.contactEmail,
      phone: siteSettings.phone,
      availability: siteSettings.availability,
      copyrightText: siteSettings.copyrightText,
      headerNav: siteSettings.headerNav,
      footerNav: siteSettings.footerNav,
      socialLinks: siteSettings.socialLinks,
      themeConfiguration: siteSettings.themeConfiguration,
      profileImageId: siteSettings.profileImageId,
      resumeMediaId: siteSettings.resumeMediaId,
      shareImageId: siteSettings.shareImageId,
      avatarUrl: avatar.url,
      resumeUrl: resume.url,
      shareUrl: share.url,
      updatedAt: siteSettings.updatedAt,
    })
    .from(siteSettings)
    .leftJoin(avatar, eq(siteSettings.profileImageId, avatar.id))
    .leftJoin(resume, eq(siteSettings.resumeMediaId, resume.id))
    .leftJoin(share, eq(siteSettings.shareImageId, share.id))
    .limit(1);

  const theme = (row?.themeConfiguration ?? {}) as Partial<ThemeConfiguration>;
  return {
    profile: {
      name: row?.ownerName ?? "",
      role: row?.role ?? "",
      initials: row?.initials ?? "",
      location: row?.location ?? "",
      contactEmail: row?.contactEmail ?? "",
      phone: row?.phone ?? "",
      availability: row?.availability ?? "",
      copyrightText: row?.copyrightText ?? "",
    },
    headerNav: (row?.headerNav ?? []) as SettingsInput["headerNav"],
    footerNav: (row?.footerNav ?? []) as SettingsInput["footerNav"],
    socialLinks: (row?.socialLinks ?? []) as SettingsInput["socialLinks"],
    primaryColor: theme.primary ?? DEFAULT_PRIMARY,
    avatar: row?.profileImageId ? { id: row.profileImageId, url: row.avatarUrl ?? null } : null,
    resume: row?.resumeMediaId ? { id: row.resumeMediaId, url: row.resumeUrl ?? null } : null,
    shareImage: row?.shareImageId ? { id: row.shareImageId, url: row.shareUrl ?? null } : null,
    updatedAt: row?.updatedAt.toISOString() ?? null,
  };
}

async function assertMediaExists(id: string | null) {
  if (!id) return;
  const [row] = await db.select({ id: media.id }).from(media).where(eq(media.id, id));
  if (!row) throw new ApiError("BAD_REQUEST", "The selected file does not exist");
}

export async function saveSettings(raw: unknown, expectedUpdatedAt: string | null) {
  const input = await settingsSchema.validate(raw, { abortEarly: false, stripUnknown: true });
  await Promise.all([assertMediaExists(input.avatarMediaId), assertMediaExists(input.resumeMediaId), assertMediaExists(input.shareImageId)]);

  const theme = await themeSchema.validate(themeFromPrimary(input.primaryColor));
  const values = {
    ownerName: input.profile.name,
    siteTitle: input.profile.name,
    role: input.profile.role,
    initials: input.profile.initials,
    location: input.profile.location,
    contactEmail: input.profile.contactEmail,
    phone: input.profile.phone,
    availability: input.profile.availability,
    copyrightText: input.profile.copyrightText,
    headerNav: input.headerNav,
    footerNav: input.footerNav,
    socialLinks: input.socialLinks,
    themeConfiguration: theme,
    profileImageId: input.avatarMediaId,
    resumeMediaId: input.resumeMediaId,
    shareImageId: input.shareImageId,
  };

  const updatedAt = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ id: siteSettings.id, updatedAt: siteSettings.updatedAt })
      .from(siteSettings)
      .limit(1)
      .for("update");
    const stored = current?.updatedAt.getTime() ?? null;
    const expected = expectedUpdatedAt ? new Date(expectedUpdatedAt).getTime() : null;
    if (stored !== expected) {
      throw new ApiError("CONFLICT", "These settings changed since you opened them. Reload to see the latest version.");
    }

    const now = new Date();
    if (current) {
      await tx.update(siteSettings).set({ ...values, updatedAt: now }).where(eq(siteSettings.id, current.id));
    } else {
      await tx.insert(siteSettings).values({ ...values, updatedAt: now });
    }
    return now;
  });

  revalidateTag("site-settings", { expire: 0 });
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
  return { updatedAt: updatedAt.toISOString() };
}
