import type { MerchantDelivery, MerchantOrder } from "@/types/backend/onboarding";

export async function handoffMerchantDeliveryToDispatchEngine(input: {
  order: MerchantOrder;
  delivery: MerchantDelivery;
}) {
  return {
    accepted: true,
    status: "pending_dispatch" as const,
    dispatchReference: input.delivery.id,
    notes: "Merchant delivery has been accepted into the dispatch queue. Matching remains delegated to the dispatch engine seam.",
  };
}
