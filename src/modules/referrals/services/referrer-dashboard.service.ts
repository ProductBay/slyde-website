import {
  findReferralByIdForReferrerAccount,
  findReferrerAccountById,
  findRewardByReferralId,
  listReferralEventsByReferralId,
  listReferralsByReferrerAccountId,
} from "@/modules/referrals/repositories/referral.repository";
import { listPublicSlyderReferralsByReferrerContact } from "@/modules/referrals/repositories/slyder-referral.repository";

const ACTIVE_SLYDER_REFERRAL_STATUSES = [
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
] as string[];

function dateToIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function calculateEarnedFromPayouts(
  payouts: Array<{ status: string; payoutAmount: number }>,
) {
  return payouts
    .filter((payout) => ["EARNED", "APPROVED", "PAID"].includes(payout.status))
    .reduce((sum, payout) => sum + payout.payoutAmount, 0);
}

async function listSlyderReferralRowsForAccount(referrerAccountId: string) {
  const account = await findReferrerAccountById(referrerAccountId);
  if (!account) return [];

  return listPublicSlyderReferralsByReferrerContact({
    referrerEmail: account.email,
    referrerWhatsapp: account.phone,
  });
}

export async function getReferrerMe(referrerAccountId: string) {
  const account = await findReferrerAccountById(referrerAccountId);
  if (!account) {
    throw new Error("Referrer account not found.");
  }

  return account;
}

export async function getReferrerSummary(referrerAccountId: string) {
  const [rows, slyderRows] = await Promise.all([
    listReferralsByReferrerAccountId(referrerAccountId),
    listSlyderReferralRowsForAccount(referrerAccountId),
  ]);

  const rewardEarned = rows.filter((row) => row.referral.status === "reward_earned").length;
  const rewardClaimed = rows.filter((row) => row.referral.status === "reward_claimed").length;
  const rewardGifted = rows.filter((row) => row.referral.status === "reward_gifted").length;
  const activeSlyderRows = slyderRows.filter((row) =>
    ACTIVE_SLYDER_REFERRAL_STATUSES.includes(row.status),
  );

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
    slyderReferralTotal: slyderRows.length,
    slyderLeadCaptured: slyderRows.filter((row) =>
      [
        "LEAD_CAPTURED",
        "APPLICATION_STARTED",
        "APPLICATION_SUBMITTED",
        "APPROVED",
        "ACTIVATED",
        "LIVE",
        "REWARD_ACTIVE",
        "PARTIAL_PAID",
        "PAID_OUT",
      ].includes(row.status),
    ).length,
    slyderApplicationSubmitted: slyderRows.filter((row) =>
      ["APPLICATION_SUBMITTED", "APPROVED", "ACTIVATED", "LIVE", "REWARD_ACTIVE", "PARTIAL_PAID", "PAID_OUT"].includes(row.status),
    ).length,
    slyderApproved: slyderRows.filter((row) =>
      ["APPROVED", "ACTIVATED", "LIVE", "REWARD_ACTIVE", "PARTIAL_PAID", "PAID_OUT"].includes(row.status),
    ).length,
    slyderLive: slyderRows.filter((row) => ["LIVE", "REWARD_ACTIVE", "PARTIAL_PAID", "PAID_OUT"].includes(row.status)).length,
    slyderPotentialEarnings: activeSlyderRows.reduce((sum, row) => sum + row.totalRewardAmount, 0),
    slyderEarnedAmount: slyderRows.reduce((sum, row) => sum + calculateEarnedFromPayouts(row.payouts), 0),
    slyderPaidAmount: slyderRows.reduce((sum, row) => sum + row.paidAmount, 0),
    slyderRemainingPotential: activeSlyderRows.reduce((sum, row) => sum + row.remainingAmount, 0),
  };
}

export async function getReferrerReferrals(referrerAccountId: string) {
  const rows = await listReferralsByReferrerAccountId(referrerAccountId);

  return rows.map((row) => ({
    ...row.referral,
    reward: row.reward ?? null,
  }));
}

export async function getReferrerSlyderReferrals(referrerAccountId: string) {
  const rows = await listSlyderReferralRowsForAccount(referrerAccountId);

  return rows.map((row) => ({
    id: row.id,
    referralCode: row.referralCode,
    referralLink: row.referralLink,
    referredFirstName: row.referredFirstName,
    referredLastName: row.referredLastName,
    referredEmail: row.referredEmail,
    referredWhatsapp: row.referredWhatsapp,
    referredLeadId: row.referredLeadId,
    referredApplicationId: row.referredApplicationId,
    referredSlyderId: row.referredSlyderId,
    status: row.status,
    totalRewardAmount: row.totalRewardAmount,
    rewardCurrency: row.rewardCurrency,
    paidAmount: row.paidAmount,
    remainingAmount: row.remainingAmount,
    rentCyclesCompleted: row.rentCyclesCompleted,
    rentCyclesRequired: row.rentCyclesRequired,
    createdAt: dateToIso(row.createdAt),
    updatedAt: dateToIso(row.updatedAt),
    firstRentPaidAt: dateToIso(row.firstRentPaidAt),
    rewardActivatedAt: dateToIso(row.rewardActivatedAt),
    paidOutAt: dateToIso(row.paidOutAt),
    payouts: row.payouts.map((payout) => ({
      id: payout.id,
      cycleNumber: payout.cycleNumber,
      payoutAmount: payout.payoutAmount,
      currency: payout.currency,
      status: payout.status,
      earnedAt: dateToIso(payout.earnedAt),
      approvedAt: dateToIso(payout.approvedAt),
      paidAt: dateToIso(payout.paidAt),
    })),
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
