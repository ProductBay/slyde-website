import crypto from "node:crypto";
import type { ReferralReward, ReferralRewardAudit } from "@/types/backend/onboarding";
import {
  createReferralEvent,
  createReward,
  createRewardAudit,
  findReferralByCode,
  findReferralById,
  findRewardById,
  findRewardByReferralId,
  updateReferral,
  updateReward,
} from "@/modules/referrals/repositories/referral.repository";
import { bindableCustomerAccount } from "@/modules/referrals/services/customer-reward-binding.service";

function nowIso() {
  return new Date().toISOString();
}

function plusDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export async function appendRewardAudit(
  rewardId: string,
  action: string,
  actorType: string,
  actorId?: string,
  notes?: string,
) {
  const audit: ReferralRewardAudit = {
    id: crypto.randomUUID(),
    rewardId,
    action,
    actorType,
    actorId,
    notes,
    createdAt: nowIso(),
  };

  return createRewardAudit(audit);
}

export async function createEarnedRewardForReferral(referralId: string) {
  const referral = await findReferralById(referralId);
  if (!referral) throw new Error("Referral not found.");

  const existing = await findRewardByReferralId(referral.id);
  if (existing) return existing;

  const timestamp = nowIso();
  const reward: ReferralReward = {
    id: crypto.randomUUID(),
    publicReferralId: referral.id,
    rewardType: "DELIVERY_CREDIT_FIXED",
    rewardValue: 400,
    currency: "JMD",
    status: "earned",
    isTransferable: true,
    transferCount: 0,
    minOrderValue: 2000,
    expiresAt: plusDaysIso(30),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const created = await createReward(reward);
  await updateReferral({
    ...referral,
    rewardId: created.id,
    status: "reward_earned",
    rewardEarnedAt: timestamp,
    updatedAt: timestamp,
  });
  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "reward_earned",
    title: "Reward earned",
    description: "Reward earned after first live delivery.",
    createdAt: timestamp,
  });
  await appendRewardAudit(created.id, "reward_earned", "system_internal", undefined, "Reward earned after first live delivery.");
  return created;
}

async function resolveReferral(identifier: { referralId?: string; referralCode?: string }) {
  const referral = identifier.referralId
    ? await findReferralById(identifier.referralId)
    : identifier.referralCode
      ? await findReferralByCode(identifier.referralCode)
      : null;
  if (!referral) throw new Error("Referral not found.");
  return referral;
}

export async function claimRewardForSelf(
  identifier: { referralId?: string; referralCode?: string },
  customerAccount: { customerAccountId: string; phone: string },
) {
  const referral = await resolveReferral(identifier);
  const reward = await findRewardByReferralId(referral.id);
  if (!reward) throw new Error("No reward has been earned for this referral yet.");
  if (!["earned", "claim_pending"].includes(reward.status)) {
    throw new Error("This reward is not available to claim.");
  }

  const bindable = await bindableCustomerAccount(customerAccount);
  const updatedReward: ReferralReward = {
    ...reward,
    status: "claimed_by_referrer",
    ownerCustomerAccountId: bindable.customerAccountId,
    ownerPhone: bindable.phone,
    updatedAt: nowIso(),
  };

  const saved = await updateReward(updatedReward);
  await updateReferral({
    ...referral,
    status: "reward_claimed",
    rewardClaimedAt: saved.updatedAt,
    updatedAt: saved.updatedAt,
  });
  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "reward_claimed",
    title: "Reward claimed",
    description: "Reward claimed by referrer.",
    metadata: { customerAccountId: bindable.customerAccountId },
    createdAt: saved.updatedAt,
  });
  await appendRewardAudit(saved.id, "reward_claimed", "public_referrer", bindable.customerAccountId, "Reward claimed by referrer.");
  return saved;
}

export async function giftReward(
  identifier: { referralId?: string; referralCode?: string },
  recipientCustomerAccount: { customerAccountId: string; phone: string },
  actor?: { actorId?: string; phone?: string },
) {
  const referral = await resolveReferral(identifier);
  const reward = await findRewardByReferralId(referral.id);
  if (!reward) throw new Error("No reward has been earned for this referral yet.");
  if (!reward.isTransferable || reward.transferCount > 0) {
    throw new Error("This reward can no longer be gifted.");
  }
  if (!["earned", "claim_pending", "gift_pending"].includes(reward.status)) {
    throw new Error("This reward is not available to gift.");
  }

  const bindable = await bindableCustomerAccount(recipientCustomerAccount);
  const timestamp = nowIso();
  const updatedReward: ReferralReward = {
    ...reward,
    status: "gifted",
    transferCount: reward.transferCount + 1,
    transferredAt: timestamp,
    giftedToCustomerAccountId: bindable.customerAccountId,
    giftedToPhone: bindable.phone,
    giftedByReferrerPhone: actor?.phone || referral.referrerPhone,
    updatedAt: timestamp,
  };

  const saved = await updateReward(updatedReward);
  await updateReferral({
    ...referral,
    status: "reward_gifted",
    rewardGiftedAt: timestamp,
    updatedAt: timestamp,
  });
  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "reward_gifted",
    title: "Reward gifted",
    description: "Reward gifted to an eligible customer account.",
    metadata: {
      actorId: actor?.actorId,
      recipientCustomerAccountId: bindable.customerAccountId,
    },
    createdAt: timestamp,
  });
  await appendRewardAudit(saved.id, "reward_gifted", "public_referrer", actor?.actorId, "Reward gifted to an eligible customer account.");
  return saved;
}

export async function expireReward(rewardId: string, actor?: { actorType?: string; actorId?: string; notes?: string }) {
  const reward = await findRewardById(rewardId);
  if (!reward) {
    throw new Error("Reward not found.");
  }

  const updated = await updateReward({
    ...reward,
    status: "expired",
    updatedAt: nowIso(),
  });

  await appendRewardAudit(
    updated.id,
    "reward_expired",
    actor?.actorType || "admin_user",
    actor?.actorId,
    actor?.notes || "Reward expired.",
  );
  return updated;
}
