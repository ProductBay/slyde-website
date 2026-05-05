import Link from "next/link";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { SlyderReferralPayoutStatusBadge } from "@/components/admin/referrals/slyder-referral-payout-status-badge";
import type { ReferralPayoutStatus } from "@/modules/referrals/schemas/slyder-referral-payout.schema";

type PayoutRow = {
  id: string;
  cycleNumber: number;
  payoutAmount: number;
  currency: string;
  status: ReferralPayoutStatus;
  payoutMethod?: string | null;
  earnedAt?: Date | string | null;
  paidAt?: Date | string | null;
  referral: {
    id: string;
    referralCode: string;
    referrerName: string;
  };
};

export function SlyderReferralPayoutTable({
  rows,
  filters,
}: {
  rows: PayoutRow[];
  filters?: { status?: string };
}) {
  return (
    <>
      <form className="mb-6" method="get">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <select className="field-input max-w-xs" name="status" defaultValue={filters?.status ?? ""}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="EARNED">Earned</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
              Filter
            </button>
            <Link href="/admin/referral-payouts" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Clear
            </Link>
          </div>
        </div>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Referrer</TableHeaderCell>
              <TableHeaderCell>Code</TableHeaderCell>
              <TableHeaderCell>Cycle</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Earned</TableHeaderCell>
              <TableHeaderCell>Paid</TableHeaderCell>
              <TableHeaderCell>Method</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                  No payouts found.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <TableCell className="font-medium text-slate-900">{row.referral.referrerName}</TableCell>
                <TableCell className="font-mono text-xs text-sky-700">{row.referral.referralCode}</TableCell>
                <TableCell className="text-center font-semibold">{row.cycleNumber}</TableCell>
                <TableCell className="font-semibold text-emerald-700">JMD ${row.payoutAmount.toLocaleString()}</TableCell>
                <TableCell><SlyderReferralPayoutStatusBadge status={row.status} /></TableCell>
                <TableCell className="text-xs text-slate-400">
                  {row.earnedAt ? new Date(row.earnedAt).toLocaleDateString("en-JM") : "—"}
                </TableCell>
                <TableCell className="text-xs text-slate-400">
                  {row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-JM") : "—"}
                </TableCell>
                <TableCell className="text-xs text-slate-500">{row.payoutMethod ?? "—"}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/slyder-referrals/${row.referral.id}`}
                    className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    View referral
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </>
  );
}
