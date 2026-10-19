import { requireAdminPage } from "@/lib/admin-session";
import { PageHeader } from "@/features/admin/ui";
import { RecordManager, type RecordField } from "@/features/admin/records/RecordManager";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

const fields: RecordField[] = [
  { name: "name", label: "Name", kind: "text", required: true },
  { name: "category", label: "Group", kind: "select", options: ["design", "research", "collaboration"], hint: "Which list on the About page this belongs to." },
  { name: "iconMediaId", label: "Logo", kind: "media", hint: "Only used for design and collaboration tools." },
  { name: "visible", label: "Show on site", kind: "boolean" },
];

export default async function ToolsAdminPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tools & skills" description="The tools listed under Tools & Skills on the About page." />
      <RecordManager
        endpoint="skills"
        singular="Tool"
        plural="Tools"
        fields={fields}
        columns={[
          { key: "category", label: "Group" },
          { key: "visible", label: "Shown" },
        ]}
        blank={{ name: "", category: "design", iconMediaId: null, visible: true }}
        titleKey="name"
        hasOrder
      />
    </div>
  );
}
