import Link from "next/link";
import type { MerchantApplication, MerchantLead, MerchantLeadFilters, MerchantApplicationFilters } from "@/types/backend/onboarding";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { MerchantStatusBadge } from "@/components/admin/merchant/merchant-status-badge";

export function MerchantLeadsTable({
  rows,
  filters,
}: {
  rows: MerchantLead[];
  filters?: MerchantLeadFilters;
}) {
  return (
    <>
      <form className="mb-6" method="get">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input className="field-input" name="search" placeholder="Search business, contact, email" defaultValue={filters?.search || ""} />
            <input className="field-input" name="parish" placeholder="Parish" defaultValue={filters?.parish || ""} />
            <select className="field-input" name="status" defaultValue={filters?.status || ""}>
              <option value="">All lead statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewing">Reviewing</option>
              <option value="qualified">Qualified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="field-input" name="productIntent" defaultValue={filters?.productIntent || ""}>
              <option value="">All product intents</option>
              <option value="grabquik">GrabQuik</option>
              <option value="slyde_delivery">SLYDE delivery</option>
              <option value="both">Both</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </div>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Area</TableHeaderCell>
              <TableHeaderCell>Intent</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((lead) => (
              <tr key={lead.id}>
                <TableCell className="font-medium text-slate-950">{lead.businessName}</TableCell>
                <TableCell>
                  <div>{lead.contactName}</div>
                  <div className="text-xs text-slate-500">{lead.email}</div>
                </TableCell>
                <TableCell>{lead.town}, {lead.parish}</TableCell>
                <TableCell><MerchantStatusBadge status={lead.productIntent} /></TableCell>
                <TableCell><MerchantStatusBadge status={lead.status} /></TableCell>
                <TableCell>{new Date(lead.createdAt).toLocaleDateString("en-JM")}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </>
  );
}

export function MerchantApplicationsTable({
  rows,
  leadMap,
  filters,
}: {
  rows: MerchantApplication[];
  leadMap: Record<string, MerchantLead | undefined>;
  filters?: MerchantApplicationFilters;
}) {
  return (
    <>
      <form className="mb-6" method="get">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input className="field-input" name="search" placeholder="Search business, email, address" defaultValue={filters?.search || ""} />
            <input className="field-input" name="parish" placeholder="Parish" defaultValue={filters?.parish || ""} />
            <select className="field-input" name="approvalStatus" defaultValue={filters?.approvalStatus || ""}>
              <option value="">All approval states</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="field-input" name="activationStatus" defaultValue={filters?.activationStatus || ""}>
              <option value="">All activation states</option>
              <option value="pending">Pending</option>
              <option value="activated">Activated</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
            <select className="field-input" name="onboardingTrack" defaultValue={filters?.onboardingTrack || ""}>
              <option value="">All tracks</option>
              <option value="grabquik">GrabQuik</option>
              <option value="slyde_delivery">SLYDE delivery</option>
              <option value="both">Both</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </div>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Track</TableHeaderCell>
              <TableHeaderCell>Area</TableHeaderCell>
              <TableHeaderCell>Approval</TableHeaderCell>
              <TableHeaderCell>Activation</TableHeaderCell>
              <TableHeaderCell>Assigned</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((application) => {
              const lead = leadMap[application.merchantLeadId];
              return (
                <tr key={application.id}>
                  <TableCell>
                    <div className="font-medium text-slate-950">{lead?.businessName || application.storeName || "Merchant application"}</div>
                    <div className="text-xs text-slate-500">{lead?.contactName || "Unknown contact"}</div>
                  </TableCell>
                  <TableCell><MerchantStatusBadge status={application.onboardingTrack} /></TableCell>
                  <TableCell>{lead ? `${lead.town}, ${lead.parish}` : "Unknown"}</TableCell>
                  <TableCell><MerchantStatusBadge status={application.approvalStatus} /></TableCell>
                  <TableCell><MerchantStatusBadge status={application.activationStatus} /></TableCell>
                  <TableCell>{application.assignedAdminId || "Unassigned"}</TableCell>
                  <TableCell>
                    <Link href={`/admin/merchant-applications/${application.id}`} className="text-sm font-semibold text-sky-700">View application</Link>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>
    </>
  );
}
