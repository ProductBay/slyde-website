import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Timeline } from "@/components/admin/timeline";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getLegalDocumentById } from "@/modules/legal/services/legal-document.service";

export default async function LegalDocumentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getLegalDocumentById(id)]);
  if (!detail.document) notFound();

  return (
    <AdminShell
      title="Legal Document History"
      description="Full publish, activation, and archive history for this legal document version."
      adminName={user.fullName}
      mode={mode}
    >
      <Timeline
        items={detail.history.map((item) => ({
          id: item.id,
          title: item.action.replace(/_/g, " "),
          meta: `${item.actedBy || "System"} · ${new Date(item.createdAt).toLocaleString("en-JM")}`,
          body: item.note,
        }))}
      />
    </AdminShell>
  );
}
