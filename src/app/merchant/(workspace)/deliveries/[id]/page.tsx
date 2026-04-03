import Link from "next/link";
import { notFound } from "next/navigation";
import { MerchantDeliveryStatusBadge } from "@/components/merchant/deliveries/merchant-delivery-status-badge";
import { MerchantDeliveryProgressTracker } from "@/components/merchant/deliveries/merchant-delivery-progress-tracker";
import { MerchantDeliveryTypeBadge } from "@/components/merchant/deliveries/merchant-delivery-type-badge";
import { MerchantLiveDeliveryMap } from "@/components/merchant/deliveries/merchant-live-delivery-map";
import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import { getMerchantDeliveryDetail } from "@/modules/merchant-ops/services/merchant-delivery.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

type Params = { params: Promise<{ id: string }> };

export default async function MerchantDeliveryDetailPage({ params }: Params) {
  const session = await getMerchantSessionOrRedirect();
  const { id } = await params;
  const detail = await getMerchantDeliveryDetail(session.merchantMembership.merchantId, id);
  if (!detail || !detail.order) notFound();

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Delivery detail"
        title={detail.order.orderNumber}
        description="Review the full shipment context, the live delivery state, and any transfer-partner progress from one operational view."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <MerchantDeliveryTypeBadge deliveryType={detail.delivery.deliveryType ?? "in_parish"} />
            <MerchantDeliveryStatusBadge status={detail.delivery.status} />
            {detail.delivery.deliveryType === "out_of_parish" && detail.transferPlan ? (
              <OutOfParishStatusBadge status={detail.transferPlan.overallStatus} />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <MerchantDeliveryProgressTracker
            deliveryId={detail.delivery.id}
            status={detail.delivery.status}
            updatedAt={detail.delivery.updatedAt}
            className="border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)]"
          />

          <MerchantLiveDeliveryMap
            rider={detail.liveTracking?.rider}
            pickup={detail.liveTracking?.pickup}
            destination={detail.liveTracking?.destination}
            etaToPickupMinutes={detail.liveTracking?.etaToPickupMinutes}
            etaToDeliveryMinutes={detail.liveTracking?.etaToDeliveryMinutes}
            lastUpdatedAt={detail.liveTracking?.lastUpdatedAt}
            statusLabel={detail.liveTracking?.statusLabel ?? "Tracking feed will appear after dispatch location updates are received"}
          />

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Order details</h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Customer:</span> {detail.order.customerName}</p>
              <p><span className="font-semibold text-slate-900">Phone:</span> {detail.order.customerPhone}</p>
              <p><span className="font-semibold text-slate-900">Address:</span> {detail.order.deliveryAddress}</p>
              <p><span className="font-semibold text-slate-900">Pickup:</span> {detail.order.pickupAddressSnapshot ?? "Saved location"}</p>
              <p><span className="font-semibold text-slate-900">Package:</span> {detail.order.packageType}</p>
              <p><span className="font-semibold text-slate-900">Payment:</span> {detail.order.paymentType.replace(/_/g, " ")}</p>
            </div>
          </div>

          {detail.transferPlan ? (
            <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50/70 p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-950">Out-of-parish transfer plan</h2>
              <div className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <p><span className="font-semibold text-slate-900">Transfer partner:</span> {detail.transferCarrier?.name ?? "Assigned partner"}</p>
                <p><span className="font-semibold text-slate-900">Final fulfillment:</span> {detail.transferPlan.finalFulfillmentMethod.replace(/_/g, " ")}</p>
                <p><span className="font-semibold text-slate-900">Destination parish:</span> {detail.transferPlan.destinationParish}</p>
                <p><span className="font-semibold text-slate-900">Destination town:</span> {detail.transferPlan.destinationTown ?? "Destination pending"}</p>
                <p><span className="font-semibold text-slate-900">Customer tracking code:</span> {detail.transferPlan.customerTrackingCode}</p>
                <p><span className="font-semibold text-slate-900">Partner reference:</span> {detail.deliveryLegs.find((leg) => leg.providerType === "partner")?.partnerTrackingReference ?? "Pending"}</p>
              </div>
              {detail.customerTrackingView?.customerTrackingCode ? (
                <Link href={`/track/${detail.customerTrackingView.customerTrackingCode}`} className="mt-4 inline-flex text-sm font-semibold text-sky-700">
                  Open customer tracking view
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Timeline</h2>
            <div className="mt-5 space-y-4">
              {detail.timeline.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{new Date(item.at).toLocaleString()}</p>
                    {"notes" in item && item.notes ? <p className="mt-1 text-sm text-slate-600">{item.notes}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {detail.merchantTrackingView ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-950">Delivery journey</h2>
              <p className="mt-2 text-sm text-slate-600">
                {detail.merchantTrackingView.overallStatusLabel ?? "Tracking pending"} through one unified SLYDE flow.
              </p>
              <div className="mt-5 space-y-4">
                {detail.merchantTrackingView.legs.map((leg) => (
                  <div key={leg.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Leg {leg.legSequence}: {leg.legType.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {leg.originLabel} to {leg.destinationLabel}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                          {leg.providerType === "partner" ? "Transfer partner" : "SLYDE"}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          {leg.merchantLabel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p><span className="font-semibold text-slate-900">Origin:</span> {leg.originAddress ?? leg.originLabel}</p>
                      <p><span className="font-semibold text-slate-900">Destination:</span> {leg.destinationAddress ?? leg.destinationLabel}</p>
                      <p><span className="font-semibold text-slate-900">Started:</span> {leg.startedAt ? new Date(leg.startedAt).toLocaleString() : "Pending"}</p>
                      <p><span className="font-semibold text-slate-900">Completed:</span> {leg.completedAt ? new Date(leg.completedAt).toLocaleString() : "Pending"}</p>
                      <p><span className="font-semibold text-slate-900">Partner tracking:</span> {leg.partnerTrackingReference ?? "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Dispatch timestamps</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>Created: {new Date(detail.delivery.createdAt).toLocaleString()}</p>
              <p>Assigned: {detail.delivery.assignedAt ? new Date(detail.delivery.assignedAt).toLocaleString() : "Pending"}</p>
              <p>Picked up: {detail.delivery.pickedUpAt ? new Date(detail.delivery.pickedUpAt).toLocaleString() : "Pending"}</p>
              <p>Delivered: {detail.delivery.deliveredAt ? new Date(detail.delivery.deliveredAt).toLocaleString() : "Pending"}</p>
              <p>Failed: {detail.delivery.failedAt ? new Date(detail.delivery.failedAt).toLocaleString() : "N/A"}</p>
              <p>Cancelled: {detail.delivery.cancelledAt ? new Date(detail.delivery.cancelledAt).toLocaleString() : "N/A"}</p>
            </div>
          </div>

          {detail.customerTrackingView ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-950">Customer-facing tracking</h2>
              <p className="mt-3 text-sm text-slate-600">This is the cleaner shipment view your customer should follow across the transfer journey.</p>
              <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Tracking code</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{detail.customerTrackingView.customerTrackingCode}</p>
                <p className="mt-2 text-sm text-slate-600">{detail.customerTrackingView.overallStatusLabel}</p>
              </div>
              <div className="mt-5 space-y-4">
                {detail.customerTrackingView.timeline.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex gap-4">
                    <div className="mt-1 h-3 w-3 rounded-full bg-sky-700" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{new Date(item.at).toLocaleString()}</p>
                      {item.notes ? <p className="mt-1 text-sm text-slate-600">{item.notes}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Support</h2>
            <p className="mt-3 text-sm text-slate-600">Proof of delivery and issue escalation can be expanded here as rider completion and support tooling mature.</p>
            <Link href="/merchant/support" className="mt-4 inline-flex text-sm font-semibold text-sky-700">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
