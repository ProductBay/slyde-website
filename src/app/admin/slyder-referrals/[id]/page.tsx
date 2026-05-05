import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderReferralDetailPanel } from "@/components/admin/referrals/slyder-referral-detail-panel";
import { SlyderReferralPayoutSchedule } from "@/components/admin/referrals/slyder-referral-payout-schedule";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { findSlyderReferralById } from "@/modules/referrals/repositories/slyder-referral.repository";

export default async function AdminSlyderReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, referral] = await Promise.all([
    getAdminPageContext(),
    findSlyderReferralById(id),
  ]);

  if (!referral) notFound();

  return (
    <AdminShell
      title={`Referral ${referral.referralCode}`}
      description={`Referred by ${referral.referrerName} · Status: ${referral.status}`}
      adminName={user.fullName}
      mode={mode}
    >
      <div className="space-y-8">
        <SlyderReferralDetailPanel referral={{ ...referral, payouts: referral.payouts ?? [] }} />
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-950">Payout Schedule</h2>
          <SlyderReferralPayoutSchedule payouts={referral.payouts ?? []} />
        </div>
      </div>
    </AdminShell>
  );
}
