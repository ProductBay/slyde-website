import {
  findReferralByIdForReferrerAccount,
  findReferrerAccountById,
  findRewardByReferralId,
  listReferralEventsByReferralId,
  listReferralsByReferrerAccountId,
} from "@/modules/referrals/repositories/referral.repository";

export async function getReferrerMe(referrerAccountId: string) {
  const account = await findReferrerAccountById(referrerAccountId);
  if (!account) {
    throw new Error("Referrer account not found.");
  }

  return account;
}

export async function getReferrerSummary(referrerAccountId: string) {
  const rows = await listReferralsByReferrerAccountId(referrerAccountId);

  const rewardEarned = rows.filter((row) => row.referral.status === "reward_earned").length;
  const rewardClaimed = rows.filter((row) => row.referral.status === "reward_claimed").length;
  const rewardGifted = rows.filter((row) => row.referral.status === "reward_gifted").length;

  return {
    totalReferrals: rows.length,
    submitted: rows.filter((row) => row.referral.status === "submitted").length,
    applicationStarted: rows.filter((row) => row.referral.status === "application_started").length,
    applicationCompleted: rows.filter((row) => row.referral.status === "application_completed").length,
    approved: rows.filter((row) => row.referral.status === "approved").length,
    activated: rows.filter((row) => row.referral.status === "activated").length,
    ready: rows.filter((row) => row.referral.status === "ready").length,
    firstDeliveryCompleted: rows.filter((row) => row.referral.status === "first_delivery_completed").length,
    rewardEarned,
    rewardClaimed,
    rewardGifted,
    activeRewards: rows.filter((row) => row.reward && !["redeemed", "expired", "cancelled"].includes(row.reward.status)).length,
  };
}

export async function getReferrerReferrals(referrerAccountId: string) {
  const rows = await listReferralsByReferrerAccountId(referrerAccountId);

  return rows.map((row) => ({
    ...row.referral,
    reward: row.reward ?? null,
  }));
}

export async function getReferrerReferralDetail(referrerAccountId: string, referralId: string) {
  const referral = await findReferralByIdForReferrerAccount(referralId, referrerAccountId);
  if (!referral) return null;

  const reward = await findRewardByReferralId(referral.id);
  const events = await listReferralEventsByReferralId(referralId);

  return {
    referral,
    reward: reward ?? null,
    events,
  };
}
