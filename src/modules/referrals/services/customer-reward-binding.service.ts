import { readPersistenceStore } from "@/server/persistence";
import { normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";

export type BindableCustomerAccount = {
  customerAccountId: string;
  phone: string;
  zoneEligible: boolean;
  verificationSource: "fallback_stub";
};

export async function bindableCustomerAccount(input: { customerAccountId: string; phone: string }): Promise<BindableCustomerAccount> {
  const store = await readPersistenceStore();
  const hasActiveZone = store.coverageZones.some((zone) => zone.isLive && !zone.isPaused);

  if (!input.customerAccountId.trim()) {
    throw new Error("Customer account id is required.");
  }

  const normalizedPhone = normalizePhone(input.phone);
  if (!normalizedPhone) {
    throw new Error("A valid customer phone is required.");
  }

  if (!hasActiveZone) {
    throw new Error("No active SLYDE customer zones are available for reward binding.");
  }

  return {
    customerAccountId: input.customerAccountId.trim(),
    phone: normalizedPhone,
    zoneEligible: true,
    verificationSource: "fallback_stub",
  };
}
