import crypto from "node:crypto";
import {
  createSupportMessage,
  createSupportEvent,
  listSupportMessagesByConversationId,
  updateSupportConversation,
  findSupportConversationById,
} from "@/modules/support/repositories/support.repository";
import type { SupportEvent, SupportMessage, SupportReplyInput } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export async function appendSupportMessage(input: SupportReplyInput) {
  const message: SupportMessage = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    senderType: input.senderType,
    senderId: input.senderId,
    body: input.body,
    messageFormat: input.messageFormat ?? "plain_text",
    externalMessageId: input.externalMessageId,
    aiGenerated: input.aiGenerated ?? false,
    metadata: input.metadata,
    createdAt: nowIso(),
  };

  const created = await createSupportMessage(message);
  const conversation = await findSupportConversationById(input.conversationId);
  if (conversation) {
    await updateSupportConversation({
      ...conversation,
      lastMessageAt: created.createdAt,
      updatedAt: nowIso(),
    });
  }
  const event: SupportEvent = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    eventType: input.senderType === "customer" ? "message_received" : "message_sent",
    actorType: input.senderType,
    actorId: input.senderId,
    notes: input.body.slice(0, 240),
    metadata: input.metadata,
    createdAt: created.createdAt,
  };
  await createSupportEvent(event);

  return created;
}

export async function listConversationMessages(conversationId: string) {
  return listSupportMessagesByConversationId(conversationId);
}
