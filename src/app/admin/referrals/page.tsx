import { AdminShell } from "@/components/admin/admin-shell";
import { ReferralsTable } from "@/components/admin/referrals/referrals-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listReferrals } from "@/modules/referrals/services/admin-referral.service";
import type { AdminReferralFilters } from "@/types/backend/onboarding";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const filters: AdminReferralFilters = {
    status: typeof params.status === "string" ? (params.status as AdminReferralFilters["status"]) : undefined,
    parish: typeof params.parish === "string" ? params.parish : undefined,
    rewardStatus: typeof params.rewardStatus === "string" ? (params.rewardStatus as AdminReferralFilters["rewardStatus"]) : undefined,
    duplicateFlagged: typeof params.duplicateFlagged === "string" ? params.duplicateFlagged === "true" : undefined,
    dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
    dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const [{ user, mode }, rows] = await Promise.all([getAdminPageContext(), listReferrals(filters)]);

  return (
    <AdminShell
      title="Public Referrals"
      description="Track public driver referrals, detect duplicates, link them into the Slyder lifecycle, and manage reward eligibility."
      adminName={user.fullName}
      mode={mode}
    >
      <ReferralsTable rows={rows} filters={filters} />
    </AdminShell>
  );
}
