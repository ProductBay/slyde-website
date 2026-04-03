import { listMerchantDeliveriesForMerchant, listMerchantOrdersForMerchant } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { readPersistenceStore } from "@/server/persistence";

function isToday(value?: string) {
  if (!value) return false;
  return value.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function averageDeliveryMinutes(items: Array<{ createdAt: string; deliveredAt?: string }>) {
  const completed = items.filter((item) => item.deliveredAt);
  if (!completed.length) return null;
  const total = completed.reduce((sum, item) => {
    return sum + (new Date(item.deliveredAt!).getTime() - new Date(item.createdAt).getTime());
  }, 0);
  return Math.round(total / completed.length / 60000);
}

export async function getMerchantDashboardData(merchantId: string) {
  const [orders, deliveries, store] = await Promise.all([
    listMerchantOrdersForMerchant(merchantId),
    listMerchantDeliveriesForMerchant(merchantId),
    readPersistenceStore(),
  ]);
  const orderMap = new Map(orders.map((order) => [order.id, order]));
  const userMap = new Map(store.users.map((user) => [user.id, user]));

  const activeStatuses = ["submitted", "quoted", "accepted", "rider_assigned", "picked_up", "in_transit", "arrived"];
  const activeDeliveries = deliveries.filter((item) => activeStatuses.includes(item.status));

  return {
    summary: {
      deliveriesToday: deliveries.filter((item) => isToday(item.createdAt)).length,
      pendingDispatches: deliveries.filter((item) => ["submitted", "quoted", "accepted"].includes(item.status)).length,
      inTransit: deliveries.filter((item) => ["rider_assigned", "picked_up", "in_transit", "arrived"].includes(item.status)).length,
      completedToday: deliveries.filter((item) => isToday(item.deliveredAt)).length,
      failedOrCancelled: deliveries.filter((item) => item.status === "failed" || item.status === "cancelled").length,
      averageDeliveryTimeMinutes: averageDeliveryMinutes(deliveries),
    },
    activeDeliveries: activeDeliveries.slice(0, 6).map((delivery) => {
      const order = orderMap.get(delivery.merchantOrderId);
      const assignedAgent = delivery.riderId ? userMap.get(delivery.riderId) : null;

      return {
        ...delivery,
        orderNumber: order?.orderNumber ?? delivery.id.slice(0, 8),
        customerName: order?.customerName ?? "Customer pending",
        customerPhone: order?.customerPhone ?? "",
        deliveryAddress: order?.deliveryAddress ?? "Destination pending",
        assignedAgentName: assignedAgent?.fullName ?? (delivery.riderId ? "Assigned SLYDE agent" : "Awaiting assignment"),
      };
    }),
    recentDispatches: orders.slice(0, 6),
    performance: {
      totalOrders: orders.length,
      successfulDeliveries: deliveries.filter((item) => item.status === "delivered").length,
      failedDeliveries: deliveries.filter((item) => item.status === "failed").length,
      codOrders: orders.filter((item) => item.paymentType === "cash_on_delivery").length,
    },
    notices: [
      {
        id: "dispatch-engine-seam",
        title: "Dispatch engine handoff active",
        description: "Merchant-created requests are being queued through the merchant dispatch seam and remain ready for deeper dispatch-engine integration.",
      },
    ],
  };
}
