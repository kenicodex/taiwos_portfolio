import { requireAdminPage } from "@/lib/admin-session";
import { PageHeader } from "@/features/admin/ui";
import { RecordManager, type RecordField } from "@/features/admin/records/RecordManager";

// Blocking render: these pages read the session cookie before anything else, which cannot be streamed.
export const instant = false;

const fields: RecordField[] = [
  { name: "title", label: "Title", kind: "text", required: true },
  { name: "slug", label: "Address (slug)", kind: "text", hint: "Used in the page's web address. Leave it alone to keep the current one." },
  { name: "summary", label: "Summary", kind: "textarea", required: true },
  { name: "category", label: "Category", kind: "text", hint: "For example Fintech or Logistics." },
  { name: "role", label: "Your role", kind: "text" },
  { name: "duration", label: "Duration", kind: "text", hint: "For example 4 Months." },
  { name: "placeholderColor", label: "Placeholder colour", kind: "color", hint: "Shown behind the cover while it loads or when there is none." },
  { name: "coverImageId", label: "Cover image", kind: "media" },
  { name: "caseStudyUrl", label: "Case study link", kind: "url", hint: "Leave empty to use the project's own page. Use a path or https link." },
  { name: "description", label: "Case study text", kind: "textarea", hint: "Shown on the project's own page." },
  { name: "featured", label: "Featured", kind: "boolean", hint: "The featured project is shown large at the top." },
  { name: "status", label: "Status", kind: "select", options: ["draft", "published"], hint: "Only published projects appear on the site." },
];

export default async function ProjectsAdminPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Projects" description="The projects shown on the Projects page. The featured one is shown large at the top." />
      <RecordManager
        endpoint="projects"
        singular="Project"
        plural="Projects"
        fields={fields}
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status" },
          { key: "featured", label: "Featured" },
        ]}
        blank={{ title: "", slug: "", summary: "", category: "", role: "", duration: "", placeholderColor: "#1A1A1A", coverImageId: null, caseStudyUrl: "", description: "", featured: false, status: "draft" }}
        titleKey="title"
        keepOnBlank={["slug"]}
        hasOrder
      />
    </div>
  );
}
