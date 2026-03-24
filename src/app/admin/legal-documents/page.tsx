import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listLegalDocuments } from "@/modules/legal/services/legal-document.service";

export default async function AdminLegalDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, documents] = await Promise.all([
    getAdminPageContext(),
    listLegalDocuments({
      category: typeof params.category === "string" ? params.category : undefined,
      documentType: typeof params.documentType === "string" ? params.documentType : undefined,
      status: typeof params.status === "string" ? (params.status as never) : undefined,
      active: typeof params.active === "string" ? params.active : undefined,
      actorScope: typeof params.actorScope === "string" ? params.actorScope : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Legal Documents"
      description="Manage versioned SLYDE legal content, create drafts, publish updates, activate current versions, and inspect acceptance counts."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select className="field-input" name="category" defaultValue={typeof params.category === "string" ? params.category : ""}>
              <option value="">All categories</option>
              <option value="slyder">Slyder</option>
              <option value="merchant">Merchant</option>
              <option value="global">Global</option>
            </select>
            <select className="field-input" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select className="field-input" name="active" defaultValue={typeof params.active === "string" ? params.active : ""}>
              <option value="">Any active state</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
            <select className="field-input" name="actorScope" defaultValue={typeof params.actorScope === "string" ? params.actorScope : ""}>
              <option value="">All actor scopes</option>
              <option value="slyder_applicant">Slyder applicant</option>
              <option value="slyder_user">Slyder user</option>
              <option value="merchant_interest">Merchant interest</option>
              <option value="merchant_user">Merchant user</option>
              <option value="public_user">Public user</option>
            </select>
            <input className="field-input" name="documentType" placeholder="Type key" defaultValue={typeof params.documentType === "string" ? params.documentType : ""} />
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
            <Link href="/admin/legal-documents/new" className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white">
              New draft
            </Link>
          </div>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Version</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Active</TableHeaderCell>
              <TableHeaderCell>Published</TableHeaderCell>
              <TableHeaderCell>Acceptances</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {documents.map((document) => (
              <tr key={document.id}>
                <TableCell className="font-medium text-slate-950">{document.title}</TableCell>
                <TableCell>{document.documentType}</TableCell>
                <TableCell>{document.categoryKey}</TableCell>
                <TableCell>{document.version}</TableCell>
                <TableCell><StatusBadge status={document.status} /></TableCell>
                <TableCell><StatusBadge status={document.isActive ? "active" : "disabled"} /></TableCell>
                <TableCell>{document.publishedAt ? new Date(document.publishedAt).toLocaleDateString("en-JM") : "Not published"}</TableCell>
                <TableCell>{document.acceptanceCount}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/legal-documents/${document.id}`} className="text-sm font-semibold text-sky-700">View/edit</Link>
                    <Link href={`/admin/legal-documents/${document.id}/history`} className="text-sm font-semibold text-slate-700">History</Link>
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
