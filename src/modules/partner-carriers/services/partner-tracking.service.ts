import crypto from "node:crypto";
import {
  appendPartnerTrackingEvent,
  findDeliveryLegById,
  findPartnerCarrierById,
} from "@/modules/partner-carriers/repositories/partner-carrier.repository";
import { updateLegStatus } from "@/modules/partner-carriers/services/delivery-leg.service";
import type { DeliveryLegStatus, OutOfParishOverallStatus, PartnerTrackingEvent } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export function mapPartnerStatus(rawStatus: string): DeliveryLegStatus | OutOfParishOverallStatus {
  const normalized = rawStatus.trim().toLowerCase();
  if (normalized.includes("accepted")) return "accepted";
  if (normalized.includes("transit")) return "in_transit";
  if (normalized.includes("arrived")) return "arrived";
  if (normalized.includes("ready")) return "ready_for_collection";
  if (normalized.includes("delivery")) return "out_for_delivery";
  if (normalized.includes("delivered")) return "completed";
  if (normalized.includes("fail")) return "failed";
  return "pending";
}

export async function syncLegFromPartnerEvent(input: {
  merchantId: string;
  merchantDeliveryId: string;
  deliveryLegId: string;
  normalizedStatus: DeliveryLegStatus | OutOfParishOverallStatus;
  actorId?: string;
  notes?: string;
  externalTrackingReference?: string;
}) {
  const legStatusMap: Record<string, DeliveryLegStatus> = {
    submitted: "pending",
    pickup_scheduled: "scheduled",
    picked_up_by_slyde: "in_progress",
    dropped_at_partner: "handed_off",
    accepted_by_partner: "accepted",
    in_interparish_transit: "in_transit",
    arrived_at_destination_hub: "arrived",
    ready_for_collection: "ready_for_collection",
    out_for_final_delivery: "out_for_delivery",
    delivered: "completed",
    failed: "failed",
    cancelled: "cancelled",
  };

  return updateLegStatus({
    merchantId: input.merchantId,
    merchantDeliveryId: input.merchantDeliveryId,
    legId: input.deliveryLegId,
    status: legStatusMap[input.normalizedStatus] ?? (input.normalizedStatus as DeliveryLegStatus),
    actorType: "admin_user",
    actorId: input.actorId,
    notes: input.notes,
    partnerTrackingReference: input.externalTrackingReference,
  });
}

export async function recordManualPartnerTrackingEvent(input: {
  merchantId: string;
  merchantDeliveryId: string;
  deliveryLegId: string;
  partnerCarrierId: string;
  externalTrackingReference?: string;
  rawStatus: string;
  normalizedStatus?: DeliveryLegStatus | OutOfParishOverallStatus;
  notes?: string;
  eventTimestamp?: string;
  actorId?: string;
}) {
  const carrier = await findPartnerCarrierById(input.partnerCarrierId);
  if (!carrier) throw new Error("Partner carrier not found.");
  const leg = await findDeliveryLegById(input.deliveryLegId);
  if (!leg) throw new Error("Delivery leg not found.");

  const normalizedStatus = input.normalizedStatus ?? mapPartnerStatus(input.rawStatus);
  const event: PartnerTrackingEvent = {
    id: crypto.randomUUID(),
    deliveryLegId: input.deliveryLegId,
    partnerCarrierId: input.partnerCarrierId,
    externalTrackingReference: input.externalTrackingReference,
    rawStatus: input.rawStatus,
    normalizedStatus,
    notes: input.notes,
    eventTimestamp: input.eventTimestamp ?? nowIso(),
    createdAt: nowIso(),
  };

  await appendPartnerTrackingEvent(event);
  const projection = await syncLegFromPartnerEvent({
    merchantId: input.merchantId,
    merchantDeliveryId: input.merchantDeliveryId,
    deliveryLegId: input.deliveryLegId,
    normalizedStatus,
    actorId: input.actorId,
    notes: input.notes ?? `Manual ${carrier.name} tracking update recorded.`,
    externalTrackingReference: input.externalTrackingReference ?? leg.partnerTrackingReference,
  });

  return { event, projection };
}

export async function ingestPartnerTrackingWebhook(input: {
  merchantId: string;
  merchantDeliveryId: string;
  deliveryLegId: string;
  partnerCarrierId: string;
  externalTrackingReference?: string;
  rawStatus: string;
  notes?: string;
}) {
  return recordManualPartnerTrackingEvent({
    ...input,
    normalizedStatus: mapPartnerStatus(input.rawStatus),
  });
}
