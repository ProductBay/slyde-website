import type { ReferralReward } from "@/types/backend/onboarding";
import { ReferralStatusBadge } from "@/components/admin/referrals/referral-status-badge";

export function ReferralRewardCard({ reward }: { reward?: ReferralReward | null }) {
  return (
    <div className="surface-panel p-6">
      <h3 className="text-lg font-semibold text-slate-950">Reward state</h3>
      {!reward ? (
        <p className="mt-4 text-sm leading-7 text-slate-500">No reward has been created for this referral yet.</p>
      ) : (
        <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-600">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
            <span className="font-medium text-slate-950">Status</span>
            <ReferralStatusBadge status={reward.status} />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
            <p><span className="font-medium text-slate-950">Type:</span> {reward.rewardType}</p>
            <p><span className="font-medium text-slate-950">Value:</span> {reward.currency} {reward.rewardValue}</p>
            <p><span className="font-medium text-slate-950">Minimum order:</span> {reward.minOrderValue ? `${reward.currency} ${reward.minOrderValue}` : "Not set"}</p>
            <p><span className="font-medium text-slate-950">Expires:</span> {new Date(reward.expiresAt).toLocaleString("en-JM")}</p>
            <p><span className="font-medium text-slate-950">Transfer count:</span> {reward.transferCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
