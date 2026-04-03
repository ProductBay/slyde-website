import Link from "next/link";
import { MerchantDeliveryProgressTracker } from "@/components/merchant/deliveries/merchant-delivery-progress-tracker";
import { MerchantDeliveryTypeBadge } from "@/components/merchant/deliveries/merchant-delivery-type-badge";
import { MerchantDeliveryStatusBadge } from "@/components/merchant/deliveries/merchant-delivery-status-badge";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import type { MerchantDelivery, MerchantOrder } from "@/types/backend/onboarding";

export function MerchantDeliveriesTable({
  deliveries,
  orders,
}: {
  deliveries: MerchantDelivery[];
  orders: MerchantOrder[];
}) {
  const orderMap = new Map(orders.map((order) => [order.id, order]));

  if (!deliveries.length) {
    return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft">No deliveries yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft">
      <div className="space-y-4 p-4 lg:hidden">
        {deliveries.map((delivery) => {
          const order = orderMap.get(delivery.merchantOrderId);
          return (
            <div key={delivery.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/merchant/deliveries/${delivery.id}`} className="text-sm font-semibold text-sky-700">
                    {delivery.id.slice(0, 8)}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">{order?.orderNumber ?? "Pending order"}</p>
                  <p className="text-xs text-slate-500">{order?.customerName ?? "Unknown customer"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <MerchantDeliveryTypeBadge deliveryType={delivery.deliveryType ?? "in_parish"} />
                  <MerchantDeliveryStatusBadge status={delivery.status} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Created:</span> {new Date(delivery.createdAt).toLocaleString()}</p>
                <p><span className="font-semibold text-slate-900">Quote:</span> {delivery.quoteAmount ? `$${delivery.quoteAmount}` : "Pending"}</p>
                <p>
                  <span className="font-semibold text-slate-900">Transfer:</span>{" "}
                  {delivery.deliveryType === "out_of_parish" && delivery.overallOutOfParishStatus ? (
                    <span className="inline-flex"><OutOfParishStatusBadge status={delivery.overallOutOfParishStatus} /></span>
                  ) : (
                    "Local delivery flow"
                    )}
                  </p>
                </div>
              <MerchantDeliveryProgressTracker
                deliveryId={delivery.id}
                status={delivery.status}
                updatedAt={delivery.updatedAt}
                compact
                className="mt-4 border-slate-100 bg-white"
              />
            </div>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Delivery</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Transfer progress</th>
              <th className="px-4 py-3 font-semibold">Action tracker</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Quote</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const order = orderMap.get(delivery.merchantOrderId);
              return (
                <tr key={delivery.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    <Link href={`/merchant/deliveries/${delivery.id}`} className="text-sky-700">
                      {delivery.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{order?.orderNumber ?? "Pending"}</td>
                  <td className="px-4 py-4 text-slate-700">{order?.customerName ?? "Unknown"}</td>
                  <td className="px-4 py-4">
                    <MerchantDeliveryTypeBadge deliveryType={delivery.deliveryType ?? "in_parish"} />
                  </td>
                  <td className="px-4 py-4"><MerchantDeliveryStatusBadge status={delivery.status} /></td>
                  <td className="px-4 py-4">
                    {delivery.deliveryType === "out_of_parish" && delivery.overallOutOfParishStatus ? (
                      <OutOfParishStatusBadge status={delivery.overallOutOfParishStatus} />
                    ) : (
                      <span className="text-slate-500">Local delivery flow</span>
                    )}
                  </td>
                  <td className="px-4 py-4 min-w-[15rem]">
                    <MerchantDeliveryProgressTracker
                      deliveryId={delivery.id}
                      status={delivery.status}
                      updatedAt={delivery.updatedAt}
                      compact
                      className="border-slate-100 bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-4 text-slate-700">{new Date(delivery.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-4 text-slate-700">{delivery.quoteAmount ? `$${delivery.quoteAmount}` : "Pending"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
