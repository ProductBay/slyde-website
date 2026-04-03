import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { MerchantDeliveryLocationUpdateForm } from "@/components/admin/partner/merchant-delivery-location-update-form";
import { OutOfParishTrackingManager } from "@/components/admin/partner/out-of-parish-tracking-manager";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import { getAdminOutOfParishDeliveryDetail } from "@/modules/partner-carriers/services/tracking-projection.service";
import { listPartnerTrackingEventsByDeliveryLegId } from "@/modules/partner-carriers/repositories/partner-carrier.repository";
import { getAdminPageContext } from "@/server/admin/admin-page";

type Params = { params: Promise<{ id: string }> };

export default async function AdminOutOfParishDeliveryDetailPage({ params }: Params) {
  const { user, mode } = await getAdminPageContext();
  const { id } = await params;
  const detail = await getAdminOutOfParishDeliveryDetail(id);
  if (!detail || !detail.transferPlan) notFound();
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;

  const partnerEvents = (
    await Promise.all(
      detail.legs.filter((leg) => leg.providerType === "partner").map((leg) => listPartnerTrackingEventsByDeliveryLegId(leg.id)),
    )
  ).flat();

  return (
    <AdminShell
      title="Out-of-Parish Delivery Detail"
      description="Inspect the transfer plan, track each leg, and record partner updates when live integrations are not available."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Transfer delivery</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{detail.order?.orderNumber ?? detail.delivery.id.slice(0, 8)}</h2>
              </div>
              <OutOfParishStatusBadge status={detail.transferPlan.overallStatus} />
            </div>
            <div className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Customer:</span> {detail.order?.customerName ?? "Unknown"}</p>
              <p><span className="font-semibold text-slate-900">Transfer partner:</span> {detail.partnerCarrier?.name ?? "Pending"}</p>
              <p><span className="font-semibold text-slate-900">Destination parish:</span> {detail.transferPlan.destinationParish}</p>
              <p><span className="font-semibold text-slate-900">Final fulfillment:</span> {detail.transferPlan.finalFulfillmentMethod.replace(/_/g, " ")}</p>
              <p><span className="font-semibold text-slate-900">Customer tracking code:</span> {detail.transferPlan.customerTrackingCode}</p>
              <p><span className="font-semibold text-slate-900">Delivery created:</span> {new Date(detail.delivery.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Leg breakdown</h2>
            <div className="mt-5 space-y-4">
              {detail.legs.map((leg) => (
                <div key={leg.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">Leg {leg.legSequence}: {leg.legType.replace(/_/g, " ")}</p>
                      <p className="text-sm text-slate-500">{leg.providerType === "partner" ? "Transfer partner" : "SLYDE"} provider</p>
                    </div>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {leg.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p><span className="font-semibold text-slate-900">Origin:</span> {leg.originAddress ?? leg.originLabel}</p>
                    <p><span className="font-semibold text-slate-900">Destination:</span> {leg.destinationAddress ?? leg.destinationLabel}</p>
                    <p><span className="font-semibold text-slate-900">Partner tracking:</span> {leg.partnerTrackingReference ?? "Pending"}</p>
                    <p><span className="font-semibold text-slate-900">Completed:</span> {leg.completedAt ? new Date(leg.completedAt).toLocaleString() : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <MerchantDeliveryLocationUpdateForm deliveryId={detail.delivery.id} devAdminKey={devAdminKey} />
          <OutOfParishTrackingManager
            deliveryId={detail.delivery.id}
            partnerCarrier={detail.partnerCarrier}
            legs={detail.legs}
            partnerEvents={partnerEvents}
            devAdminKey={devAdminKey}
          />
        </div>
      </div>
    </AdminShell>
  );
}
