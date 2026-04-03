import crypto from "node:crypto";
import {
  appendMerchantDispatchEvent,
  findDeliveryTransferPlanByMerchantDeliveryId,
  findMerchantDeliveryForMerchant,
  listDeliveryLegsByMerchantDeliveryId,
  saveDeliveryLeg,
  saveDeliveryTransferPlan,
  saveMerchantDelivery,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import type { DeliveryLeg, DeliveryLegStatus, MerchantDelivery, OutOfParishOverallStatus } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

function projectOverallStatus(legs: DeliveryLeg[]): OutOfParishOverallStatus {
  const pickup = legs.find((leg) => leg.legSequence === 1);
  const transfer = legs.find((leg) => leg.legType === "partner_transfer");
  const finalLeg = legs.find((leg) => leg.legSequence === 3);

  if (legs.some((leg) => leg.status === "failed")) return "failed";
  if (legs.some((leg) => leg.status === "cancelled")) return "cancelled";
  if (finalLeg?.status === "completed") return "delivered";
  if (finalLeg?.status === "out_for_delivery") return "out_for_final_delivery";
  if (finalLeg?.status === "ready_for_collection") return "ready_for_collection";
  if (transfer?.status === "arrived") return "arrived_at_destination_hub";
  if (transfer?.status === "in_transit") return "in_interparish_transit";
  if (transfer?.status === "accepted") return "accepted_by_partner";
  if (pickup?.status === "completed" || pickup?.status === "handed_off") return "dropped_at_partner";
  if (pickup?.status === "in_progress") return "picked_up_by_slyde";
  if (pickup?.status === "scheduled") return "pickup_scheduled";
  return "submitted";
}

async function saveParentProjection(merchantDelivery: MerchantDelivery, legs: DeliveryLeg[]) {
  const overallStatus = projectOverallStatus(legs);
  const timestamp = nowIso();
  const updatedDelivery = await saveMerchantDelivery({
    ...merchantDelivery,
    overallOutOfParishStatus: overallStatus,
    status: overallStatus === "delivered" ? "delivered" : merchantDelivery.status,
    updatedAt: timestamp,
  });

  const transferPlan = await findDeliveryTransferPlanByMerchantDeliveryId(merchantDelivery.id);
  if (transferPlan) {
    await saveDeliveryTransferPlan({
      ...transferPlan,
      overallStatus,
      updatedAt: timestamp,
    });
  }

  return { updatedDelivery, overallStatus };
}

export async function recomputeOverallStatus(input: { merchantDeliveryId: string; merchantId: string }) {
  const merchantDelivery = await findMerchantDeliveryForMerchant(input.merchantDeliveryId, input.merchantId);
  if (!merchantDelivery) {
    throw new Error("Merchant delivery not found.");
  }
  const legs = await listDeliveryLegsByMerchantDeliveryId(input.merchantDeliveryId);
  return saveParentProjection(merchantDelivery, legs);
}

export async function updateLegStatus(input: {
  merchantId: string;
  merchantDeliveryId: string;
  legId: string;
  status: DeliveryLegStatus;
  actorType?: string;
  actorId?: string;
  notes?: string;
  partnerTrackingReference?: string;
}) {
  const merchantDelivery = await findMerchantDeliveryForMerchant(input.merchantDeliveryId, input.merchantId);
  if (!merchantDelivery) throw new Error("Merchant delivery not found.");

  const legs = await listDeliveryLegsByMerchantDeliveryId(input.merchantDeliveryId);
  const current = legs.find((leg) => leg.id === input.legId);
  if (!current) throw new Error("Delivery leg not found.");

  const timestamp = nowIso();
  const updatedLeg = await saveDeliveryLeg({
    ...current,
    partnerTrackingReference: input.partnerTrackingReference ?? current.partnerTrackingReference,
    status: input.status,
    startedAt: input.status === "in_progress" ? current.startedAt ?? timestamp : current.startedAt,
    completedAt:
      input.status === "completed" || input.status === "handed_off" || input.status === "arrived"
        ? current.completedAt ?? timestamp
        : current.completedAt,
    failedAt: input.status === "failed" ? timestamp : current.failedAt,
    updatedAt: timestamp,
  });

  const nextLegs = legs.map((leg) => (leg.id === updatedLeg.id ? updatedLeg : leg));
  const projection = await saveParentProjection(merchantDelivery, nextLegs);
  await appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: merchantDelivery.id,
    eventType: `leg_${updatedLeg.legSequence}_${input.status}`,
    actorType: input.actorType ?? "system_internal",
    actorId: input.actorId,
    notes: input.notes,
    createdAt: timestamp,
  });

  return {
    leg: updatedLeg,
    overallStatus: projection.overallStatus,
  };
}

export async function markLegCompleted(input: {
  merchantId: string;
  merchantDeliveryId: string;
  legId: string;
  actorType?: string;
  actorId?: string;
  notes?: string;
}) {
  return updateLegStatus({ ...input, status: "completed" });
}

export async function markLegFailed(input: {
  merchantId: string;
  merchantDeliveryId: string;
  legId: string;
  actorType?: string;
  actorId?: string;
  notes?: string;
}) {
  return updateLegStatus({ ...input, status: "failed" });
}
