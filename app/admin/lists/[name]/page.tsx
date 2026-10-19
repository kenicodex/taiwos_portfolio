import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireAdminPage } from "@/lib/admin-session";
import { getCollectionForAdmin } from "@/features/content/admin-service";
import { COLLECTIONS, DOCUMENTS, getCollectionDefinition } from "@/features/content/registry";
import { CollectionEditor } from "@/features/admin/content/CollectionEditor";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

type Props = { params: Promise<{ name: string }> };

export default async function CollectionPage({ params }: Props) {
  await requireAdminPage();
  await connection();
  const { name } = await params;
  const definition = getCollectionDefinition(name);
  if (!definition) notFound();

  const data = await getCollectionForAdmin(name);
  const related = {
    documents: DOCUMENTS.filter((doc) => doc.usedBy === definition.usedBy),
    collections: COLLECTIONS.filter((collection) => collection.usedBy === definition.usedBy && collection.name !== name),
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={definition.label} description={`Shown on ${definition.usedBy}.`} />

      <nav aria-label="Sections on this page" className="flex flex-wrap gap-2">
        {related.documents.map((doc) => (
          <Link key={doc.key} href={`/admin/content/${doc.key}`} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-brand dark:border-neutral-700">
            {doc.label}
          </Link>
        ))}
        {related.collections.map((collection) => (
          <Link key={collection.name} href={`/admin/lists/${collection.name}`} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-brand dark:border-neutral-700">
            {collection.label}
          </Link>
        ))}
      </nav>

      <CollectionEditor
        name={name}
        fields={definition.fields}
        max={definition.max}
        initialItems={data.items as never}
        initialSource={data.source}
        initialUpdatedAt={data.updatedAt}
      />
    </div>
  );
}
