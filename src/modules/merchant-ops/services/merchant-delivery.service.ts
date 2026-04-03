import type { MerchantDeliveriesListFilters, MerchantDispatchEvent, MerchantOrder } from "@/types/backend/onboarding";
import {
  findDeliveryTransferPlanByMerchantDeliveryId,
  findMerchantDeliveryForMerchant,
  findMerchantOrderForMerchant,
  findPartnerCarrierById,
  listDeliveryLegsByMerchantDeliveryId,
  listMerchantDeliveriesForMerchant,
  listMerchantDispatchEvents,
  listMerchantOrdersForMerchant,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { buildCustomerTrackingView, buildMerchantTrackingView } from "@/modules/partner-carriers/services/tracking-projection.service";

type LiveTrackingPoint = {
  lat: number;
  lng: number;
  label: string;
};

type MerchantLiveTrackingView = {
  rider?: LiveTrackingPoint;
  pickup?: LiveTrackingPoint;
  destination?: LiveTrackingPoint;
  etaToPickupMinutes?: number;
  etaToDeliveryMinutes?: number;
  lastUpdatedAt?: string;
  statusLabel: string;
};

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readPoint(value: unknown, fallbackLabel: string): LiveTrackingPoint | undefined {
  const record = asObject(value);
  if (!record) return undefined;

  const lat = asNumber(record.lat ?? record.latitude);
  const lng = asNumber(record.lng ?? record.longitude);
  if (lat === undefined || lng === undefined) return undefined;

  return {
    lat,
    lng,
    label: typeof record.label === "string" && record.label.trim() ? record.label.trim() : fallbackLabel,
  };
}

function extractLiveTrackingFromEvents(events: MerchantDispatchEvent[]): MerchantLiveTrackingView | null {
  const ordered = [...events].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  let rider: LiveTrackingPoint | undefined;
  let pickup: LiveTrackingPoint | undefined;
  let destination: LiveTrackingPoint | undefined;
  let etaToPickupMinutes: number | undefined;
  let etaToDeliveryMinutes: number | undefined;
  let lastUpdatedAt: string | undefined;

  for (const event of ordered) {
    const metadata = asObject((event as { metadata?: unknown }).metadata);
    if (!metadata) continue;

    rider ??= readPoint(metadata.riderLocation, "Assigned Slyder");
    pickup ??= readPoint(metadata.pickupLocation, "Pickup");
    destination ??= readPoint(metadata.destinationLocation, "Destination");
    etaToPickupMinutes ??=
      asNumber(metadata.etaToPickupMinutes) ??
      asNumber(metadata.pickupEtaMinutes) ??
      asNumber(metadata.eta_pickup_minutes);
    etaToDeliveryMinutes ??=
      asNumber(metadata.etaToDeliveryMinutes) ??
      asNumber(metadata.deliveryEtaMinutes) ??
      asNumber(metadata.eta_delivery_minutes);
    lastUpdatedAt ??=
      (typeof metadata.locationUpdatedAt === "string" && metadata.locationUpdatedAt) ||
      (typeof metadata.lastUpdatedAt === "string" && metadata.lastUpdatedAt) ||
      event.createdAt;
  }

  if (!rider && !pickup && !destination && etaToPickupMinutes === undefined && etaToDeliveryMinutes === undefined) {
    return null;
  }

  return {
    rider,
    pickup,
    destination,
    etaToPickupMinutes,
    etaToDeliveryMinutes,
    lastUpdatedAt,
    statusLabel: rider ? "Live Slyder location available" : "ETA data available",
  };
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export async function listMerchantDeliveries(merchantId: string, filters?: MerchantDeliveriesListFilters) {
  const deliveries = await listMerchantDeliveriesForMerchant(merchantId);
  const orders = await listMerchantOrdersForMerchant(merchantId);
  const orderMap = new Map(orders.map((order) => [order.id, order] satisfies [string, MerchantOrder]));
  const rangeStart =
    filters?.range === "today"
      ? new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"
      : filters?.range === "last_7_days"
        ? daysAgo(7)
        : filters?.range === "last_30_days"
          ? daysAgo(30)
          : undefined;

  return deliveries.filter((delivery) => {
    const order = orderMap.get(delivery.merchantOrderId);
    if (filters?.status && delivery.status !== filters.status) return false;
    if (rangeStart && delivery.createdAt < rangeStart) return false;
    if (filters?.pickupLocationId && order?.pickupLocationId !== filters.pickupLocationId) return false;
    if (filters?.paymentType && order?.paymentType !== filters.paymentType) return false;
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const haystack = [order?.orderNumber, order?.customerName, order?.deliveryAddress, delivery.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export async function getMerchantDeliveryDetail(merchantId: string, deliveryId: string) {
  const delivery = await findMerchantDeliveryForMerchant(deliveryId, merchantId);
  if (!delivery) return null;

  const order = await findMerchantOrderForMerchant(delivery.merchantOrderId, merchantId);
  const events = await listMerchantDispatchEvents(delivery.id);
  const transferPlan = await findDeliveryTransferPlanByMerchantDeliveryId(delivery.id);
  const deliveryLegs = await listDeliveryLegsByMerchantDeliveryId(delivery.id);
  const merchantTrackingView = transferPlan ? await buildMerchantTrackingView(delivery.id) : null;
  const customerTrackingView = transferPlan ? await buildCustomerTrackingView(delivery.id) : null;
  const transferCarrier = transferPlan ? await findPartnerCarrierById(transferPlan.transferPartnerId) : null;
  const liveTracking = extractLiveTrackingFromEvents(events);
  return {
    delivery,
    order,
    events,
    transferPlan,
    transferCarrier,
    deliveryLegs,
    merchantTrackingView,
    customerTrackingView,
    liveTracking,
    timeline: buildMerchantDeliveryTimeline(delivery, events),
  };
}

export function buildMerchantDeliveryTimeline(delivery: {
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cancelledAt?: string;
}, events: MerchantDispatchEvent[]): Array<{ label: string; at: string; notes?: string }> {
  const derived = [
    { label: "Created", at: delivery.createdAt },
    delivery.assignedAt ? { label: "Assigned", at: delivery.assignedAt } : null,
    delivery.pickedUpAt ? { label: "Picked up", at: delivery.pickedUpAt } : null,
    delivery.deliveredAt ? { label: "Delivered", at: delivery.deliveredAt } : null,
    delivery.failedAt ? { label: "Failed", at: delivery.failedAt } : null,
    delivery.cancelledAt ? { label: "Cancelled", at: delivery.cancelledAt } : null,
  ].filter((item): item is { label: string; at: string } => Boolean(item));

  const eventItems = events.map((event) => ({
    label: event.eventType.replace(/_/g, " "),
    at: event.createdAt,
    notes: event.notes,
  }));

  return [...derived, ...eventItems].sort((left, right) => left.at.localeCompare(right.at));
}
