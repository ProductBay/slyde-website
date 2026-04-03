import { QuickDispatchForm } from "@/components/merchant/dispatch/quick-dispatch-form";
import { listMerchantAddresses } from "@/modules/merchant-ops/services/merchant-address.service";
import { listActivePartnerCarriers, listPartnerCarrierLocations } from "@/modules/partner-carriers/services/partner-carrier.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantDispatchPage({
  searchParams,
}: {
  searchParams?: Promise<{ handoffFrom?: string; reference?: string }>;
}) {
  const session = await getMerchantSessionOrRedirect();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [addresses, partnerCarriers] = await Promise.all([
    listMerchantAddresses(session.merchantMembership.merchantId),
    listActivePartnerCarriers(),
  ]);
  const partnerLocationsByCarrierId = Object.fromEntries(
    await Promise.all(
      partnerCarriers.map(async (carrier) => [carrier.id, await listPartnerCarrierLocations(carrier.id)]),
    ),
  );

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.handoffFrom ? (
        <div className="rounded-[1.6rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-6 text-sky-950 shadow-soft">
          Preparing a second SLYDE dispatch for out-of-parish handoff
          {resolvedSearchParams.reference ? ` on ${resolvedSearchParams.reference}` : ""}. Use this flow when the package has reached the destination side and SLYDE needs to complete the next movement stage.
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Dispatch</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Quick dispatch</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          This is the fastest way to move a customer order into the SLYDE delivery queue, whether it stays local or needs an out-of-parish transfer partner.
        </p>
      </div>
      <QuickDispatchForm
        pickupAddresses={addresses.filter((item) => item.type !== "customer")}
        customerAddresses={addresses.filter((item) => item.type === "customer")}
        partnerCarriers={partnerCarriers}
        partnerLocationsByCarrierId={partnerLocationsByCarrierId}
      />
    </div>
  );
}
