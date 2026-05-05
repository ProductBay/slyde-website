import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderReferralTable } from "@/components/admin/slyder-referral-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listSlyderLeads } from "@/modules/leads/services/slyder-lead.service";

export default async function AdminSlyderReferralsPage() {
  const [{ user, mode }, leads] = await Promise.all([
    getAdminPageContext(),
    listSlyderLeads({}),
  ]);

  const serialized = leads.map((lead) => ({
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    referralCode: lead.referralCode,
    referredByCode: lead.referredByCode,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  }));

  return (
    <AdminShell
      title="Slyder Referrals"
      description="Track referral codes, who referred whom, and referral conversion status across the lead funnel."
      adminName={user.fullName}
      mode={mode}
    >
      <SlyderReferralTable leads={serialized} />
    </AdminShell>
  );
}
