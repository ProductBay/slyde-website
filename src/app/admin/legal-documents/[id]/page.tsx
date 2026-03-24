import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { LegalDocumentEditor } from "@/components/admin/legal-document-editor";
import { Timeline } from "@/components/admin/timeline";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getLegalDocumentById } from "@/modules/legal/services/legal-document.service";

export default async function LegalDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getLegalDocumentById(id)]);
  if (!detail.document) notFound();

  return (
    <AdminShell
      title="Legal Document Editor"
      description="Review metadata, content, publish state, and version history for this legal document."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="mb-6 surface-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-950">{detail.document.title}</h2>
          <StatusBadge status={detail.document.status} />
          <StatusBadge status={detail.document.isActive ? "active" : "disabled"} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Type: {detail.document.documentType}</span>
          <span>Version: {detail.document.version}</span>
          <span>Slug: /legal/{detail.document.slug}</span>
        </div>
        <Link href={`/admin/legal-documents/${detail.document.id}/history`} className="mt-4 inline-flex text-sm font-semibold text-sky-700">
          Open full history
        </Link>
      </div>

      <LegalDocumentEditor
        mode="edit"
        document={{
          id: detail.document.id,
          documentType: detail.document.documentType,
          title: detail.document.title,
          slug: detail.document.slug,
          version: detail.document.version,
          summary: detail.document.summary,
          excerpt: detail.document.excerpt,
          effectiveFrom: detail.document.effectiveFrom,
          contentMarkdown: detail.document.contentMarkdown,
          status: detail.document.status,
          isActive: detail.document.isActive,
        }}
      />

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Recent History</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Publish and activation timeline</h3>
        </div>
        <Timeline
          items={detail.history.map((item) => ({
            id: item.id,
            title: item.action.replace(/_/g, " "),
            meta: `${item.actedBy || "System"} · ${new Date(item.createdAt).toLocaleString("en-JM")}`,
            body: item.note,
          }))}
        />
      </section>
    </AdminShell>
  );
}
