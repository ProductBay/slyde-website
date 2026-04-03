import crypto from "node:crypto";
import {
  createSupportEvent,
  findSupportConversationById,
  listSupportConversations,
  updateSupportConversation,
} from "@/modules/support/repositories/support.repository";
import { normalizeProviderWebhook } from "@/modules/support/services/support-provider.service";
import { appendSupportMessage } from "@/modules/support/services/support-message.service";
import type { SupportEvent, SupportWebhookPayload } from "@/types/backend/onboarding";

async function resolveConversationId(payload: SupportWebhookPayload) {
  if (payload.externalConversationId) {
    const direct = await findSupportConversationById(payload.externalConversationId);
    if (direct) {
      return direct.id;
    }
  }

  const conversations = await listSupportConversations();
  const match = conversations.find(
    (item) =>
      item.externalConversationId === payload.externalConversationId ||
      item.externalTicketId === payload.externalTicketId,
  );

  return match?.id;
}

export async function ingestSupportWebhook(payload: SupportWebhookPayload) {
  const normalized = await normalizeProviderWebhook(payload);
  const conversationId = await resolveConversationId(normalized);

  if (conversationId) {
    if (normalized.messageBody) {
      await appendSupportMessage({
        conversationId,
        senderType: normalized.senderType === "agent" ? "agent" : "customer",
        body: normalized.messageBody,
        messageFormat: "plain_text",
        externalMessageId: normalized.externalMessageId,
        metadata: {
          provider: normalized.provider,
          eventType: normalized.eventType,
        },
      });
    }

    const conversation = await findSupportConversationById(conversationId);
    if (conversation) {
      await updateSupportConversation({
        ...conversation,
        externalConversationId: normalized.externalConversationId ?? conversation.externalConversationId,
        externalTicketId: normalized.externalTicketId ?? conversation.externalTicketId,
        status:
          normalized.status === "resolved" || normalized.status === "closed"
            ? normalized.status
            : conversation.status,
        priority:
          normalized.priority === "low" ||
          normalized.priority === "normal" ||
          normalized.priority === "high" ||
          normalized.priority === "urgent"
            ? normalized.priority
            : conversation.priority,
        lastMessageAt: normalized.messageBody ? normalized.occurredAt : conversation.lastMessageAt,
        resolvedAt: normalized.status === "resolved" ? normalized.occurredAt : conversation.resolvedAt,
        closedAt: normalized.status === "closed" ? normalized.occurredAt : conversation.closedAt,
        updatedAt: new Date().toISOString(),
      });
    }

    const event: SupportEvent = {
      id: crypto.randomUUID(),
      conversationId,
      eventType: "webhook_received",
      actorType: normalized.provider,
      notes: normalized.eventType,
      metadata: normalized.raw,
      createdAt: new Date().toISOString(),
    };
    await createSupportEvent(event);
  }

  return {
    ...normalized,
    conversationId,
  };
}
