import type { PublicSlyderReferralStatus, ReferralRewardStatus } from "@/types/backend/onboarding";

const classes: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700 border-slate-200",
  duplicate_flagged: "bg-amber-100 text-amber-800 border-amber-200",
  contact_pending: "bg-sky-100 text-sky-800 border-sky-200",
  application_started: "bg-sky-100 text-sky-800 border-sky-200",
  application_completed: "bg-sky-100 text-sky-800 border-sky-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  activated: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  first_delivery_completed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  reward_earned: "bg-indigo-100 text-indigo-800 border-indigo-200",
  reward_claimed: "bg-violet-100 text-violet-800 border-violet-200",
  reward_gifted: "bg-violet-100 text-violet-800 border-violet-200",
  reward_redeemed: "bg-violet-100 text-violet-800 border-violet-200",
  expired: "bg-slate-100 text-slate-600 border-slate-200",
  disqualified: "bg-rose-100 text-rose-800 border-rose-200",
  earned: "bg-indigo-100 text-indigo-800 border-indigo-200",
  claim_pending: "bg-amber-100 text-amber-800 border-amber-200",
  claimed_by_referrer: "bg-violet-100 text-violet-800 border-violet-200",
  gift_pending: "bg-amber-100 text-amber-800 border-amber-200",
  gifted: "bg-violet-100 text-violet-800 border-violet-200",
  redeemed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

export function ReferralStatusBadge({
  status,
}: {
  status: PublicSlyderReferralStatus | ReferralRewardStatus;
}) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${classes[status] || classes.submitted}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
