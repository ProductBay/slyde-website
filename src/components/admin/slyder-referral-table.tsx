import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";

type ReferralRow = {
  id: string;
  firstName: string;
  lastName: string | null;
  referralCode: string | null;
  referredByCode: string | null;
  status: string;
  createdAt: string;
};

export function SlyderReferralTable({ leads }: { leads: ReferralRow[] }) {
  const withCodes = leads.filter((l) => l.referralCode || l.referredByCode);

  if (!withCodes.length) {
    return (
      <EmptyState
        title="No referral data yet"
        description="Leads will appear here once they start sharing their referral codes."
      />
    );
  }

  return (
    <DataTable>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <TableHeaderCell>Lead Name</TableHeaderCell>
            <TableHeaderCell>Referral Code</TableHeaderCell>
            <TableHeaderCell>Referred By</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Reward</TableHeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {withCodes.map((lead) => (
            <tr key={lead.id}>
              <TableCell className="font-medium text-slate-950">
                {[lead.firstName, lead.lastName].filter(Boolean).join(" ")}
              </TableCell>
              <TableCell>
                {lead.referralCode ? (
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                    {lead.referralCode}
                  </code>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.referredByCode ? (
                  <code className="rounded bg-sky-50 px-2 py-0.5 text-xs font-mono text-sky-700">
                    {lead.referredByCode}
                  </code>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>{lead.status}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString("en-JM")}</TableCell>
              <TableCell>
                <span className="text-xs text-slate-400">Pending</span>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
