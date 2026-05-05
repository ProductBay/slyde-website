import Link from "next/link";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { SlyderReferralStatusBadge } from "@/components/admin/referrals/slyder-referral-status-badge";
import type { ReferralStatus, ReferralReferrerType } from "@/modules/referrals/schemas/slyder-referral.schema";

type ReferralRow = {
  id: string;
  referralCode: string;
  referrerName: string;
  referrerWhatsapp: string;
  referrerType: ReferralReferrerType;
  referredFirstName?: string | null;
  referredLastName?: string | null;
  referredWhatsapp?: string | null;
  status: ReferralStatus;
  rentCyclesCompleted: number;
  rentCyclesRequired: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date | string;
};

function maskPhone(phone?: string | null) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "••••••";
  return `${digits.slice(0, 3)}•••${digits.slice(-3)}`;
}

export function SlyderReferralTable({
  rows,
  filters,
}: {
  rows: ReferralRow[];
  filters?: { status?: string; referrerType?: string; search?: string };
}) {
  return (
    <>
      <form className="mb-6" method="get">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <input
              className="field-input"
              name="search"
              placeholder="Search code, name, phone"
              defaultValue={filters?.search ?? ""}
            />
            <select className="field-input" name="status" defaultValue={filters?.status ?? ""}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="LEAD_CAPTURED">Lead Captured</option>
              <option value="APPLICATION_SUBMITTED">App Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVATED">Activated</option>
              <option value="LIVE">Live</option>
              <option value="REWARD_ACTIVE">Reward Active</option>
              <option value="PARTIAL_PAID">Partial Paid</option>
              <option value="PAID_OUT">Paid Out</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select className="field-input" name="referrerType" defaultValue={filters?.referrerType ?? ""}>
              <option value="">All referrer types</option>
              <option value="PUBLIC">Public</option>
              <option value="SLYDER">Slyder</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
              Filter
            </button>
            <Link href="/admin/slyder-referrals" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Clear
            </Link>
          </div>
        </div>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Code</TableHeaderCell>
              <TableHeaderCell>Referrer</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Referred</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Cycles</TableHeaderCell>
              <TableHeaderCell>Paid</TableHeaderCell>
              <TableHeaderCell>Remaining</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
                  No referrals found.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <TableCell className="font-mono text-xs font-semibold text-sky-700">{row.referralCode}</TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{row.referrerName}</div>
                  <div className="text-xs text-slate-400">{maskPhone(row.referrerWhatsapp)}</div>
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {row.referrerType}
                  </span>
                </TableCell>
                <TableCell>
                  {row.referredFirstName || row.referredLastName ? (
                    <div>
                      <div className="text-slate-700">{[row.referredFirstName, row.referredLastName].filter(Boolean).join(" ")}</div>
                      <div className="text-xs text-slate-400">{maskPhone(row.referredWhatsapp)}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell><SlyderReferralStatusBadge status={row.status} /></TableCell>
                <TableCell className="text-center">{row.rentCyclesCompleted}/{row.rentCyclesRequired}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-700">
                  {row.paidAmount > 0 ? `$${row.paidAmount.toLocaleString()}` : "—"}
                </TableCell>
                <TableCell className="text-right text-slate-500">
                  {row.remainingAmount > 0 ? `$${row.remainingAmount.toLocaleString()}` : "—"}
                </TableCell>
                <TableCell className="text-xs text-slate-400">
                  {new Date(row.createdAt).toLocaleDateString("en-JM")}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/slyder-referrals/${row.id}`}
                    className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    View
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
