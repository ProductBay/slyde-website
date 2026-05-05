import type { ReferralStatus } from "@/modules/referrals/schemas/slyder-referral.schema";

const STATUS_CONFIG: Record<ReferralStatus, { label: string; className: string }> = {
  PENDING:                { label: "Pending",               className: "bg-slate-100 text-slate-500" },
  LEAD_CAPTURED:          { label: "Lead Captured",         className: "bg-sky-50 text-sky-700" },
  APPLICATION_STARTED:    { label: "App Started",           className: "bg-blue-50 text-blue-700" },
  APPLICATION_SUBMITTED:  { label: "App Submitted",         className: "bg-indigo-50 text-indigo-700" },
  APPROVED:               { label: "Approved",              className: "bg-violet-50 text-violet-700" },
  ACTIVATED:              { label: "Activated",             className: "bg-purple-50 text-purple-700" },
  LIVE:                   { label: "Live",                  className: "bg-emerald-50 text-emerald-700" },
  REWARD_ACTIVE:          { label: "Reward Active",         className: "bg-green-100 text-green-700" },
  PARTIAL_PAID:           { label: "Partial Paid",          className: "bg-amber-50 text-amber-700" },
  PAID_OUT:               { label: "Paid Out",              className: "bg-teal-50 text-teal-700" },
  CANCELLED:              { label: "Cancelled",             className: "bg-slate-100 text-slate-400" },
  REJECTED:               { label: "Rejected",              className: "bg-red-50 text-red-600" },
  EXPIRED:                { label: "Expired",               className: "bg-orange-50 text-orange-600" },
};

export function SlyderReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
