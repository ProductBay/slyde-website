import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listFleetLeads } from "@/modules/fleet/services/fleet-lead.service";
import type { FleetLeadStatus } from "@/modules/fleet/schemas/fleet-lead.schema";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary", "St. Ann",
  "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth",
  "Manchester", "Clarendon", "St. Catherine",
];

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PARTNERSHIP_REVIEW", "APPROVED", "NOT_READY", "ARCHIVED"];

function whatsappHref(phone: string, ownerName: string) {
  const normalized = phone.replace(/\D/g, "");
  const number = normalized.startsWith("1") ? normalized : `1${normalized}`;
  const message = `Hi ${ownerName}, this is SLYDE Logistics. Thanks for your interest in fleet partnership opportunities. We'd like to learn more about your operating areas, vehicles, and delivery capacity.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default async function AdminFleetLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const [{ user, mode }, leads] = await Promise.all([
    getAdminPageContext(),
    listFleetLeads({
      status: typeof params.status === "string" ? (params.status as FleetLeadStatus) : undefined,
      parish: typeof params.parish === "string" ? params.parish : undefined,
      q: typeof params.q === "string" ? params.q : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Fleet Leads"
      description="Fleet owners and delivery companies captured from /join/fleet."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <input className="field-input" name="q" placeholder="Search owner, company, WhatsApp, or email" defaultValue={typeof params.q === "string" ? params.q : ""} />
            <select className="field-input" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select className="field-input" name="parish" defaultValue={typeof params.parish === "string" ? params.parish : ""}>
              <option value="">All parishes</option>
              {PARISHES.map((parish) => (
                <option key={parish} value={parish}>{parish}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">
              Apply filters
            </button>
            <Link href="/admin/fleet-leads" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Reset
            </Link>
          </div>
        </FilterBar>
      </form>

      {leads.length ? (
        <DataTable>
          <table className="min-w-[72rem] divide-y divide-slate-200">
            <thead className="bg-slate-50/90">
              <tr>
                <TableHeaderCell>Company</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell>WhatsApp</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Parish</TableHeaderCell>
                <TableHeaderCell>Fleet</TableHeaderCell>
                <TableHeaderCell>Vehicles</TableHeaderCell>
                <TableHeaderCell>Interest</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <TableCell className="font-semibold text-slate-950">{lead.companyName}</TableCell>
                  <TableCell>{lead.ownerName}</TableCell>
                  <TableCell className="font-mono text-xs">{lead.whatsapp}</TableCell>
                  <TableCell>{lead.email ?? "-"}</TableCell>
                  <TableCell>{lead.parish ?? "-"}</TableCell>
                  <TableCell>{lead.fleetSize ?? "-"} / {lead.driverCount ?? "-"}</TableCell>
                  <TableCell>{lead.vehicleTypes.length ? lead.vehicleTypes.join(", ") : "-"}</TableCell>
                  <TableCell>{lead.partnershipInterest ?? "-"}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a href={whatsappHref(lead.whatsapp, lead.ownerName)} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-700">
                      WhatsApp
                    </a>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      ) : (
        <EmptyState title="No fleet leads found" description="Fleet owner submissions will appear here after visitors use /join/fleet." />
      )}
    </AdminShell>
  );
}
