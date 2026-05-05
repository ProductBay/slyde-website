import Link from "next/link";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { SlyderLeadMessageActions } from "@/components/admin/slyder-lead-message-actions";
import { SlyderLeadStatusBadge } from "@/components/admin/slyder-lead-status-badge";

type Lead = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  whatsapp: string;
  parish: string | null;
  vehicleType: string | null;
  status: string;
  referralCode: string | null;
  qualificationScore: number | null;
  createdAt: string;
};

export function SlyderLeadsTable({ leads, devAdminKey }: { leads: Lead[]; devAdminKey?: string }) {
  if (!leads.length) {
    return (
      <EmptyState
        title="No Slyder leads found"
        description="Leads appear here after visitors reserve a spot at /join/slyder."
      />
    );
  }

  return (
    <DataTable>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>WhatsApp</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Parish</TableHeaderCell>
            <TableHeaderCell>Vehicle</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Score</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leads.map((lead) => (
              <tr key={lead.id}>
                <TableCell className="font-medium text-slate-950">{[lead.firstName, lead.lastName].filter(Boolean).join(" ")}</TableCell>
                <TableCell>{lead.whatsapp}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.parish ?? "—"}</TableCell>
                <TableCell>{lead.vehicleType ?? "—"}</TableCell>
                <TableCell>
                  <SlyderLeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell>
                  {lead.qualificationScore !== null ? (
                    <span className="tabular-nums text-slate-700">{lead.qualificationScore}/100</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(lead.createdAt).toLocaleDateString("en-JM")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/slyder-leads/${lead.id}`}
                      className="text-sm font-semibold text-sky-700 hover:underline"
                    >
                      View
                    </Link>
                    <SlyderLeadMessageActions leadId={lead.id} devAdminKey={devAdminKey} />
                  </div>
                </TableCell>
              </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
