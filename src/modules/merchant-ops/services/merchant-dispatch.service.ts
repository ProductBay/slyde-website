import crypto from "node:crypto";
import type { MerchantOrder, MerchantQuickDispatchInput, MerchantStructuredDispatchInput } from "@/types/backend/onboarding";
import {
  appendMerchantDispatchEvent,
  ensureMerchantNotificationPreference,
  findMerchantAddressForMerchant,
  findMerchantWorkspaceById,
  saveMerchantDelivery,
  saveMerchantOrder,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { handoffMerchantDeliveryToDispatchEngine } from "@/modules/merchant-ops/services/merchant-dispatch-handoff.service";
import { createTransferPlanForDispatch } from "@/modules/partner-carriers/services/out-of-parish-planning.service";

function nowIso() {
  return new Date().toISOString();
}

function buildOrderNumber() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
  return `SLYDE-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function createQuickDispatch(merchantId: string, input: MerchantQuickDispatchInput, actorId?: string) {
  const workspace = await findMerchantWorkspaceById(merchantId);
  if (!workspace) throw new Error("Merchant workspace not found");
  if (workspace.application.activationStatus === "paused") {
    throw new Error("Merchant workspace is paused");
  }

  let pickupLocationId = input.pickupLocationId;
  let pickupAddressSnapshot = input.pickupAddress?.trim() || undefined;
  if (pickupLocationId) {
    const address = await findMerchantAddressForMerchant(pickupLocationId, merchantId);
    if (!address) throw new Error("Pickup location not found");
    pickupAddressSnapshot = `${address.label} - ${address.addressLine}, ${address.town}, ${address.parish}`;
  }

  if (!pickupLocationId && !pickupAddressSnapshot) {
    throw new Error("Pickup information is required");
  }

  const timestamp = nowIso();
  const order: MerchantOrder = {
    id: crypto.randomUUID(),
    merchantId,
    orderNumber: buildOrderNumber(),
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    deliveryAddress: input.deliveryAddress.trim(),
    pickupLocationId,
    pickupAddressSnapshot,
    itemDescription: input.itemDescription.trim(),
    packageType: input.packageType.trim(),
    paymentType: input.paymentType,
    codAmount: input.paymentType === "cash_on_delivery" ? input.codAmount : undefined,
    internalNote: input.internalNote?.trim() || undefined,
    riderNote: input.riderNote?.trim() || undefined,
    requestedTiming: input.deliveryTiming,
    scheduledFor: input.deliveryTiming === "scheduled" ? input.scheduledFor : undefined,
    status: "submitted",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const savedOrder = await saveMerchantOrder(order);
  const delivery = await saveMerchantDelivery({
    id: crypto.randomUUID(),
    merchantOrderId: savedOrder.id,
    merchantId,
    dispatchMode: workspace.integrationProfile?.dispatchMode ?? "manual_dashboard",
    deliveryType: input.deliveryType ?? "in_parish",
    overallOutOfParishStatus: input.deliveryType === "out_of_parish" ? "submitted" : undefined,
    status: "submitted",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await ensureMerchantNotificationPreference(merchantId);
  await appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: delivery.id,
    eventType: "created",
    actorType: "merchant_user",
    actorId,
    notes: "Dispatch request created from merchant workspace.",
    createdAt: timestamp,
  });
  await appendMerchantDispatchEvent({
    id: crypto.randomUUID(),
    merchantDeliveryId: delivery.id,
    eventType: "submitted",
    actorType: "merchant_user",
    actorId,
    notes: "Dispatch request submitted to the dispatch queue.",
    createdAt: timestamp,
  });

  let transferPlanResult: Awaited<ReturnType<typeof createTransferPlanForDispatch>> | undefined;
  if (input.deliveryType === "out_of_parish") {
    transferPlanResult = await createTransferPlanForDispatch({
      merchantDelivery: delivery,
      merchantOrder: savedOrder,
      originParish: workspace.lead?.parish ?? "Origin parish pending",
      destinationParish: input.destinationParish!,
      destinationTown: input.destinationTown,
      transferPartnerId: input.transferPartnerId!,
      originHandoffLocationId: input.partnerHandoffLocationId,
      finalFulfillmentMethod: input.finalFulfillmentMethod!,
      packageValue: input.packageValue,
      specialHandlingNotes: input.specialHandlingNotes,
    });
    await appendMerchantDispatchEvent({
      id: crypto.randomUUID(),
      merchantDeliveryId: delivery.id,
      eventType: "transfer_plan_created",
      actorType: "merchant_user",
      actorId,
      notes: `Out-of-parish transfer plan created with ${transferPlanResult.carrier.name}.`,
      createdAt: timestamp,
    });
  }

  const handoff = await handoffMerchantDeliveryToDispatchEngine({
    order: savedOrder,
    delivery,
  });

  return {
    order: savedOrder,
    delivery,
    transferPlan: transferPlanResult?.transferPlan,
    deliveryLegs: transferPlanResult?.deliveryLegs,
    handoff,
  };
}

export async function createStructuredDispatch(merchantId: string, input: MerchantStructuredDispatchInput, actorId?: string) {
  return createQuickDispatch(
    merchantId,
    {
      customerName: "Structured order",
      customerPhone: "Pending",
      deliveryAddress: "Saved customer address required",
      pickupLocationId: input.savedPickupLocationId,
      itemDescription: input.packageCategory,
      packageType: input.packageCategory,
      paymentType: input.codAmount ? "cash_on_delivery" : "prepaid",
      codAmount: input.codAmount,
      deliveryTiming: input.deliveryTiming,
      scheduledFor: input.scheduledFor,
      riderNote: input.riderNote,
      internalNote: input.internalNote,
    },
    actorId,
  );
}
