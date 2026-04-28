import { randomUUID } from "crypto";
import type { ResidentialParcelCategory, ResidentialPaymentMethod } from "@prisma/client";
import type { ResidentialIntakeInput } from "@/modules/residential-intake/schemas/residential-intake.schemas";
import { CONSENT_VERSION } from "@/modules/residential-intake/schemas/residential-intake.schemas";
import {
  createResidentialDispatchRequest,
  createResidentialDispatchIntent,
  createResidentialHandoffJob,
  createResidentialLead,
  ensureResidentialWallet,
  getResidentialWalletByUserId,
  listResidentialDispatchRequestsForUser,
  listWalletTransactions,
} from "@/modules/residential-intake/repositories/residential-intake.repository";
import { buildHandoffPayload } from "@/modules/residential-intake/services/residential-handoff.service";

function generateReferenceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RD-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function submitResidentialIntake(
  input: ResidentialIntakeInput,
  meta: { ipAddress?: string; userAgent?: string; sourceCampaign?: string },
  account: { userId: string; fullName: string; phone: string; email?: string },
): Promise<{
  referenceCode: string;
  leadId: string;
  requestId: string;
  submittedAt: string;
}> {
  const now = new Date();
  const leadId = randomUUID();
  const intentId = randomUUID();
  const requestId = randomUUID();
  const handoffJobId = randomUUID();
  const referenceCode = generateReferenceCode();

  // Ensure each authenticated resident has a wallet profile, even before first top-up.
  await ensureResidentialWallet(account.userId);

  // 1. Persist lead
  await createResidentialLead({
    id: leadId,
    userId: account.userId,
    referenceCode,
    fullName: account.fullName,
    phone: account.phone,
    email: account.email || undefined,
    parish: input.parish,
    area: input.area,
    status: "submitted",
    sourceCampaign: meta.sourceCampaign,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Persist dispatch intent
  await createResidentialDispatchIntent({
    id: intentId,
    leadId,
    pickupAddress: input.pickupAddress,
    dropoffParish: input.dropoffParish,
    dropoffArea: input.dropoffArea,
    dropoffAddress: input.dropoffAddress,
    parcelCategory: input.parcelCategory as ResidentialParcelCategory,
    parcelNotes: input.parcelNotes,
    urgency: input.urgency,
    preferredWindow: input.preferredWindow,
    paymentPreference: input.paymentPreference as ResidentialPaymentMethod,
    privacyAccepted: input.privacyAccepted,
    termsAccepted: input.termsAccepted,
    consentVersion: CONSENT_VERSION,
    consentedAt: now,
    createdAt: now,
  });

  // 3. Create a resident-facing request record for dashboard progress tracking.
  await createResidentialDispatchRequest({
    id: requestId,
    leadId,
    userId: account.userId,
    referenceCode,
    status: "payment_pending",
    paymentMethod: input.paymentPreference as ResidentialPaymentMethod,
    pickupAddress: input.pickupAddress,
    pickupParish: input.parish,
    pickupArea: input.area,
    dropoffAddress: input.dropoffAddress,
    dropoffParish: input.dropoffParish,
    dropoffArea: input.dropoffArea,
    parcelCategory: input.parcelCategory as ResidentialParcelCategory,
    parcelNotes: input.parcelNotes,
    urgency: input.urgency,
    preferredWindow: input.preferredWindow,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  // 4. Queue handoff job for SLYDE app
  const payload = buildHandoffPayload({
    leadId,
    referenceCode,
    input: {
      ...input,
      fullName: account.fullName,
      phone: account.phone,
      email: account.email ?? "",
    },
    submittedAt: now,
  });
  await createResidentialHandoffJob({
    id: handoffJobId,
    leadId,
    payloadJson: payload,
    state: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });

  return { referenceCode, leadId, requestId, submittedAt: now.toISOString() };
}

export async function getResidentialDashboardOverview(userId: string) {
  const wallet = await ensureResidentialWallet(userId);
  const [requests, transactions] = await Promise.all([
    listResidentialDispatchRequestsForUser(userId),
    listWalletTransactions(wallet.id, 30),
  ]);

  return {
    wallet,
    requests,
    transactions,
  };
}
