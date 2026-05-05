import { getAppBaseUrl } from "@/lib/app-base-url";
import type { CreatePublicReferralInput, CreateSlyderReferralInput, AttachReferralToLeadInput, AttachReferralToApplicationInput } from "@/modules/referrals/schemas/slyder-referral.schema";
import {
  generateUniqueSlyderReferralCode,
  createSlyderReferral,
  findSlyderReferralByCode,
  findSlyderReferralByReferredPhone,
  findSlyderReferralByReferredApplicationId,
  findSlyderReferralByReferredSlyderId,
  listSlyderReferralsByReferrerSlyderId,
  updateSlyderReferral,
} from "@/modules/referrals/repositories/slyder-referral.repository";
import { prisma } from "@/server/db/prisma";

function buildReferralLink(code: string): string {
  return `${getAppBaseUrl()}/r/${code}`;
}

// ─── Status ordering — only advance forward ──────────────────
const STATUS_ORDER = [
  "PENDING",
  "LEAD_CAPTURED",
  "APPLICATION_STARTED",
  "APPLICATION_SUBMITTED",
  "APPROVED",
  "ACTIVATED",
  "LIVE",
  "REWARD_ACTIVE",
  "PARTIAL_PAID",
  "PAID_OUT",
] as const;

function canAdvanceTo(current: string, next: string): boolean {
  const terminal = ["CANCELLED", "REJECTED", "EXPIRED", "PAID_OUT"];
  if (terminal.includes(current)) return false;
  const currentIdx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number]);
  const nextIdx = STATUS_ORDER.indexOf(next as (typeof STATUS_ORDER)[number]);
  if (currentIdx === -1 || nextIdx === -1) return false;
  return nextIdx > currentIdx;
}

// ─── Fraud checks ────────────────────────────────────────────

async function assertNoSelfReferral(referrerWhatsapp: string, referredWhatsapp?: string) {
  if (!referredWhatsapp) return;
  if (referrerWhatsapp.replace(/\D/g, "") === referredWhatsapp.replace(/\D/g, "")) {
    throw new Error("Referrer and referred person cannot be the same WhatsApp number.");
  }
}

async function assertNoActiveDuplicateReferral(referredWhatsapp?: string) {
  if (!referredWhatsapp) return;
  const existing = await findSlyderReferralByReferredPhone(referredWhatsapp);
  if (!existing) return;
  const activeStatuses = ["LIVE", "REWARD_ACTIVE", "PARTIAL_PAID", "PAID_OUT"];
  if (activeStatuses.includes(existing.status)) {
    throw new Error("A qualifying referral already exists for this WhatsApp number.");
  }
}

// ─── Create referrals ────────────────────────────────────────

export async function createPublicReferral(input: CreatePublicReferralInput) {
  await assertNoSelfReferral(input.referrerWhatsapp, input.referredWhatsapp);
  await assertNoActiveDuplicateReferral(input.referredWhatsapp);

  const referralCode = await generateUniqueSlyderReferralCode();
  const referralLink = buildReferralLink(referralCode);

  const referral = await createSlyderReferral({
    referralCode,
    referralLink,
    referrerType: "PUBLIC",
    referrerName: input.referrerName,
    referrerEmail: input.referrerEmail || undefined,
    referrerWhatsapp: input.referrerWhatsapp,
    referredFirstName: input.referredFirstName,
    referredLastName: input.referredLastName,
    referredEmail: input.referredEmail || undefined,
    referredWhatsapp: input.referredWhatsapp,
  });

  return { referralCode, referralLink, referralId: referral.id };
}

export async function createSlyderReferralForSlyder(
  slyderId: string,
  slyderName: string,
  slyderWhatsapp: string,
  input: CreateSlyderReferralInput,
) {
  if (input.referredWhatsapp) {
    await assertNoSelfReferral(slyderWhatsapp, input.referredWhatsapp);
    await assertNoActiveDuplicateReferral(input.referredWhatsapp);
  }

  const referralCode = await generateUniqueSlyderReferralCode();
  const referralLink = buildReferralLink(referralCode);

  const referral = await createSlyderReferral({
    referralCode,
    referralLink,
    referrerType: "SLYDER",
    referrerName: slyderName,
    referrerWhatsapp: slyderWhatsapp,
    referrerSlyderId: slyderId,
    referredFirstName: input.referredFirstName,
    referredLastName: input.referredLastName,
    referredEmail: input.referredEmail || undefined,
    referredWhatsapp: input.referredWhatsapp,
  });

  return { referralCode, referralLink, referralId: referral.id };
}

/** Retrieve the most recent referral code for a Slyder, or create a new one. */
export async function getOrCreateSlyderReferralCode(
  slyderId: string,
  slyderName: string,
  slyderWhatsapp: string,
): Promise<{ referralCode: string; referralLink: string }> {
  const existing = await listSlyderReferralsByReferrerSlyderId(slyderId);
  if (existing.length > 0) {
    const first = existing[existing.length - 1]; // oldest = primary link
    return { referralCode: first.referralCode, referralLink: first.referralLink ?? buildReferralLink(first.referralCode) };
  }

  const referralCode = await generateUniqueSlyderReferralCode();
  const referralLink = buildReferralLink(referralCode);

  await createSlyderReferral({
    referralCode,
    referralLink,
    referrerType: "SLYDER",
    referrerName: slyderName,
    referrerWhatsapp: slyderWhatsapp,
    referrerSlyderId: slyderId,
  });

  return { referralCode, referralLink };
}

// ─── Lifecycle ───────────────────────────────────────────────

export async function attachReferralToLead(input: AttachReferralToLeadInput) {
  const referral = await findSlyderReferralByCode(input.referralCode);
  if (!referral) throw new Error("Referral code not found.");

  const updates: Parameters<typeof updateSlyderReferral>[1] = {
    referredLeadId: input.leadId,
  };

  if (input.referredFirstName) updates.referredFirstName = input.referredFirstName;
  if (input.referredLastName) updates.referredLastName = input.referredLastName;
  if (input.referredWhatsapp) updates.referredWhatsapp = input.referredWhatsapp;
  if (input.referredEmail) updates.referredEmail = input.referredEmail;
  if (canAdvanceTo(referral.status, "LEAD_CAPTURED")) updates.status = "LEAD_CAPTURED";

  return updateSlyderReferral(referral.id, updates);
}

export async function attachReferralToApplication(input: AttachReferralToApplicationInput) {
  const referral = await findSlyderReferralByCode(input.referralCode);
  if (!referral) throw new Error("Referral code not found.");

  const updates: Parameters<typeof updateSlyderReferral>[1] = {
    referredApplicationId: input.applicationId,
  };

  if (canAdvanceTo(referral.status, "APPLICATION_SUBMITTED")) {
    updates.status = "APPLICATION_SUBMITTED";
  }

  return updateSlyderReferral(referral.id, updates);
}

export async function markApplicationStarted(referralCode: string, applicationId?: string) {
  const referral = await findSlyderReferralByCode(referralCode);
  if (!referral) return;

  const updates: Parameters<typeof updateSlyderReferral>[1] = {};
  if (applicationId) updates.referredApplicationId = applicationId;
  if (canAdvanceTo(referral.status, "APPLICATION_STARTED")) updates.status = "APPLICATION_STARTED";

  if (Object.keys(updates).length) await updateSlyderReferral(referral.id, updates);
}

export async function markReferralApprovedByApplicationId(applicationId: string) {
  const referral = await findSlyderReferralByReferredApplicationId(applicationId);
  if (!referral) return;
  if (!canAdvanceTo(referral.status, "APPROVED")) return;
  await updateSlyderReferral(referral.id, { status: "APPROVED" });
}

export async function markReferralRejectedByApplicationId(applicationId: string) {
  const referral = await findSlyderReferralByReferredApplicationId(applicationId);
  if (!referral) return;
  if (["CANCELLED", "REJECTED", "EXPIRED"].includes(referral.status)) return;
  await updateSlyderReferral(referral.id, { status: "REJECTED" });
}

export async function markReferralActivatedBySlyderId(slyderId: string) {
  const referral = await findSlyderReferralByReferredSlyderId(slyderId);
  if (!referral) return;
  if (!canAdvanceTo(referral.status, "ACTIVATED")) return;
  await updateSlyderReferral(referral.id, { status: "ACTIVATED", referredSlyderId: slyderId });
}

export async function markReferralLiveBySlyderId(slyderId: string) {
  const referral = await findSlyderReferralByReferredSlyderId(slyderId);
  if (!referral) return;
  if (!canAdvanceTo(referral.status, "LIVE")) return;
  await updateSlyderReferral(referral.id, { status: "LIVE" });
  return referral;
}

export async function lookupReferralCode(referralCode: string) {
  const referral = await findSlyderReferralByCode(referralCode);
  if (!referral) return null;

  // Only return safe public fields
  return {
    referralCode: referral.referralCode,
    referralLink: referral.referralLink ?? buildReferralLink(referral.referralCode),
    referrerFirstName: referral.referrerName.split(" ")[0],
    status: referral.status,
  };
}

export async function cancelReferral(id: string, reason?: string) {
  return updateSlyderReferral(id, {
    status: "CANCELLED",
    adminNotes: reason,
  });
}
