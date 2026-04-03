import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { MerchantDetail } from "@/components/admin/merchant/merchant-detail";
import { MerchantTimeline } from "@/components/admin/merchant/merchant-timeline";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getMerchantApplicationDetail } from "@/modules/merchant/services/merchant-application.service";

export default async function AdminMerchantApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getMerchantApplicationDetail(id)]);
  if (!detail) notFound();
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;

  return (
    <AdminShell
      title="Merchant Application Detail"
      description="Inspect merchant onboarding progress, integration setup, and admin actions."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <MerchantDetail
          application={detail.application}
          lead={detail.lead}
          integrationProfile={detail.integrationProfile}
          currentAdminId={user.id}
          devAdminKey={devAdminKey}
        />
        <MerchantTimeline events={detail.events} />
      </div>
    </AdminShell>
  );
}
