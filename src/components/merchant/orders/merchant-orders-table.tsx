"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { MerchantDeliveryProgressTracker } from "@/components/merchant/deliveries/merchant-delivery-progress-tracker";
import { MerchantDeliveryTypeBadge } from "@/components/merchant/deliveries/merchant-delivery-type-badge";
import { Button } from "@/components/ui/button";
import { MerchantDeliveryStatusBadge } from "@/components/merchant/deliveries/merchant-delivery-status-badge";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import type { MerchantDelivery, MerchantOrder } from "@/types/backend/onboarding";

export function MerchantOrdersTable({
  orders,
  deliveriesByOrderId,
}: {
  orders: MerchantOrder[];
  deliveriesByOrderId: Record<string, MerchantDelivery | undefined>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function action(path: string, orderId: string) {
    setPendingId(orderId);
    startTransition(async () => {
      await fetch(path, { method: "POST" });
      window.location.reload();
    });
  }

  if (!orders.length) {
    return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft">No merchant orders yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft">
      <div className="space-y-4 p-4 lg:hidden">
        {orders.map((order) => {
          const delivery = deliveriesByOrderId[order.id];
          return (
            <div key={order.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-slate-600">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.customerPhone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <MerchantDeliveryTypeBadge deliveryType={delivery?.deliveryType ?? "in_parish"} />
                  <MerchantDeliveryStatusBadge status={order.status} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Address:</span> {order.deliveryAddress}</p>
                <p><span className="font-semibold text-slate-900">Payment:</span> {order.paymentType.replace(/_/g, " ")}</p>
                <p><span className="font-semibold text-slate-900">Requested:</span> {new Date(order.createdAt).toLocaleString()}</p>
                <p>
                  <span className="font-semibold text-slate-900">Transfer:</span>{" "}
                  {delivery?.deliveryType === "out_of_parish" && delivery.overallOutOfParishStatus ? (
                    <span className="inline-flex"><OutOfParishStatusBadge status={delivery.overallOutOfParishStatus} /></span>
                  ) : (
                    "Local"
                    )}
                  </p>
                </div>
              {delivery ? (
                <MerchantDeliveryProgressTracker
                  deliveryId={delivery.id}
                  status={delivery.status}
                  updatedAt={delivery.updatedAt}
                  compact
                  className="mt-4 border-slate-100 bg-white"
                />
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={delivery?.id ? `/merchant/deliveries/${delivery.id}` : "/merchant/deliveries"} className="text-sm font-semibold text-sky-700">
                  View
                </Link>
                <button className="text-sm font-semibold text-slate-700 disabled:opacity-50" disabled={pendingId === order.id} onClick={() => action(`/api/merchant/orders/${order.id}/duplicate`, order.id)}>
                  Duplicate
                </button>
                <button className="text-sm font-semibold text-rose-600 disabled:opacity-50" disabled={pendingId === order.id} onClick={() => action(`/api/merchant/orders/${order.id}/cancel`, order.id)}>
                  Cancel
                </button>
                <Button type="button" size="sm" variant="ghost" onClick={() => window.location.assign("/merchant/support")}>
                  Support
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Address</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Transfer</th>
              <th className="px-4 py-3 font-semibold">Progress</th>
              <th className="px-4 py-3 font-semibold">Requested</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const delivery = deliveriesByOrderId[order.id];
              return (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">{order.orderNumber}</td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{order.deliveryAddress}</td>
                  <td className="px-4 py-4">
                    <MerchantDeliveryTypeBadge deliveryType={delivery?.deliveryType ?? "in_parish"} />
                  </td>
                  <td className="px-4 py-4"><MerchantDeliveryStatusBadge status={order.status} /></td>
                  <td className="px-4 py-4">
                    {delivery?.deliveryType === "out_of_parish" && delivery.overallOutOfParishStatus ? (
                      <OutOfParishStatusBadge status={delivery.overallOutOfParishStatus} />
                    ) : (
                      <span className="text-slate-500">Local</span>
                    )}
                  </td>
                  <td className="px-4 py-4 min-w-[15rem]">
                    {delivery ? (
                      <MerchantDeliveryProgressTracker
                        deliveryId={delivery.id}
                        status={delivery.status}
                        updatedAt={delivery.updatedAt}
                        compact
                        className="border-slate-100 bg-slate-50"
                      />
                    ) : (
                      <span className="text-slate-500">Waiting for delivery link</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-4 text-slate-700">{order.paymentType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={delivery?.id ? `/merchant/deliveries/${delivery.id}` : "/merchant/deliveries"} className="text-sm font-semibold text-sky-700">
                        View
                      </Link>
                      <button className="text-sm font-semibold text-slate-700 disabled:opacity-50" disabled={pendingId === order.id} onClick={() => action(`/api/merchant/orders/${order.id}/duplicate`, order.id)}>
                        Duplicate
                      </button>
                      <button className="text-sm font-semibold text-rose-600 disabled:opacity-50" disabled={pendingId === order.id} onClick={() => action(`/api/merchant/orders/${order.id}/cancel`, order.id)}>
                        Cancel
                      </button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => window.location.assign("/merchant/support")}>
                        Support
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
