import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReferralAuditTimeline } from "@/components/admin/referrals/referral-audit-timeline";
import { ReferralDetailCard } from "@/components/admin/referrals/referral-detail-card";
import { ReferralRewardCard } from "@/components/admin/referrals/referral-reward-card";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getReferralDetail } from "@/modules/referrals/services/admin-referral.service";

export default async function AdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getReferralDetail(id)]);

  if (!detail) {
    notFound();
  }

  return (
    <AdminShell
      title="Referral Detail"
      description="Inspect the referral lifecycle, reward state, and audit trail for a public Slyder referral."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ReferralDetailCard referral={detail.referral} />
        <ReferralRewardCard reward={detail.reward} />
      </div>
      <div className="mt-6">
        <ReferralAuditTimeline audits={detail.audits} />
      </div>
    </AdminShell>
  );
}
