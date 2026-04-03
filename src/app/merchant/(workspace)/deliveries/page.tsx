import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { MerchantSummaryCard } from "@/components/merchant/dashboard/merchant-summary-card";
import { MerchantDeliveriesTable } from "@/components/merchant/deliveries/merchant-deliveries-table";
import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { listMerchantDeliveries } from "@/modules/merchant-ops/services/merchant-delivery.service";
import { listMerchantOrders } from "@/modules/merchant-ops/services/merchant-order.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

function averageMinutes(items: Array<{ createdAt: string; deliveredAt?: string }>) {
  const completed = items.filter((item) => item.deliveredAt);
  if (!completed.length) return "N/A";
  const total = completed.reduce((sum, item) => sum + (new Date(item.deliveredAt!).getTime() - new Date(item.createdAt).getTime()), 0);
  return `${Math.round(total / completed.length / 60000)} min`;
}

export default async function MerchantDeliveriesPage() {
  const session = await getMerchantSessionOrRedirect();
  const merchantId = session.merchantMembership.merchantId;
  const [deliveries, orders] = await Promise.all([listMerchantDeliveries(merchantId), listMerchantOrders(merchantId)]);

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Deliveries"
        title="Active and historical deliveries"
        description="Follow live movement, review completed jobs, and keep visibility across both local and out-of-parish fulfillment flows."
        actions={
          <Link href="/merchant/dispatch/new" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <PackagePlus className="h-4 w-4" />
            Create dispatch
          </Link>
        }
        aside={
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Delivery pulse</p>
            <p className="mt-3 text-sm text-slate-600">Use this view to watch active jobs, out-of-parish transfer progress, and fulfillment quality over time.</p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MerchantSummaryCard label="Total deliveries" value={deliveries.length} hint="All delivery records in this merchant workspace." />
        <MerchantSummaryCard label="Successful" value={deliveries.filter((item) => item.status === "delivered").length} hint="Jobs completed successfully." />
        <MerchantSummaryCard label="Failed" value={deliveries.filter((item) => item.status === "failed").length} hint="Deliveries requiring support review or retry decisions." />
        <MerchantSummaryCard label="Average time" value={averageMinutes(deliveries)} hint="Average delivery time across completed jobs." />
        <MerchantSummaryCard label="COD count" value={orders.filter((item) => item.paymentType === "cash_on_delivery").length} hint="Deliveries that involve collection at handoff." />
      </section>

      <MerchantDeliveriesTable deliveries={deliveries} orders={orders} />
    </div>
  );
}
