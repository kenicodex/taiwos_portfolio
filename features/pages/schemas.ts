import * as yup from "yup";
import { checkSlug } from "./slug";

const slugSchema = yup
  .string()
  .trim()
  .required("Slug is required")
  .test("is-valid-slug", function (value) {
    if (value === undefined) return true;
    const result = checkSlug(value);
    return result.valid ? true : this.createError({ message: result.reason });
  });

export const createPageSchema = yup.object({
  title: yup.string().trim().required("Title is required").max(120),
  slug: slugSchema,
});

export const updatePageSchema = yup
  .object({
    title: yup.string().trim().max(120).optional(),
    slug: slugSchema.optional(),
  })
  .test(
    "at-least-one",
    "Provide a title or slug",
    (value) => value?.title !== undefined || value?.slug !== undefined,
  );

const uuid = yup
  .string()
  .required()
  .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Must be a UUID");

/** Revision check: the client sends the draft version it edited; a mismatch means a newer save exists. */
export const saveDraftSchema = yup.object({
  expectedDraftVersionId: uuid,
  title: yup.string().trim().max(120).optional(),
  // Validated in full by the block schemas (validatePageContent). Not shaped here, so nothing is stripped.
  content: yup.mixed().required("Content is required"),
});

export const publishSchema = yup.object({
  expectedDraftVersionId: uuid,
});

export const restoreSchema = yup.object({
  expectedDraftVersionId: uuid,
  versionId: uuid,
});
