import crypto from "node:crypto";
import {
  findPartnerCarrierById,
  findPartnerHandoffLocationById,
  listPartnerCarriers,
  listPartnerHandoffLocationsByCarrierId,
  savePartnerCarrier,
  savePartnerHandoffLocation,
} from "@/modules/partner-carriers/repositories/partner-carrier.repository";
import type { FinalFulfillmentMethod, PartnerCarrier, PartnerHandoffLocation } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export async function listActivePartnerCarriers() {
  const carriers = await listPartnerCarriers();
  return carriers.filter((item) => item.active);
}

export async function listPartnerCarrierLocations(partnerCarrierId: string) {
  const locations = await listPartnerHandoffLocationsByCarrierId(partnerCarrierId);
  return locations.filter((item) => item.active);
}

export async function validatePartnerSelection(input: {
  transferPartnerId: string;
  partnerHandoffLocationId?: string;
  finalFulfillmentMethod: FinalFulfillmentMethod;
}) {
  const carrier = await findPartnerCarrierById(input.transferPartnerId);
  if (!carrier || !carrier.active) {
    throw new Error("Selected transfer partner is unavailable.");
  }

  if (input.finalFulfillmentMethod === "partner_final_delivery" && !carrier.supportsFinalDelivery) {
    throw new Error("Selected transfer partner does not support partner delivery.");
  }

  if (input.finalFulfillmentMethod === "customer_collection" && !carrier.supportsBranchCollection) {
    throw new Error("Selected transfer partner does not support customer collection.");
  }

  let location = null;
  if (input.partnerHandoffLocationId) {
    location = await findPartnerHandoffLocationById(input.partnerHandoffLocationId);
    if (!location || location.partnerCarrierId !== carrier.id || !location.active) {
      throw new Error("Selected handoff location is invalid for this transfer partner.");
    }
  }

  return { carrier, location };
}

export function resolveCarrierCapabilities(carrier: PartnerCarrier) {
  return {
    supportsTracking: carrier.supportsTracking,
    supportsApi: carrier.supportsApi,
    supportsFinalDelivery: carrier.supportsFinalDelivery,
    supportsBranchCollection: carrier.supportsBranchCollection,
  };
}

export async function createPartnerCarrierRecord(input: Omit<PartnerCarrier, "id" | "createdAt" | "updatedAt">) {
  const timestamp = nowIso();
  return savePartnerCarrier({
    ...input,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function createPartnerHandoffLocationRecord(
  input: Omit<PartnerHandoffLocation, "id" | "createdAt" | "updatedAt">,
) {
  const timestamp = nowIso();
  return savePartnerHandoffLocation({
    ...input,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}
