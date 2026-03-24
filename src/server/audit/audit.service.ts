import type { OnboardingStore, SlyderStatusHistory } from "@/types/backend/onboarding";

export function appendAuditEvent(
  store: OnboardingStore,
  event: Omit<SlyderStatusHistory, "id" | "createdAt">,
) {
  store.history.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  });
}
