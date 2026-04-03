import crypto from "node:crypto";
import { appendMerchantSupportTrigger } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { createSupportConversationRecord } from "@/modules/support/services/support-conversation.service";
import { attachSupportContextSnapshot } from "@/modules/support/services/support-context.service";
import { appendSupportMessage } from "@/modules/support/services/support-message.service";
import type { MerchantSupportRequestInput, NotificationTriggerEvent } from "@/types/backend/onboarding";

export function getMerchantSupportChannels() {
  return {
    whatsappUrl: "https://wa.me/18760000000",
    phoneNumber: "+1 (876) 000-0000",
    shortcuts: [
      { id: "failed-delivery", label: "Failed delivery issue" },
      { id: "cod-question", label: "COD question" },
      { id: "pickup-delay", label: "Pickup delay" },
    ],
  };
}

export async function submitMerchantSupportRequest(
  merchantId: string,
  input: MerchantSupportRequestInput,
  actorId?: string,
) {
  const timestamp = new Date().toISOString();
  const conversation = await createSupportConversationRecord({
    channel: "web_chat",
    domain: "merchant",
    priority: input.priority === "urgent" ? "high" : "normal",
    subject: input.topic,
    merchantId,
    userId: actorId,
    assignedTeam: "merchant_ops",
  });

  await appendSupportMessage({
    conversationId: conversation.id,
    senderType: "customer",
    senderId: actorId,
    body: input.message,
    messageFormat: "plain_text",
    metadata: {
      topic: input.topic,
      relatedOrderId: input.relatedOrderId,
      relatedDeliveryId: input.relatedDeliveryId,
    },
  });

  await attachSupportContextSnapshot({
    conversationId: conversation.id,
    contextType: "merchant_support_request",
    payload: {
      merchantId,
      topic: input.topic,
      priority: input.priority,
      relatedOrderId: input.relatedOrderId,
      relatedDeliveryId: input.relatedDeliveryId,
    },
  });

  const trigger: NotificationTriggerEvent = {
    id: crypto.randomUUID(),
    eventKey: `merchant-support-${merchantId}-${Date.now()}`,
    relatedEntityType: "merchant_account",
    relatedEntityId: merchantId,
    actorType: "merchant_user",
    actorId,
    payload: {
      topic: input.topic,
      priority: input.priority,
      message: input.message,
      relatedOrderId: input.relatedOrderId,
      relatedDeliveryId: input.relatedDeliveryId,
    },
    status: "received",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await appendMerchantSupportTrigger(trigger);
  return {
    requestId: conversation.id,
    submittedAt: timestamp,
    channels: getMerchantSupportChannels(),
  };
}
