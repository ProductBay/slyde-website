import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderReferralTable } from "@/components/admin/referrals/slyder-referral-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listSlyderReferrals } from "@/modules/referrals/repositories/slyder-referral.repository";
import type { ReferralStatus, ReferralReferrerType } from "@/modules/referrals/schemas/slyder-referral.schema";

export default async function AdminSlyderReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};

  const filters = {
    status: typeof params.status === "string" ? (params.status as ReferralStatus) : undefined,
    referrerType: typeof params.referrerType === "string" ? (params.referrerType as ReferralReferrerType) : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const [{ user, mode }, result] = await Promise.all([
    getAdminPageContext(),
    listSlyderReferrals({ ...filters, page: 1, pageSize: 100 }),
  ]);

  return (
    <AdminShell
      title="Slyder Referrals"
      description="Track and manage all Slyder network referrals and reward progression."
      adminName={user.fullName}
      mode={mode}
    >
      <SlyderReferralTable rows={result.rows} filters={filters} />
    </AdminShell>
  );
}
