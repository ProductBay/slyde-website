import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listLegalAcceptances } from "@/modules/legal/services/legal-document.service";

export default async function AdminLegalAcceptancesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, acceptances] = await Promise.all([
    getAdminPageContext(),
    listLegalAcceptances({
      actorType: typeof params.actorType === "string" ? params.actorType : undefined,
      documentType: typeof params.documentType === "string" ? params.documentType : undefined,
      version: typeof params.version === "string" ? params.version : undefined,
      source: typeof params.source === "string" ? params.source : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Legal Acceptances"
      description="Search and audit acceptance records across Slyder, merchant, and public legal flows."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select className="field-input" name="actorType" defaultValue={typeof params.actorType === "string" ? params.actorType : ""}>
              <option value="">All actor types</option>
              <option value="slyder_applicant">Slyder applicant</option>
              <option value="slyder_user">Slyder user</option>
              <option value="merchant_interest">Merchant interest</option>
              <option value="merchant_user">Merchant user</option>
              <option value="public_user">Public user</option>
              <option value="admin_user">Admin user</option>
            </select>
            <input className="field-input" name="documentType" placeholder="Document type key" defaultValue={typeof params.documentType === "string" ? params.documentType : ""} />
            <input className="field-input" name="version" placeholder="Version" defaultValue={typeof params.version === "string" ? params.version : ""} />
            <select className="field-input" name="source" defaultValue={typeof params.source === "string" ? params.source : ""}>
              <option value="">All sources</option>
              <option value="website_form">Website form</option>
              <option value="onboarding_portal">Onboarding portal</option>
              <option value="activation_flow">Activation flow</option>
              <option value="admin_created">Admin action</option>
              <option value="api">API</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Actor</TableHeaderCell>
              <TableHeaderCell>Actor Type</TableHeaderCell>
              <TableHeaderCell>Document</TableHeaderCell>
              <TableHeaderCell>Version</TableHeaderCell>
              <TableHeaderCell>Accepted At</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>IP / User Agent</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {acceptances.map((acceptance) => (
              <tr key={acceptance.id}>
                <TableCell className="font-medium text-slate-950">{acceptance.actorId}</TableCell>
                <TableCell>{acceptance.actorType}</TableCell>
                <TableCell>{acceptance.documentTitleSnapshot}</TableCell>
                <TableCell>{acceptance.documentVersion}</TableCell>
                <TableCell>{new Date(acceptance.acceptedAt).toLocaleString("en-JM")}</TableCell>
                <TableCell>{acceptance.acceptanceSource}</TableCell>
                <TableCell>{acceptance.ipAddress || "Unknown"}{acceptance.userAgent ? ` | ${acceptance.userAgent}` : ""}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
