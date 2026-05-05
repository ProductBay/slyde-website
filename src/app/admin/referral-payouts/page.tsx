import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderReferralPayoutTable } from "@/components/admin/referrals/slyder-referral-payout-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listSlyderReferralPayouts } from "@/modules/referrals/repositories/slyder-referral.repository";
import type { ReferralPayoutStatus } from "@/modules/referrals/schemas/slyder-referral-payout.schema";

export default async function AdminReferralPayoutsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};

  const filters = {
    status: typeof params.status === "string" ? (params.status as ReferralPayoutStatus) : undefined,
  };

  const [{ user, mode }, result] = await Promise.all([
    getAdminPageContext(),
    listSlyderReferralPayouts({ ...filters, page: 1, pageSize: 100 }),
  ]);

  return (
    <AdminShell
      title="Referral Payouts"
      description="Manage the 5-cycle payout schedule for all active Slyder referral rewards."
      adminName={user.fullName}
      mode={mode}
    >
      <SlyderReferralPayoutTable rows={result.rows} filters={filters} />
    </AdminShell>
  );
}
