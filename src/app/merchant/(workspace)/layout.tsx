import type { ReactNode } from "react";
import { listMerchantAddresses } from "@/modules/merchant-ops/services/merchant-address.service";
import { MerchantShell } from "@/components/merchant/layout/merchant-shell";
import { findMerchantWorkspaceByUserId } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { getMerchantDashboardData } from "@/modules/merchant-ops/services/merchant-dashboard.service";
import { listActivePartnerCarriers, listPartnerCarrierLocations } from "@/modules/partner-carriers/services/partner-carrier.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantWorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await getMerchantSessionOrRedirect({ allowRestricted: true });
  const merchantId = session.merchantMembership.merchantId;
  const [workspace, addresses, partnerCarriers, dashboard] = await Promise.all([
    findMerchantWorkspaceByUserId(session.user.id),
    listMerchantAddresses(merchantId),
    listActivePartnerCarriers(),
    getMerchantDashboardData(merchantId),
  ]);

  if (!workspace) {
    return null;
  }

  const partnerLocationsByCarrierId = Object.fromEntries(
    await Promise.all(
      partnerCarriers.map(async (carrier) => [carrier.id, await listPartnerCarrierLocations(carrier.id)]),
    ),
  );

  return (
    <MerchantShell
      businessName={workspace.lead?.businessName || workspace.application.storeName || "Merchant workspace"}
      contactName={workspace.lead?.contactName || session.user.fullName}
      logoUrl={workspace.application.logoUrl}
      heroBannerUrl={workspace.application.heroBannerUrl}
      heroBannerPosition={workspace.application.heroBannerPosition}
      complianceRestricted={session.merchantCompliance.isRestricted}
      dispatchContext={{
        pickupAddresses: addresses.filter((item) => item.type !== "customer"),
        customerAddresses: addresses.filter((item) => item.type === "customer"),
        partnerCarriers,
        partnerLocationsByCarrierId,
      }}
      activeDeliveries={dashboard.activeDeliveries}
    >
      {children}
    </MerchantShell>
  );
}
