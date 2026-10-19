import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireAdminPage } from "@/lib/admin-session";
import { getDocumentForAdmin } from "@/features/content/admin-service";
import { COLLECTIONS, DOCUMENTS, getDocumentDefinition } from "@/features/content/registry";
import { DocumentEditor } from "@/features/admin/content/DocumentEditor";
import { PageHeader } from "@/features/admin/ui";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

type Props = { params: Promise<{ key: string }> };

export default async function DocumentPage({ params }: Props) {
  await requireAdminPage();
  await connection();
  const { key } = await params;
  const definition = getDocumentDefinition(key);
  if (!definition) notFound();

  const data = await getDocumentForAdmin(key);
  const related = {
    documents: DOCUMENTS.filter((doc) => doc.usedBy === definition.usedBy && doc.key !== key),
    collections: COLLECTIONS.filter((collection) => collection.usedBy === definition.usedBy),
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={definition.label}
        description={`Shown on ${definition.usedBy}. Blank fields are not allowed. Empty values fall back to the original text.`}
        actions={
          <Link href={definition.usedBy} className="inline-flex h-10 items-center rounded-full border border-neutral-300 px-5 text-sm font-medium dark:border-neutral-700">
            View page
          </Link>
        }
      />

      {(related.documents.length > 0 || related.collections.length > 0) && (
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
      )}

      <DocumentEditor
        docKey={key}
        fields={definition.fields}
        initialValues={data.values}
        defaults={data.defaults}
        initialCustomised={data.customised}
        initialUpdatedAt={data.updatedAt}
      />
    </div>
  );
}
