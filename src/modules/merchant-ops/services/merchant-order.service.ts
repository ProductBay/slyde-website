import crypto from "node:crypto";
import type { MerchantOrder, MerchantOrderListFilters } from "@/types/backend/onboarding";
import {
  appendMerchantDispatchEvent,
  findMerchantOrderForMerchant,
  listMerchantDeliveriesForMerchant,
  listMerchantOrdersForMerchant,
  saveMerchantDelivery,
  saveMerchantOrder,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";

function nowIso() {
  return new Date().toISOString();
}

export function canEditMerchantOrder(order: MerchantOrder) {
  return ["draft", "submitted", "quoted", "accepted"].includes(order.status);
}

export function canCancelMerchantOrder(order: MerchantOrder) {
  return ["draft", "submitted", "quoted", "accepted"].includes(order.status);
}

export async function listMerchantOrders(merchantId: string, filters?: MerchantOrderListFilters) {
  const orders = await listMerchantOrdersForMerchant(merchantId);
  return orders.filter((order) => {
    if (filters?.status && order.status !== filters.status) return false;
    if (filters?.paymentType && order.paymentType !== filters.paymentType) return false;
    if (filters?.pickupLocationId && order.pickupLocationId !== filters.pickupLocationId) return false;
    if (filters?.dateFrom && order.createdAt < `${filters.dateFrom}T00:00:00.000Z`) return false;
    if (filters?.dateTo && order.createdAt > `${filters.dateTo}T23:59:59.999Z`) return false;
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const haystack = [order.orderNumber, order.customerName, order.customerPhone, order.deliveryAddress]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export async function getMerchantOrderDetail(merchantId: string, orderId: string) {
  return findMerchantOrderForMerchant(orderId, merchantId);
}

export async function cancelMerchantOrder(merchantId: string, orderId: string, actorId?: string) {
  const order = await findMerchantOrderForMerchant(orderId, merchantId);
  if (!order) throw new Error("Order not found");
  if (!canCancelMerchantOrder(order)) throw new Error("This order can no longer be cancelled");

  const timestamp = nowIso();
  const updatedOrder = await saveMerchantOrder({
    ...order,
    status: "cancelled",
    updatedAt: timestamp,
  });

  const existingDelivery = (await listMerchantDeliveriesForMerchant(merchantId)).find(
    (item) => item.merchantOrderId === updatedOrder.id,
  );
  const delivery = existingDelivery
    ? await saveMerchantDelivery({
        ...existingDelivery,
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
      })
    : await saveMerchantDelivery({
        id: crypto.randomUUID(),
        merchantOrderId: updatedOrder.id,
        merchantId,
        dispatchMode: "manual_dashboard",
        status: "cancelled",
        cancelledAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
  await appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: delivery.id,
    eventType: "cancelled",
    actorType: "merchant_user",
    actorId,
    notes: "Order cancelled by merchant.",
    createdAt: timestamp,
  });

  return updatedOrder;
}

export async function duplicateMerchantOrder(merchantId: string, orderId: string, actorId?: string) {
  const order = await findMerchantOrderForMerchant(orderId, merchantId);
  if (!order) throw new Error("Order not found");

  const timestamp = nowIso();
  const duplicated: MerchantOrder = {
    ...order,
    id: crypto.randomUUID(),
    orderNumber: `SLYDE-${timestamp.slice(2, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const saved = await saveMerchantOrder(duplicated);

  const delivery = await saveMerchantDelivery({
    id: crypto.randomUUID(),
    merchantOrderId: saved.id,
    merchantId,
    dispatchMode: "manual_dashboard",
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: delivery.id,
    eventType: "duplicated",
    actorType: "merchant_user",
    actorId,
    notes: `Duplicated from ${order.orderNumber}.`,
    createdAt: timestamp,
  });

  return saved;
}
