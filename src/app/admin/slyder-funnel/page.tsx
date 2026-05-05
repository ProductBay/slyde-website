import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderFunnelMetrics } from "@/components/admin/slyder-funnel-metrics";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getSlyderFunnelMetrics } from "@/modules/leads/services/slyder-funnel.service";

export default async function AdminSlyderFunnelPage() {
  const [{ user, mode }, metrics] = await Promise.all([
    getAdminPageContext(),
    getSlyderFunnelMetrics(),
  ]);

  return (
    <AdminShell
      title="Slyder Lead Funnel"
      description="Track conversion across all stages from initial lead capture to live operational status."
      adminName={user.fullName}
      mode={mode}
    >
      <SlyderFunnelMetrics metrics={metrics} />
    </AdminShell>
  );
}
