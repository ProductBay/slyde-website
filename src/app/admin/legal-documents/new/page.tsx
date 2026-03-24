import { AdminShell } from "@/components/admin/admin-shell";
import { LegalDocumentEditor } from "@/components/admin/legal-document-editor";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function NewLegalDocumentPage() {
  const { user, mode } = await getAdminPageContext();

  return (
    <AdminShell
      title="New Legal Draft"
      description="Create a new draft version for a SLYDE legal document type. Drafts can be edited before publishing and activation."
      adminName={user.fullName}
      mode={mode}
    >
      <LegalDocumentEditor mode="new" />
    </AdminShell>
  );
}
