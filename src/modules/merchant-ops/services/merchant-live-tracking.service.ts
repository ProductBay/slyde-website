import crypto from "node:crypto";
import { appendMerchantDispatchEvent, findMerchantDeliveryForMerchant } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import type { MerchantDispatchEvent } from "@/types/backend/onboarding";
import type { MerchantLocationUpdateInput } from "@/modules/merchant-ops/schemas/merchant-live-tracking.schema";

type LiveTrackingMetadata = NonNullable<MerchantDispatchEvent["metadata"]>;

function compactPoint(point: MerchantLocationUpdateInput["riderLocation"]) {
  if (!point) return undefined;
  return {
    lat: point.lat,
    lng: point.lng,
    ...(point.label ? { label: point.label } : {}),
  };
}

function buildLocationMetadata(input: MerchantLocationUpdateInput, timestamp: string): LiveTrackingMetadata {
  return {
    ...(compactPoint(input.riderLocation) ? { riderLocation: compactPoint(input.riderLocation) } : {}),
    ...(compactPoint(input.pickupLocation) ? { pickupLocation: compactPoint(input.pickupLocation) } : {}),
    ...(compactPoint(input.destinationLocation) ? { destinationLocation: compactPoint(input.destinationLocation) } : {}),
    ...(input.etaToPickupMinutes !== undefined ? { etaToPickupMinutes: input.etaToPickupMinutes } : {}),
    ...(input.etaToDeliveryMinutes !== undefined ? { etaToDeliveryMinutes: input.etaToDeliveryMinutes } : {}),
    locationUpdatedAt: timestamp,
  };
}

export async function recordMerchantDeliveryLocationUpdate(input: {
  merchantId: string;
  merchantDeliveryId: string;
  actorType?: string;
  actorId?: string;
} & MerchantLocationUpdateInput) {
  const delivery = await findMerchantDeliveryForMerchant(input.merchantDeliveryId, input.merchantId);
  if (!delivery) {
    throw new Error("Merchant delivery not found.");
  }

  const timestamp = new Date().toISOString();
  const metadata = buildLocationMetadata(input, timestamp);
  if (!Object.keys(metadata).length) {
    throw new Error("Add at least one rider location, route point, or ETA update.");
  }

  return appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: input.merchantDeliveryId,
    eventType: "location_update",
    actorType: input.actorType ?? "operations_admin",
    actorId: input.actorId,
    notes: input.notes,
    metadata,
    createdAt: timestamp,
  });
}
