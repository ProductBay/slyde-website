import { AdminShell } from "@/components/admin/admin-shell";
import { MerchantApplicationsTable } from "@/components/admin/merchant/merchant-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listMerchantApplicationRows } from "@/modules/merchant/services/merchant-application.service";
import { listMerchantLeadRows } from "@/modules/merchant/services/merchant-lead.service";
import type { MerchantApplicationFilters } from "@/types/backend/onboarding";

export default async function AdminMerchantApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const filters: MerchantApplicationFilters = {
    approvalStatus: typeof params.approvalStatus === "string" ? (params.approvalStatus as MerchantApplicationFilters["approvalStatus"]) : undefined,
    activationStatus: typeof params.activationStatus === "string" ? (params.activationStatus as MerchantApplicationFilters["activationStatus"]) : undefined,
    onboardingTrack: typeof params.onboardingTrack === "string" ? (params.onboardingTrack as MerchantApplicationFilters["onboardingTrack"]) : undefined,
    parish: typeof params.parish === "string" ? params.parish : undefined,
    assignedAdminId: typeof params.assignedAdminId === "string" ? params.assignedAdminId : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const [{ user, mode }, rows, leads] = await Promise.all([
    getAdminPageContext(),
    listMerchantApplicationRows(filters),
    listMerchantLeadRows(),
  ]);
  const leadMap = Object.fromEntries(leads.map((lead) => [lead.id, lead]));

  return (
    <AdminShell
      title="Merchant Applications"
      description="Review merchant onboarding applications, activation state, and integration readiness."
      adminName={user.fullName}
      mode={mode}
    >
      <MerchantApplicationsTable rows={rows} leadMap={leadMap} filters={filters} />
    </AdminShell>
  );
}
