import { AdminShell } from "@/components/admin/admin-shell";
import { PartnerCarrierManager } from "@/components/admin/partner/partner-carrier-manager";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listPartnerCarriers } from "@/modules/partner-carriers/repositories/partner-carrier.repository";
import { listPartnerCarrierLocations } from "@/modules/partner-carriers/services/partner-carrier.service";

export default async function AdminPartnerCarriersPage() {
  const { user, mode } = await getAdminPageContext();
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;
  const carriers = await listPartnerCarriers();
  const locationsByCarrierId = Object.fromEntries(
    await Promise.all(
      carriers.map(async (carrier) => [carrier.id, await listPartnerCarrierLocations(carrier.id)]),
    ),
  );

  return (
    <AdminShell
      title="Partner Carriers"
      description="Configure external transfer partners and the handoff locations used for out-of-parish delivery."
      adminName={user.fullName}
      mode={mode}
    >
      <PartnerCarrierManager carriers={carriers} locationsByCarrierId={locationsByCarrierId} devAdminKey={devAdminKey} />
    </AdminShell>
  );
}
