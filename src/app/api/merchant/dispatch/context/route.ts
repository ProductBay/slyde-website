import { NextResponse } from "next/server";
import { listMerchantAddresses } from "@/modules/merchant-ops/services/merchant-address.service";
import { listActivePartnerCarriers, listPartnerCarrierLocations } from "@/modules/partner-carriers/services/partner-carrier.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const merchantId = context.merchantMembership.merchantId;
  const [addresses, partnerCarriers] = await Promise.all([
    listMerchantAddresses(merchantId),
    listActivePartnerCarriers(),
  ]);

  const partnerLocationsByCarrierId = Object.fromEntries(
    await Promise.all(
      partnerCarriers.map(async (carrier) => [carrier.id, await listPartnerCarrierLocations(carrier.id)]),
    ),
  );

  return NextResponse.json({
    pickupAddresses: addresses.filter((item) => item.type !== "customer"),
    customerAddresses: addresses.filter((item) => item.type === "customer"),
    partnerCarriers,
    partnerLocationsByCarrierId,
  });
}
