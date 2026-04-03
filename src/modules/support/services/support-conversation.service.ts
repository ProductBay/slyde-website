import crypto from "node:crypto";
import {
  createSupportConversation,
  createSupportEvent,
  findSupportConversationById,
  listSupportConversations,
  updateSupportConversation,
  listSupportEventsByConversationId,
  listSupportMessagesByConversationId,
  listSupportContextSnapshotsByConversationId,
  listSupportHandoffsByConversationId,
} from "@/modules/support/repositories/support.repository";
import { openProviderConversation } from "@/modules/support/services/support-provider.service";
import type {
  SupportConversation,
  SupportConversationCreateInput,
  SupportEvent,
  SupportConversationStatus,
} from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export async function createSupportConversationRecord(input: SupportConversationCreateInput) {
  const timestamp = nowIso();
  const conversation: SupportConversation = {
    id: crypto.randomUUID(),
    channel: input.channel,
    domain: input.domain,
    status: "open",
    priority: input.priority ?? "normal",
    subject: input.subject,
    externalProvider: input.externalProvider,
    externalConversationId: input.externalConversationId,
    externalTicketId: input.externalTicketId,
    userId: input.userId,
    merchantId: input.merchantId,
    slyderProfileId: input.slyderProfileId,
    employeeProfileId: input.employeeProfileId,
    referrerAccountId: input.referrerAccountId,
    assignedTeam: input.assignedTeam,
    assignedAgentId: input.assignedAgentId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  let created = await createSupportConversation(conversation);
  const providerResult = await openProviderConversation(created);
  if (providerResult.provider !== "manual") {
    created = await updateSupportConversation({
      ...created,
      externalProvider: providerResult.provider,
      externalConversationId: providerResult.externalConversationId ?? created.externalConversationId,
      updatedAt: timestamp,
    });
  }

  const event: SupportEvent = {
    id: crypto.randomUUID(),
    conversationId: created.id,
    eventType: "conversation_created",
    actorType: "system_internal",
    notes: providerResult.notes ?? `Support conversation created for ${created.domain}.`,
    metadata: {
      provider: providerResult.provider,
      accepted: providerResult.accepted,
      externalConversationId: providerResult.externalConversationId,
    },
    createdAt: timestamp,
  };
  await createSupportEvent(event);
  return created;
}

export async function getSupportConversation(conversationId: string) {
  return findSupportConversationById(conversationId);
}

export async function listAllSupportConversations() {
  return listSupportConversations();
}

export async function listSupportConversationsForMerchant(merchantId: string) {
  const conversations = await listSupportConversations();
  return conversations.filter((conversation) => conversation.merchantId === merchantId);
}

export async function getSupportConversationDetail(conversationId: string) {
  const conversation = await findSupportConversationById(conversationId);
  if (!conversation) return null;

  const [messages, events, contextSnapshots, handoffs] = await Promise.all([
    listSupportMessagesByConversationId(conversationId),
    listSupportEventsByConversationId(conversationId),
    listSupportContextSnapshotsByConversationId(conversationId),
    listSupportHandoffsByConversationId(conversationId),
  ]);

  return {
    conversation,
    messages,
    events,
    contextSnapshots,
    handoffs,
  };
}

export async function updateSupportConversationStatus(conversationId: string, status: SupportConversationStatus) {
  const existing = await findSupportConversationById(conversationId);
  if (!existing) {
    throw new Error("Support conversation not found");
  }

  const updated = await updateSupportConversation({
    ...existing,
    status,
    resolvedAt: status === "resolved" ? nowIso() : existing.resolvedAt,
    closedAt: status === "closed" ? nowIso() : existing.closedAt,
    updatedAt: nowIso(),
  });

  const event: SupportEvent = {
    id: crypto.randomUUID(),
    conversationId,
    eventType: "status_changed",
    actorType: "system_internal",
    notes: `Support conversation status changed to ${status}.`,
    createdAt: nowIso(),
  };
  await createSupportEvent(event);

  return updated;
}

export async function assignSupportConversation(input: {
  conversationId: string;
  assignedAgentId?: string;
  assignedTeam?: string;
  actorId?: string;
}) {
  const existing = await findSupportConversationById(input.conversationId);
  if (!existing) {
    throw new Error("Support conversation not found");
  }

  const updated = await updateSupportConversation({
    ...existing,
    assignedAgentId: input.assignedAgentId ?? existing.assignedAgentId,
    assignedTeam: input.assignedTeam ?? existing.assignedTeam,
    updatedAt: nowIso(),
  });

  const notesParts = [
    updated.assignedTeam ? `team: ${updated.assignedTeam}` : null,
    updated.assignedAgentId ? `agent: ${updated.assignedAgentId}` : null,
  ].filter(Boolean);

  const event: SupportEvent = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    eventType: "agent_assigned",
    actorType: input.actorId ? "admin" : "system_internal",
    actorId: input.actorId,
    notes: notesParts.length > 0 ? `Conversation assigned to ${notesParts.join(", ")}.` : "Conversation assignment updated.",
    createdAt: nowIso(),
  };
  await createSupportEvent(event);

  return updated;
}
