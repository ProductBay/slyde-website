import crypto from "node:crypto";
import type { PublicReferralSubmissionInput, PublicSlyderReferral } from "@/types/backend/onboarding";
import {
  createReferral,
  findReferralByCode,
  findReferralByReferredPhone,
  findRewardByReferralId,
} from "@/modules/referrals/repositories/referral.repository";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";

function nowIso() {
  return new Date().toISOString();
}

function hashValue(value: string | undefined) {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function generateReferralCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `SLY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existing = await findReferralByCode(code);
    if (!existing) return code;
  }

  return `SLY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function normalizeReferralInput(input: PublicReferralSubmissionInput): PublicReferralSubmissionInput {
  return {
    referrerName: input.referrerName.trim(),
    referrerPhone: normalizePhone(input.referrerPhone),
    referrerEmail: input.referrerEmail ? normalizeEmail(input.referrerEmail) : undefined,
    referredName: input.referredName.trim(),
    referredEmail: input.referredEmail ? normalizeEmail(input.referredEmail) : undefined,
    referredPhone: normalizePhone(input.referredPhone),
    referredParish: input.referredParish?.trim() || undefined,
    referredTown: input.referredTown?.trim() || undefined,
    referredVehicleType: input.referredVehicleType?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}

export async function findDuplicateByReferredPhone(phone: string) {
  return findReferralByReferredPhone(normalizePhone(phone));
}

export async function submitReferral(
  input: PublicReferralSubmissionInput,
  requestMeta?: { ipAddress?: string; userAgent?: string },
) {
  const normalized = normalizeReferralInput(input);

  if (!normalized.referrerPhone || !normalized.referredPhone) {
    throw new Error("Both referrer and referred phone numbers are required.");
  }

  if (normalized.referrerPhone === normalized.referredPhone) {
    throw new Error("Self-referrals are not allowed.");
  }

  const duplicate = await findDuplicateByReferredPhone(normalized.referredPhone);
  const timestamp = nowIso();
  const referral: PublicSlyderReferral = {
    id: crypto.randomUUID(),
    referralCode: await generateReferralCode(),
    referrerName: normalized.referrerName,
    referrerPhone: normalized.referrerPhone,
    referrerEmail: normalized.referrerEmail,
    referredName: normalized.referredName,
    referredEmail: normalized.referredEmail,
    referredPhone: normalized.referredPhone,
    referredParish: normalized.referredParish,
    referredTown: normalized.referredTown,
    referredVehicleType: normalized.referredVehicleType,
    notes: normalized.notes,
    status: duplicate ? "duplicate_flagged" : "submitted",
    statusReason: duplicate ? `Possible duplicate of referral ${duplicate.referralCode}` : undefined,
    duplicateOfReferralId: duplicate?.id,
    submittedIpHash: hashValue(requestMeta?.ipAddress),
    submittedUserAgent: requestMeta?.userAgent,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return createReferral(referral);
}

export async function lookupReferralByCode(referralCode: string) {
  const referral = await findReferralByCode(referralCode.trim().toUpperCase());
  if (!referral) return null;
  const reward = await findRewardByReferralId(referral.id);

  return {
    referralCode: referral.referralCode,
    referrerName: referral.referrerName,
    referredName: referral.referredName,
    status: referral.status,
    statusReason: referral.statusReason,
    updatedAt: referral.updatedAt,
    rewardStatus: reward?.status,
    createdAt: referral.createdAt,
    reward: reward
      ? {
          status: reward.status,
          rewardType: reward.rewardType,
          rewardValue: reward.rewardValue,
          currency: reward.currency,
          minOrderValue: reward.minOrderValue,
          expiresAt: reward.expiresAt,
          isTransferable: reward.isTransferable,
          transferCount: reward.transferCount,
          transferredAt: reward.transferredAt,
          redeemedAt: reward.redeemedAt,
          claimedByReferrer: Boolean(reward.ownerCustomerAccountId || reward.ownerPhone),
          giftedToRecipient: Boolean(reward.giftedToCustomerAccountId || reward.giftedToPhone),
        }
      : null,
  };
}
