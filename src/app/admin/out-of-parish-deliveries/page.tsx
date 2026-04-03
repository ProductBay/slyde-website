import { AdminShell } from "@/components/admin/admin-shell";
import { OutOfParishDeliveriesTable } from "@/components/admin/partner/out-of-parish-deliveries-table";
import { listAdminOutOfParishDeliveries } from "@/modules/partner-carriers/services/tracking-projection.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminOutOfParishDeliveriesPage() {
  const { user, mode } = await getAdminPageContext();
  const rows = await listAdminOutOfParishDeliveries();

  return (
    <AdminShell
      title="Out-of-Parish Deliveries"
      description="Monitor transfer-partner shipments, track current status, and drill into manual-assisted partner updates."
      adminName={user.fullName}
      mode={mode}
    >
      <OutOfParishDeliveriesTable rows={rows} />
    </AdminShell>
  );
}
