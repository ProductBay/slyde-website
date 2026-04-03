import type { SupportConversation, SupportReplyInput, SupportWebhookPayload } from "@/types/backend/onboarding";

export type SupportProviderSendResult = {
  accepted: boolean;
  provider: string;
  externalConversationId?: string;
  externalMessageId?: string;
  notes?: string;
};

function getConfiguredProvider() {
  return process.env.SLYDE_SUPPORT_PROVIDER?.trim().toLowerCase() || "manual";
}

export function getSupportWebhookSecret(provider: string) {
  if (provider === "zendesk") {
    return process.env.SLYDE_SUPPORT_ZENDESK_WEBHOOK_SECRET?.trim() || undefined;
  }

  return undefined;
}

export async function openProviderConversation(conversation: SupportConversation): Promise<SupportProviderSendResult> {
  const provider = getConfiguredProvider();

  return {
    accepted: provider !== "manual",
    provider,
    externalConversationId: conversation.externalConversationId,
    notes:
      provider === "manual"
        ? "Support provider integration is not configured yet."
        : "Provider conversation accepted by configured support provider seam.",
  };
}

export async function sendProviderMessage(input: SupportReplyInput): Promise<SupportProviderSendResult> {
  const provider = getConfiguredProvider();

  return {
    accepted: provider !== "manual",
    provider,
    externalMessageId: input.externalMessageId,
    notes:
      provider === "manual"
        ? "Support provider integration is not configured yet."
        : "Support message accepted by configured support provider seam.",
  };
}

export async function normalizeProviderWebhook(payload: SupportWebhookPayload) {
  return {
    ...payload,
    provider: payload.provider.trim().toLowerCase(),
  };
}
