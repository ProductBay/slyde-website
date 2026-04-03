import Link from "next/link";
import { PackagePlus, Truck } from "lucide-react";
import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { MerchantSummaryCard } from "@/components/merchant/dashboard/merchant-summary-card";
import { MerchantOrdersTable } from "@/components/merchant/orders/merchant-orders-table";
import { listMerchantDeliveries } from "@/modules/merchant-ops/services/merchant-delivery.service";
import { listMerchantOrders } from "@/modules/merchant-ops/services/merchant-order.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantOrdersPage() {
  const session = await getMerchantSessionOrRedirect();
  const merchantId = session.merchantMembership.merchantId;
  const [orders, deliveries] = await Promise.all([
    listMerchantOrders(merchantId),
    listMerchantDeliveries(merchantId),
  ]);
  const deliveriesByOrderId = Object.fromEntries(deliveries.map((delivery) => [delivery.merchantOrderId, delivery]));

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Orders"
        title="Dispatch request queue"
        description="Review newly submitted merchant requests, identify what still needs movement, and take the next action without leaving the queue."
        actions={
          <>
            <Link href="/merchant/dispatch/new" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <PackagePlus className="h-4 w-4" />
              New dispatch
            </Link>
            <Link href="/merchant/deliveries" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Truck className="h-4 w-4" />
              Deliveries
            </Link>
          </>
        }
        aside={
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Queue view</p>
            <p className="mt-3 text-sm text-slate-600">This screen is best for duplicates, cancellations, and fast queue triage before the job becomes a deeper delivery issue.</p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MerchantSummaryCard label="Total requests" value={orders.length} hint="All merchant order requests currently on record." />
        <MerchantSummaryCard label="Active delivery links" value={Object.values(deliveriesByOrderId).filter(Boolean).length} hint="Orders that already have a linked delivery object." />
        <MerchantSummaryCard label="COD requests" value={orders.filter((item) => item.paymentType === "cash_on_delivery").length} hint="Orders that need payment collected at handoff." />
      </section>
      <MerchantOrdersTable orders={orders} deliveriesByOrderId={deliveriesByOrderId} />
    </div>
  );
}
