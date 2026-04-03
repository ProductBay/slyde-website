import crypto from "node:crypto";
import { validatePartnerSelection } from "@/modules/partner-carriers/services/partner-carrier.service";
import { requestPartnerShipment } from "@/modules/partner-carriers/services/partner-integration.service";
import {
  saveDeliveryLeg,
  saveDeliveryTransferPlan,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import type {
  DeliveryLeg,
  DeliveryTransferPlan,
  FinalFulfillmentMethod,
  MerchantDelivery,
  MerchantOrder,
} from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

function buildTrackingCode() {
  return `TRK-${new Date().toISOString().replace(/\D/g, "").slice(2, 14)}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function validatePartnerPlan(input: {
  transferPartnerId: string;
  partnerHandoffLocationId?: string;
  finalFulfillmentMethod: FinalFulfillmentMethod;
}) {
  return validatePartnerSelection(input);
}

export function buildDeliveryLegs(input: {
  merchantDelivery: MerchantDelivery;
  merchantOrder: MerchantOrder;
  transferPlan: DeliveryTransferPlan;
  partnerName: string;
  partnerLocationLabel?: string;
}) {
  const timestamp = nowIso();
  const originPickup = input.merchantOrder.pickupAddressSnapshot ?? "Merchant pickup location";
  const partnerLocation = input.partnerLocationLabel ?? `${input.partnerName} handoff location`;

  const legs: DeliveryLeg[] = [
    {
      id: crypto.randomUUID(),
      merchantDeliveryId: input.merchantDelivery.id,
      transferPlanId: input.transferPlan.id,
      legSequence: 1,
      legType: "pickup",
      providerType: "slyde",
      originLabel: "Merchant pickup",
      originAddress: originPickup,
      destinationLabel: "Transfer partner handoff",
      destinationAddress: partnerLocation,
      status: "scheduled",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      merchantDeliveryId: input.merchantDelivery.id,
      transferPlanId: input.transferPlan.id,
      legSequence: 2,
      legType: "partner_transfer",
      providerType: "partner",
      providerId: input.transferPlan.transferPartnerId,
      originLabel: "Origin transfer point",
      originAddress: partnerLocation,
      destinationLabel: input.transferPlan.destinationParish,
      destinationAddress: input.transferPlan.destinationTown,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  if (input.transferPlan.finalFulfillmentMethod === "slyde_final_mile") {
    legs.push({
      id: crypto.randomUUID(),
      merchantDeliveryId: input.merchantDelivery.id,
      transferPlanId: input.transferPlan.id,
      legSequence: 3,
      legType: "final_mile",
      providerType: "slyde",
      originLabel: "Destination hub",
      destinationLabel: "Customer address",
      destinationAddress: input.merchantOrder.deliveryAddress,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } else if (input.transferPlan.finalFulfillmentMethod === "partner_final_delivery") {
    legs.push({
      id: crypto.randomUUID(),
      merchantDeliveryId: input.merchantDelivery.id,
      transferPlanId: input.transferPlan.id,
      legSequence: 3,
      legType: "final_mile",
      providerType: "partner",
      providerId: input.transferPlan.transferPartnerId,
      originLabel: "Destination partner hub",
      destinationLabel: "Customer address",
      destinationAddress: input.merchantOrder.deliveryAddress,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } else {
    legs.push({
      id: crypto.randomUUID(),
      merchantDeliveryId: input.merchantDelivery.id,
      transferPlanId: input.transferPlan.id,
      legSequence: 3,
      legType: "collection_ready",
      providerType: "partner",
      providerId: input.transferPlan.transferPartnerId,
      originLabel: "Destination collection point",
      destinationLabel: "Customer collection",
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return legs;
}

export async function createTransferPlanForDispatch(input: {
  merchantDelivery: MerchantDelivery;
  merchantOrder: MerchantOrder;
  originParish: string;
  destinationParish: string;
  destinationTown?: string;
  transferPartnerId: string;
  originHandoffLocationId?: string;
  destinationHandoffLocationId?: string;
  finalFulfillmentMethod: FinalFulfillmentMethod;
  packageValue?: number;
  specialHandlingNotes?: string;
}) {
  const { carrier, location } = await validatePartnerPlan({
    transferPartnerId: input.transferPartnerId,
    partnerHandoffLocationId: input.originHandoffLocationId,
    finalFulfillmentMethod: input.finalFulfillmentMethod,
  });

  const timestamp = nowIso();
  const transferPlan: DeliveryTransferPlan = {
    id: crypto.randomUUID(),
    merchantDeliveryId: input.merchantDelivery.id,
    deliveryType: "out_of_parish",
    originParish: input.originParish,
    destinationParish: input.destinationParish,
    destinationTown: input.destinationTown,
    transferPartnerId: input.transferPartnerId,
    originHandoffLocationId: input.originHandoffLocationId,
    destinationHandoffLocationId: input.destinationHandoffLocationId,
    finalFulfillmentMethod: input.finalFulfillmentMethod,
    packageValue: input.packageValue,
    specialHandlingNotes: input.specialHandlingNotes,
    customerTrackingCode: buildTrackingCode(),
    overallStatus: "submitted",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const savedPlan = await saveDeliveryTransferPlan(transferPlan);
  const legs = buildDeliveryLegs({
    merchantDelivery: input.merchantDelivery,
    merchantOrder: input.merchantOrder,
    transferPlan: savedPlan,
    partnerName: carrier.name,
    partnerLocationLabel: location ? `${location.name} - ${location.addressLine}` : undefined,
  });
  for (const leg of legs) {
    await saveDeliveryLeg(leg);
  }

  await requestPartnerShipment({
    carrier,
    leg: legs[1],
  });

  return {
    transferPlan: savedPlan,
    deliveryLegs: legs,
    carrier,
  };
}
