import type { ReferralStatus, ReferralReferrerType } from "@/modules/referrals/schemas/slyder-referral.schema";
import type { ReferralPayoutStatus } from "@/modules/referrals/schemas/slyder-referral-payout.schema";
import { SlyderReferralStatusBadge } from "@/components/admin/referrals/slyder-referral-status-badge";
import { SlyderReferralPayoutStatusBadge } from "@/components/admin/referrals/slyder-referral-payout-status-badge";
import { buildWhatsappShareUrl, buildDirectWhatsappUrl } from "@/modules/referrals/services/referral-whatsapp.service";

type Payout = {
  id: string;
  cycleNumber: number;
  rentAmount: number;
  payoutAmount: number;
  currency: string;
  status: ReferralPayoutStatus;
  earnedAt?: Date | string | null;
  approvedAt?: Date | string | null;
  paidAt?: Date | string | null;
};

type Referral = {
  id: string;
  referralCode: string;
  referralLink?: string | null;
  referrerType: ReferralReferrerType;
  referrerName: string;
  referrerEmail?: string | null;
  referrerWhatsapp: string;
  referredFirstName?: string | null;
  referredLastName?: string | null;
  referredEmail?: string | null;
  referredWhatsapp?: string | null;
  referredLeadId?: string | null;
  referredApplicationId?: string | null;
  referredSlyderId?: string | null;
  status: ReferralStatus;
  totalRewardAmount: number;
  paidAmount: number;
  remainingAmount: number;
  rentCyclesRequired: number;
  rentCyclesCompleted: number;
  adminNotes?: string | null;
  rewardActivatedAt?: Date | string | null;
  paidOutAt?: Date | string | null;
  createdAt: Date | string;
  payouts: Payout[];
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-700">{value ?? <span className="text-slate-300">—</span>}</span>
    </div>
  );
}

export function SlyderReferralDetailPanel({ referral }: { referral: Referral }) {
  const referralLink = referral.referralLink ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${referral.referralCode}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-lg font-bold text-sky-700">{referral.referralCode}</p>
            <p className="text-sm text-slate-500">Created {new Date(referral.createdAt).toLocaleDateString("en-JM")}</p>
          </div>
          <SlyderReferralStatusBadge status={referral.status} />
        </div>
      </div>

      {/* Referrer */}
      <div className="surface-panel p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Referrer</h2>
        <Row label="Name" value={referral.referrerName} />
        <Row label="WhatsApp" value={
          <a href={buildDirectWhatsappUrl(referral.referrerWhatsapp)} target="_blank" rel="noreferrer"
            className="text-sky-700 underline">{referral.referrerWhatsapp}</a>
        } />
        <Row label="Email" value={referral.referrerEmail} />
        <Row label="Type" value={<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{referral.referrerType}</span>} />
        <Row label="Slyder ID" value={referral.referredSlyderId} />
      </div>

      {/* Referred */}
      <div className="surface-panel p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Referred Person</h2>
        <Row label="Name" value={[referral.referredFirstName, referral.referredLastName].filter(Boolean).join(" ") || null} />
        <Row label="WhatsApp" value={
          referral.referredWhatsapp ? (
            <a href={buildDirectWhatsappUrl(referral.referredWhatsapp)} target="_blank" rel="noreferrer"
              className="text-sky-700 underline">{referral.referredWhatsapp}</a>
          ) : null
        } />
        <Row label="Email" value={referral.referredEmail} />
        <Row label="Lead ID" value={referral.referredLeadId} />
        <Row label="Application ID" value={referral.referredApplicationId} />
        <Row label="Slyder ID" value={referral.referredSlyderId} />
      </div>

      {/* Reward */}
      <div className="surface-panel p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Reward Progress</h2>
        <Row label="Total Reward" value={`JMD $${referral.totalRewardAmount.toLocaleString()}`} />
        <Row label="Paid" value={<span className="font-semibold text-emerald-700">JMD ${referral.paidAmount.toLocaleString()}</span>} />
        <Row label="Remaining" value={`JMD $${referral.remainingAmount.toLocaleString()}`} />
        <Row label="Cycles" value={`${referral.rentCyclesCompleted} / ${referral.rentCyclesRequired}`} />
        <Row label="Reward Activated" value={referral.rewardActivatedAt ? new Date(referral.rewardActivatedAt).toLocaleDateString("en-JM") : null} />
        <Row label="Paid Out At" value={referral.paidOutAt ? new Date(referral.paidOutAt).toLocaleDateString("en-JM") : null} />
      </div>

      {/* Admin notes */}
      {referral.adminNotes && (
        <div className="surface-panel p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Admin Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{referral.adminNotes}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="surface-panel p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={buildDirectWhatsappUrl(referral.referrerWhatsapp)}
            target="_blank" rel="noreferrer"
            className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
          >
            WhatsApp Referrer
          </a>
          {referral.referredWhatsapp && (
            <a
              href={buildDirectWhatsappUrl(referral.referredWhatsapp)}
              target="_blank" rel="noreferrer"
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
            >
              WhatsApp Referred
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
