import type { MerchantLead, MerchantOnboardingTrack, MerchantProductIntent } from "@/types/backend/onboarding";

export function determineMerchantProductIntent(input: {
  productIntent?: MerchantProductIntent;
  orderChannels?: string[];
}) {
  if (input.productIntent) return input.productIntent;

  const channels = new Set((input.orderChannels ?? []).map((item) => item.trim().toLowerCase()));
  if (channels.has("marketplace") || channels.has("grabquik")) return "grabquik" as const;
  if (channels.has("instagram") || channels.has("whatsapp") || channels.has("website")) return "slyde_delivery" as const;
  return "both" as const;
}

export function determineMerchantOnboardingTrack(input: {
  requestedTrack?: MerchantOnboardingTrack;
  lead?: Pick<MerchantLead, "productIntent">;
}) {
  if (input.requestedTrack) return input.requestedTrack;
  if (input.lead?.productIntent) return input.lead.productIntent;
  return "slyde_delivery" as const;
}

export function getMerchantRouteForTrack(track: MerchantOnboardingTrack) {
  if (track === "grabquik") return "/for-businesses/apply/grabquik";
  if (track === "both") return "/for-businesses/apply/grabquik";
  return "/for-businesses/apply/slyde";
}
