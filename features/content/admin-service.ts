import "server-only";
import { revalidateTag } from "next/cache";
import { eq, max } from "drizzle-orm";
import * as yup from "yup";
import { db } from "@/db";
import { contentDocuments, contentItems } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { getCollectionDefinition, getDocumentDefinition, type FieldSpec } from "./registry";

// Admin reads and writes for structured content. Documents store only the fields that differ from
// their defaults, so "Reset to default" for a field is just saving the default value.

type Json = Record<string, unknown>;

function sameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Keeps only the fields that differ from the default. Everything else falls back to it. */
function overridesOf(values: Json, defaults: Json): Json {
  const overrides: Json = {};
  for (const key of Object.keys(values)) {
    if (!sameValue(values[key], defaults[key])) overrides[key] = values[key];
  }
  return overrides;
}

function sameTimestamp(stored: Date | null, expected: string | null) {
  if (!stored && !expected) return true;
  if (!stored || !expected) return false;
  return stored.getTime() === new Date(expected).getTime();
}

function conflict() {
  return new ApiError("CONFLICT", "This content changed since you opened it. Reload to see the latest version.");
}

// ---------- documents ----------

export async function getDocumentForAdmin(key: string) {
  const definition = getDocumentDefinition(key);
  if (!definition) throw new ApiError("NOT_FOUND", "Unknown content");
  const defaults = definition.defaults as Json;

  const [row] = await db
    .select({ data: contentDocuments.data, updatedAt: contentDocuments.updatedAt })
    .from(contentDocuments)
    .where(eq(contentDocuments.key, key))
    .limit(1);
  const overrides = (row?.data ?? {}) as Json;
  const values = { ...defaults, ...overrides };
  return {
    key,
    label: definition.label,
    usedBy: definition.usedBy,
    fields: definition.fields as FieldSpec[],
    values,
    defaults,
    customised: Object.keys(overrides),
    updatedAt: row?.updatedAt.toISOString() ?? null,
  };
}

export async function saveDocument(key: string, input: { values: Json; expectedUpdatedAt: string | null }) {
  const definition = getDocumentDefinition(key);
  if (!definition) throw new ApiError("NOT_FOUND", "Unknown content");
  const defaults = definition.defaults as Json;

  const values = await definition.schema.validate(
    { ...defaults, ...input.values },
    { abortEarly: false, stripUnknown: true },
  );
  const overrides = overridesOf(values as Json, defaults);

  const updatedAt = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ updatedAt: contentDocuments.updatedAt })
      .from(contentDocuments)
      .where(eq(contentDocuments.key, key))
      .for("update");
    if (!sameTimestamp(current?.updatedAt ?? null, input.expectedUpdatedAt)) throw conflict();

    const now = new Date();
    await tx
      .insert(contentDocuments)
      .values({ key, data: overrides, updatedAt: now })
      .onConflictDoUpdate({ target: contentDocuments.key, set: { data: overrides, updatedAt: now } });
    return now;
  });

  revalidateTag(`content:${key}`, { expire: 0 });
  return { key, values, customised: Object.keys(overrides), updatedAt: updatedAt.toISOString() };
}

/** Removes every override for the document, so it shows its defaults again. */
export async function resetDocument(key: string) {
  if (!getDocumentDefinition(key)) throw new ApiError("NOT_FOUND", "Unknown content");
  await db.delete(contentDocuments).where(eq(contentDocuments.key, key));
  revalidateTag(`content:${key}`, { expire: 0 });
}

// ---------- collections ----------

export async function getCollectionForAdmin(name: string) {
  const definition = getCollectionDefinition(name);
  if (!definition) throw new ApiError("NOT_FOUND", "Unknown content");

  const rows = await db
    .select({ id: contentItems.id, data: contentItems.data, visible: contentItems.visible, updatedAt: contentItems.updatedAt })
    .from(contentItems)
    .where(eq(contentItems.collection, name))
    .orderBy(contentItems.displayOrder);

  const usingDefaults = rows.length === 0;
  const items = usingDefaults
    ? definition.defaults.map((item) => ({ ...item, visible: true }))
    : rows.map((row) => ({ ...(row.data as Json), visible: row.visible }));
  const updatedAt = rows.reduce<Date | null>((latest, row) => (!latest || row.updatedAt > latest ? row.updatedAt : latest), null);

  return {
    name,
    label: definition.label,
    usedBy: definition.usedBy,
    fields: definition.fields as FieldSpec[],
    max: definition.max,
    source: usingDefaults ? ("defaults" as const) : ("saved" as const),
    items,
    updatedAt: updatedAt?.toISOString() ?? null,
  };
}

const visibleFlag = yup.boolean().default(true);

/**
 * Replaces the whole list in one transaction, so the order and the set of items always match what the
 * admin saw. Saving a list that was showing defaults stores it, which is also how defaults are imported.
 */
export async function saveCollection(
  name: string,
  input: { items: Array<Json & { visible?: boolean }>; expectedUpdatedAt: string | null },
) {
  const definition = getCollectionDefinition(name);
  if (!definition) throw new ApiError("NOT_FOUND", "Unknown content");
  if (input.items.length > definition.max) {
    throw new ApiError("VALIDATION_FAILED", `Use at most ${definition.max} items`);
  }

  const validated: { data: Json; visible: boolean; displayOrder: number }[] = [];
  for (const [index, item] of input.items.entries()) {
    const data = await definition.itemSchema.validate(item, { abortEarly: false, stripUnknown: true });
    validated.push({
      data,
      visible: await visibleFlag.validate(item.visible),
      displayOrder: index,
    });
  }

  const updatedAt = await db.transaction(async (tx) => {
    const [latest] = await tx
      .select({ latest: max(contentItems.updatedAt) })
      .from(contentItems)
      .where(eq(contentItems.collection, name));
    const stored = latest?.latest ? new Date(latest.latest) : null;
    if (!sameTimestamp(stored, input.expectedUpdatedAt)) throw conflict();

    const now = new Date();
    await tx.delete(contentItems).where(eq(contentItems.collection, name));
    if (validated.length > 0) {
      await tx.insert(contentItems).values(
        validated.map((item) => ({
          collection: name,
          data: item.data as Json,
          visible: item.visible,
          displayOrder: item.displayOrder,
          updatedAt: now,
        })),
      );
    }
    return now;
  });

  revalidateTag(`collection:${name}`, { expire: 0 });
  return { name, count: validated.length, updatedAt: updatedAt.toISOString() };
}

/** Deletes the saved list, so the defaults show again. */
export async function resetCollection(name: string) {
  if (!getCollectionDefinition(name)) throw new ApiError("NOT_FOUND", "Unknown content");
  await db.delete(contentItems).where(eq(contentItems.collection, name));
  revalidateTag(`collection:${name}`, { expire: 0 });
}
