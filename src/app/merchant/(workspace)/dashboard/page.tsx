import Link from "next/link";
import { Headset, MapPinned, PackagePlus, Truck } from "lucide-react";
import { MerchantActiveDeliveriesModal } from "@/components/merchant/dashboard/merchant-active-deliveries-modal";
import { MerchantDeliveryProgressTracker } from "@/components/merchant/deliveries/merchant-delivery-progress-tracker";
import { MerchantSummaryCard } from "@/components/merchant/dashboard/merchant-summary-card";
import { MerchantDeliveryStatusBadge } from "@/components/merchant/deliveries/merchant-delivery-status-badge";
import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { MerchantSectionCard } from "@/components/merchant/layout/merchant-section-card";
import { getMerchantDashboardData } from "@/modules/merchant-ops/services/merchant-dashboard.service";
import { listMerchantOrdersForMerchant } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantDashboardPage() {
  const session = await getMerchantSessionOrRedirect();
  const merchantId = session.merchantMembership.merchantId;
  const [dashboard, orders] = await Promise.all([
    getMerchantDashboardData(merchantId),
    listMerchantOrdersForMerchant(merchantId),
  ]);
  const orderMap = new Map(orders.map((order) => [order.id, order]));

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Merchant dashboard"
        title="Run delivery operations with confidence"
        description="This workspace is built to help your team understand live delivery activity, open issues, and the next best actions in under five seconds."
        actions={
          <>
            <Link href="/merchant/dispatch/new" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <PackagePlus className="h-4 w-4" />
              Request delivery
            </Link>
            <MerchantActiveDeliveriesModal deliveries={dashboard.activeDeliveries} />
          </>
        }
        aside={
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Operations pulse</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-950">{dashboard.summary.pendingDispatches}</span> dispatches waiting for movement
              </p>
              <p>
                <span className="font-semibold text-slate-950">{dashboard.summary.inTransit}</span> deliveries currently in motion
              </p>
              <p>
                <span className="font-semibold text-slate-950">{dashboard.summary.completedToday}</span> completed today
              </p>
            </div>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MerchantSummaryCard label="Deliveries today" value={dashboard.summary.deliveriesToday} hint="All dispatches created or fulfilled in today's operating window." />
        <MerchantSummaryCard label="Pending dispatches" value={dashboard.summary.pendingDispatches} hint="Orders still waiting for assignment or movement." />
        <MerchantSummaryCard label="In transit" value={dashboard.summary.inTransit} hint="Active jobs moving through the delivery flow right now." />
        <MerchantSummaryCard label="Completed today" value={dashboard.summary.completedToday} hint="Successful handoffs closed today." />
        <MerchantSummaryCard label="Failed / cancelled" value={dashboard.summary.failedOrCancelled} hint="Requests that need review, follow-up, or recovery." />
        <MerchantSummaryCard
          label="Average delivery time"
          value={dashboard.summary.averageDeliveryTimeMinutes ? `${dashboard.summary.averageDeliveryTimeMinutes} min` : "N/A"}
          hint="Average time from created to delivered across completed jobs."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { href: "/merchant/dispatch/new", label: "Request Delivery", description: "Create a new dispatch", icon: PackagePlus },
          { href: "/merchant/addresses", label: "Saved Addresses", description: "Manage pickup points and repeat destinations", icon: MapPinned },
          { href: "/merchant/support", label: "Contact Support", description: "Escalate delivery issues quickly", icon: Headset },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-slate-950 text-white">
              <action.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">{action.label}</p>
            <p className="mt-2 text-sm text-slate-600">{action.description}</p>
          </Link>
        ))}
        <MerchantActiveDeliveriesModal deliveries={dashboard.activeDeliveries} triggerVariant="card" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MerchantSectionCard
          title="Active deliveries"
          description="Keep an eye on live jobs, customer impact, and the next issue that may need your attention."
          actions={<Link href="/merchant/deliveries" className="text-sm font-semibold text-sky-700">View all</Link>}
        >
          <div className="mt-5 space-y-4">
            {dashboard.activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{orderMap.get(delivery.merchantOrderId)?.orderNumber ?? delivery.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-600">{orderMap.get(delivery.merchantOrderId)?.customerName ?? "Customer pending"}</p>
                  </div>
                  <MerchantDeliveryStatusBadge status={delivery.status} />
                </div>
                <MerchantDeliveryProgressTracker
                  deliveryId={delivery.id}
                  status={delivery.status}
                  updatedAt={delivery.updatedAt}
                  compact
                  className="mt-4 border-slate-100 bg-white"
                />
              </div>
            ))}
            {!dashboard.activeDeliveries.length ? <p className="text-sm text-slate-500">No active deliveries at the moment.</p> : null}
          </div>
        </MerchantSectionCard>

        <div className="space-y-6">
          <MerchantSectionCard
            title="Recent dispatches"
            description="The newest merchant requests entering your operating queue."
          >
            <div className="mt-5 space-y-4">
              {dashboard.recentDispatches.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.customerName}</p>
                  </div>
                  <MerchantDeliveryStatusBadge status={order.status} />
                </div>
              ))}
            </div>
          </MerchantSectionCard>

          <MerchantSectionCard
            title="Performance snapshot"
            description="A lightweight view of how the merchant operation is trending right now."
          >
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p>Total orders: {dashboard.performance.totalOrders}</p>
              <p>Successful deliveries: {dashboard.performance.successfulDeliveries}</p>
              <p>Failed deliveries: {dashboard.performance.failedDeliveries}</p>
              <p>COD orders: {dashboard.performance.codOrders}</p>
            </div>
          </MerchantSectionCard>
        </div>
      </section>
    </div>
  );
}
