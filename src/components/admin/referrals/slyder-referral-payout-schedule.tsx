import { SlyderReferralPayoutStatusBadge } from "@/components/admin/referrals/slyder-referral-payout-status-badge";
import type { ReferralPayoutStatus } from "@/modules/referrals/schemas/slyder-referral-payout.schema";

type Payout = {
  id: string;
  cycleNumber: number;
  payoutAmount: number;
  currency: string;
  status: ReferralPayoutStatus;
  earnedAt?: Date | string | null;
  approvedAt?: Date | string | null;
  paidAt?: Date | string | null;
};

export function SlyderReferralPayoutSchedule({ payouts }: { payouts: Payout[] }) {
  if (payouts.length === 0) {
    return (
      <div className="surface-panel p-6 text-center text-sm text-slate-400">
        Payout schedule not yet activated. Reward activates when the referred Slyder goes live.
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cycle</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Earned</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approved</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {payouts.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-4 text-sm font-semibold text-slate-900">Cycle {p.cycleNumber}</td>
              <td className="px-4 py-4 text-sm text-emerald-700 font-semibold">JMD ${p.payoutAmount.toLocaleString()}</td>
              <td className="px-4 py-4"><SlyderReferralPayoutStatusBadge status={p.status} /></td>
              <td className="px-4 py-4 text-xs text-slate-400">
                {p.earnedAt ? new Date(p.earnedAt).toLocaleDateString("en-JM") : "—"}
              </td>
              <td className="px-4 py-4 text-xs text-slate-400">
                {p.approvedAt ? new Date(p.approvedAt).toLocaleDateString("en-JM") : "—"}
              </td>
              <td className="px-4 py-4 text-xs text-slate-400">
                {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-JM") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
