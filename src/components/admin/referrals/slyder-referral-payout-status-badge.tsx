import type { ReferralPayoutStatus } from "@/modules/referrals/schemas/slyder-referral-payout.schema";

const CONFIG: Record<ReferralPayoutStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-slate-100 text-slate-500" },
  EARNED:    { label: "Earned",    className: "bg-sky-50 text-sky-700" },
  APPROVED:  { label: "Approved",  className: "bg-amber-50 text-amber-700" },
  PAID:      { label: "Paid",      className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-400" },
};

export function SlyderReferralPayoutStatusBadge({ status }: { status: ReferralPayoutStatus }) {
  const config = CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
