import crypto from "node:crypto";
import {
  createSupportContextSnapshot,
  listSupportContextSnapshotsByConversationId,
} from "@/modules/support/repositories/support.repository";
import type { SupportContextInput, SupportContextSnapshot } from "@/types/backend/onboarding";

export async function attachSupportContextSnapshot(input: SupportContextInput) {
  const snapshot: SupportContextSnapshot = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    contextType: input.contextType,
    payload: input.payload,
    createdAt: new Date().toISOString(),
  };

  return createSupportContextSnapshot(snapshot);
}

export async function listSupportConversationContext(conversationId: string) {
  return listSupportContextSnapshotsByConversationId(conversationId);
}
