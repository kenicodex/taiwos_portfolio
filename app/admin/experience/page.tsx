import { requireAdminPage } from "@/lib/admin-session";
import { PageHeader } from "@/features/admin/ui";
import { RecordManager, type RecordField } from "@/features/admin/records/RecordManager";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

const fields: RecordField[] = [
  { name: "company", label: "Company", kind: "text", required: true },
  { name: "role", label: "Role", kind: "text", required: true },
  { name: "location", label: "Location", kind: "text", hint: "For example Remote." },
  { name: "startDate", label: "Start date", kind: "date", required: true },
  { name: "endDate", label: "End date", kind: "date" },
  { name: "isCurrent", label: "Current role", kind: "boolean", hint: "Shows “Present” instead of an end date." },
  { name: "periodLabel", label: "Period label (optional)", kind: "text", hint: "Overrides the dates, for example Mar 2025 - Present." },
  { name: "achievements", label: "Achievements", kind: "list", hint: "One bullet per line." },
  { name: "description", label: "Summary", kind: "textarea" },
  { name: "status", label: "Status", kind: "select", options: ["draft", "published"], hint: "Only published roles appear on the site." },
];

export default async function ExperienceAdminPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Experience" description="Work history on the Experience page. Drag order with Up and Down." />
      <RecordManager
        endpoint="experiences"
        singular="Role"
        plural="Roles"
        fields={fields}
        columns={[
          { key: "company", label: "Company" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status" },
        ]}
        blank={{ company: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, periodLabel: "", achievements: [], description: "", status: "draft" }}
        titleKey="company"
        hasOrder
      />
    </div>
  );
}
