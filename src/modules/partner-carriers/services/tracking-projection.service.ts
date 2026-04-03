import { readPersistenceStore } from "@/server/persistence";
import {
  findDeliveryTransferPlanByMerchantDeliveryId,
  listDeliveryLegsByMerchantDeliveryId,
  listMerchantDispatchEvents,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { listPartnerTrackingEventsByDeliveryLegId } from "@/modules/partner-carriers/repositories/partner-carrier.repository";

function merchantLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: "Submitted",
    pickup_scheduled: "Pickup scheduled",
    picked_up_by_slyde: "Picked up by SLYDE",
    dropped_at_partner: "Delivered to transfer partner",
    accepted_by_partner: "Accepted by transfer partner",
    in_interparish_transit: "In inter-parish movement",
    arrived_at_destination_hub: "Arrived at destination",
    ready_for_collection: "Ready for collection",
    out_for_final_delivery: "Out for final delivery",
    delivered: "Delivered",
    failed: "Failed",
    cancelled: "Cancelled",
    created: "Delivery created",
    duplicated: "Duplicated",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}

function customerLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: "Order confirmed",
    pickup_scheduled: "Pickup in progress",
    picked_up_by_slyde: "Package received by SLYDE",
    dropped_at_partner: "Handed to transfer partner",
    accepted_by_partner: "Handed to transfer partner",
    in_interparish_transit: "In transfer to destination parish",
    arrived_at_destination_hub: "Arrived at destination",
    ready_for_collection: "Ready for collection",
    out_for_final_delivery: "Out for final delivery",
    delivered: "Delivered",
    failed: "Delivery issue reported",
    cancelled: "Cancelled",
  };
  return labels[status] ?? merchantLabel(status);
}

function merchantLabelFromEventType(eventType: string) {
  const normalized = eventType.replace(/^leg_\d+_/, "");
  return merchantLabel(normalized);
}

function customerLabelFromEventType(eventType: string) {
  const normalized = eventType.replace(/^leg_\d+_/, "");
  return customerLabel(normalized);
}

export async function buildMerchantTrackingView(merchantDeliveryId: string) {
  const transferPlan = await findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId);
  const legs = await listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId);
  const events = await listMerchantDispatchEvents(merchantDeliveryId);
  const partnerEvents = (await Promise.all(legs.map((leg) => listPartnerTrackingEventsByDeliveryLegId(leg.id)))).flat();

  return {
    transferPlan,
    overallStatusLabel: transferPlan ? merchantLabel(transferPlan.overallStatus) : null,
    legs: legs.map((leg) => ({
      ...leg,
      merchantLabel: merchantLabel(leg.status),
    })),
    timeline: [
      ...events.map((event) => ({
        label: merchantLabelFromEventType(event.eventType),
        at: event.createdAt,
        notes: event.notes,
      })),
      ...partnerEvents.map((event) => ({
        label: merchantLabel(event.normalizedStatus),
        at: event.eventTimestamp,
        notes: event.notes,
      })),
    ].sort((left, right) => left.at.localeCompare(right.at)),
  };
}

export async function buildCustomerTrackingView(merchantDeliveryId: string) {
  const transferPlan = await findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId);
  if (!transferPlan) {
    return {
      customerTrackingCode: undefined,
      overallStatusLabel: "Tracking pending",
      timeline: [] as Array<{ label: string; at: string; notes?: string }>,
    };
  }

  const legs = await listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId);
  const events = await listMerchantDispatchEvents(merchantDeliveryId);
  const partnerEvents = (await Promise.all(legs.map((leg) => listPartnerTrackingEventsByDeliveryLegId(leg.id)))).flat();

  return {
    customerTrackingCode: transferPlan.customerTrackingCode,
    overallStatusLabel: customerLabel(transferPlan.overallStatus),
    timeline: [
      ...events.map((event) => ({
        label: customerLabelFromEventType(event.eventType),
        at: event.createdAt,
        notes: event.notes,
      })),
      ...partnerEvents.map((event) => ({
        label: customerLabel(event.normalizedStatus),
        at: event.eventTimestamp,
        notes: event.notes,
      })),
    ].sort((left, right) => left.at.localeCompare(right.at)),
  };
}

export async function getCustomerTrackingByCode(code: string) {
  const normalizedCode = code.trim();
  if (!normalizedCode) return null;

  const store = await readPersistenceStore();
  const transferPlan = store.deliveryTransferPlans.find((item) => item.customerTrackingCode === normalizedCode);
  if (!transferPlan) return null;

  const delivery = store.merchantDeliveries.find((item) => item.id === transferPlan.merchantDeliveryId) ?? null;
  if (!delivery) return null;

  const order = store.merchantOrders.find((item) => item.id === delivery.merchantOrderId) ?? null;
  const legs = store.deliveryLegs
    .filter((item) => item.merchantDeliveryId === delivery.id)
    .sort((left, right) => left.legSequence - right.legSequence);
  const customerTrackingView = await buildCustomerTrackingView(delivery.id);
  const partnerCarrier = store.partnerCarriers.find((item) => item.id === transferPlan.transferPartnerId) ?? null;

  return {
    delivery,
    order,
    transferPlan,
    legs,
    partnerCarrier,
    customerTrackingView,
  };
}

export async function listAdminOutOfParishDeliveries() {
  const store = await readPersistenceStore();
  return store.merchantDeliveries
    .filter((delivery) => delivery.deliveryType === "out_of_parish")
    .map((delivery) => {
      const order = store.merchantOrders.find((item) => item.id === delivery.merchantOrderId) ?? null;
      const transferPlan = store.deliveryTransferPlans.find((item) => item.merchantDeliveryId === delivery.id) ?? null;
      const partnerCarrier = transferPlan
        ? store.partnerCarriers.find((item) => item.id === transferPlan.transferPartnerId) ?? null
        : null;
      return {
        delivery,
        order,
        transferPlan,
        partnerCarrier,
      };
    })
    .sort((left, right) => right.delivery.createdAt.localeCompare(left.delivery.createdAt));
}

export async function getAdminOutOfParishDeliveryDetail(deliveryId: string) {
  const store = await readPersistenceStore();
  const delivery = store.merchantDeliveries.find((item) => item.id === deliveryId && item.deliveryType === "out_of_parish") ?? null;
  if (!delivery) return null;

  const order = store.merchantOrders.find((item) => item.id === delivery.merchantOrderId) ?? null;
  const transferPlan = store.deliveryTransferPlans.find((item) => item.merchantDeliveryId === delivery.id) ?? null;
  const partnerCarrier = transferPlan
    ? store.partnerCarriers.find((item) => item.id === transferPlan.transferPartnerId) ?? null
    : null;
  const legs = store.deliveryLegs
    .filter((item) => item.merchantDeliveryId === delivery.id)
    .sort((left, right) => left.legSequence - right.legSequence);
  const customerTrackingView = await buildCustomerTrackingView(delivery.id);
  const merchantTrackingView = await buildMerchantTrackingView(delivery.id);

  return {
    delivery,
    order,
    transferPlan,
    partnerCarrier,
    legs,
    customerTrackingView,
    merchantTrackingView,
  };
}
