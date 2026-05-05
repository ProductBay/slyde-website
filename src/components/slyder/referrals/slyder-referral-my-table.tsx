import type { ReferralStatus } from "@/modules/referrals/schemas/slyder-referral.schema";

type ReferralRow = {
  id: string;
  referralCode: string;
  referredFirstName?: string | null;
  referredLastName?: string | null;
  status: ReferralStatus;
  rentCyclesCompleted: number;
  rentCyclesRequired: number;
  paidAmount: number;
  remainingAmount: number;
};

const STATUS_LABELS: Partial<Record<ReferralStatus, { label: string; className: string }>> = {
  PENDING:               { label: "Pending",         className: "bg-slate-100 text-slate-500" },
  LEAD_CAPTURED:         { label: "Lead Captured",   className: "bg-sky-50 text-sky-700" },
  APPLICATION_SUBMITTED: { label: "App Submitted",   className: "bg-indigo-50 text-indigo-700" },
  APPROVED:              { label: "Approved",         className: "bg-violet-50 text-violet-700" },
  ACTIVATED:             { label: "Activated",        className: "bg-purple-50 text-purple-700" },
  LIVE:                  { label: "Live",             className: "bg-emerald-50 text-emerald-700" },
  REWARD_ACTIVE:         { label: "Reward Active",    className: "bg-green-100 text-green-700" },
  PARTIAL_PAID:          { label: "Partial Paid",     className: "bg-amber-50 text-amber-700" },
  PAID_OUT:              { label: "Paid Out",         className: "bg-teal-50 text-teal-700" },
  CANCELLED:             { label: "Cancelled",        className: "bg-slate-100 text-slate-400" },
  REJECTED:              { label: "Rejected",         className: "bg-red-50 text-red-600" },
};

function maskName(first?: string | null, last?: string | null) {
  const parts = [first, last].filter(Boolean).join(" ");
  if (!parts) return "Referred person";
  return parts.length > 3 ? `${parts.slice(0, 2)}••••` : "••••";
}

export function SlyderReferralMyTable({ rows }: { rows: ReferralRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="surface-panel p-6 text-center text-sm text-slate-400">
        No referrals yet. Share your link to get started!
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Referred Person</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rent Cycles</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Earned</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paid</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => {
            const badge = STATUS_LABELS[row.status] ?? { label: row.status, className: "bg-slate-100 text-slate-500" };
            return (
              <tr key={row.id}>
                <td className="px-4 py-4 text-sm text-slate-700">{maskName(row.referredFirstName, row.referredLastName)}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-center text-sm">{row.rentCyclesCompleted}/{row.rentCyclesRequired}</td>
                <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-700">
                  {row.paidAmount + row.remainingAmount > 0 ? `$${(row.paidAmount + row.remainingAmount).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-4 text-right text-sm text-emerald-600">
                  {row.paidAmount > 0 ? `$${row.paidAmount.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-4 text-right text-sm text-slate-500">
                  {row.remainingAmount > 0 ? `$${row.remainingAmount.toLocaleString()}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
