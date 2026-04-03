import crypto from "node:crypto";
import {
  createSupportEvent,
  createSupportHandoff,
  listSupportHandoffsByConversationId,
} from "@/modules/support/repositories/support.repository";
import type { SupportEvent, SupportHandoff, SupportHandoffInput } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export async function createSupportHandoffRecord(input: SupportHandoffInput) {
  const handoff: SupportHandoff = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    reason: input.reason,
    summary: input.summary,
    recommendedTeam: input.recommendedTeam,
    confidenceScore: input.confidenceScore,
    createdAt: nowIso(),
  };

  const created = await createSupportHandoff(handoff);
  const event: SupportEvent = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    eventType: "ai_handoff_requested",
    actorType: "system_internal",
    notes: input.summary,
    createdAt: nowIso(),
  };
  await createSupportEvent(event);
  return created;
}

export async function listConversationHandoffs(conversationId: string) {
  return listSupportHandoffsByConversationId(conversationId);
}
