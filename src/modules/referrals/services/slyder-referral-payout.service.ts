import type { MarkReferralPayoutPaidInput } from "@/modules/referrals/schemas/slyder-referral-payout.schema";
import {
  createSlyderReferralPayout,
  findSlyderReferralById,
  findSlyderReferralPayoutById,
  findSlyderReferralPayoutByCycle,
  updateSlyderReferralPayout,
  updateSlyderReferral,
} from "@/modules/referrals/repositories/slyder-referral.repository";

const CYCLES_REQUIRED = 5;
const RENT_AMOUNT = 2000;
const PAYOUT_PER_CYCLE = 1000;
const TOTAL_REWARD = CYCLES_REQUIRED * PAYOUT_PER_CYCLE; // 5000

/**
 * Called when the referred Slyder goes live.
 * Sets referral status to REWARD_ACTIVE and creates 5 pending payout records.
 */
export async function activateRewardForLiveSlyder(referralId: string) {
  const referral = await findSlyderReferralById(referralId);
  if (!referral) throw new Error("Referral not found.");

  await updateSlyderReferral(referralId, {
    status: "REWARD_ACTIVE",
    rewardActivatedAt: new Date(),
  });

  for (let cycle = 1; cycle <= CYCLES_REQUIRED; cycle++) {
    const existing = await findSlyderReferralPayoutByCycle(referralId, cycle);
    if (!existing) {
      await createSlyderReferralPayout({
        referralId,
        cycleNumber: cycle,
        rentAmount: RENT_AMOUNT,
        payoutAmount: PAYOUT_PER_CYCLE,
      });
    }
  }
}

/**
 * Mark a specific rent cycle as paid (manually by admin until billing is automated).
 * This earns but does NOT yet pay the payout — admin still approves and pays separately.
 */
export async function markRentCyclePaid(referralId: string, cycleNumber: number) {
  const payout = await findSlyderReferralPayoutByCycle(referralId, cycleNumber);
  if (!payout) throw new Error(`Payout cycle ${cycleNumber} not found for referral.`);
  if (payout.status !== "PENDING") {
    throw new Error(`Cycle ${cycleNumber} is already ${payout.status}.`);
  }

  await updateSlyderReferralPayout(payout.id, {
    status: "EARNED",
    earnedAt: new Date(),
  });

  const referral = await findSlyderReferralById(referralId);
  if (referral) {
    await updateSlyderReferral(referralId, {
      rentCyclesCompleted: referral.rentCyclesCompleted + 1,
    });
  }
}

/**
 * Admin approves a payout (EARNED → APPROVED).
 */
export async function approvePayout(payoutId: string, adminNotes?: string) {
  const payout = await findSlyderReferralPayoutById(payoutId);
  if (!payout) throw new Error("Payout not found.");
  if (!["PENDING", "EARNED"].includes(payout.status)) {
    throw new Error(`Payout is ${payout.status} — cannot approve.`);
  }

  return updateSlyderReferralPayout(payout.id, {
    status: "APPROVED",
    approvedAt: new Date(),
    ...(adminNotes ? { adminNotes } : {}),
  });
}

/**
 * Admin marks payout as paid (APPROVED → PAID). Updates parent referral totals.
 */
export async function markPayoutPaid(input: MarkReferralPayoutPaidInput) {
  const payout = await findSlyderReferralPayoutById(input.payoutId);
  if (!payout) throw new Error("Payout not found.");
  if (payout.status !== "APPROVED") {
    throw new Error(`Payout must be APPROVED before marking paid (current: ${payout.status}).`);
  }

  await updateSlyderReferralPayout(payout.id, {
    status: "PAID",
    paidAt: new Date(),
    payoutMethod: input.payoutMethod,
    externalReference: input.externalReference,
    adminNotes: input.adminNotes,
  });

  // Update parent referral totals
  const referral = await findSlyderReferralById(payout.referralId);
  if (referral) {
    const newPaidAmount = referral.paidAmount + payout.payoutAmount;
    const newRemainingAmount = Math.max(0, TOTAL_REWARD - newPaidAmount);
    const isFullyPaid = newPaidAmount >= TOTAL_REWARD;

    await updateSlyderReferral(referral.id, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      ...(isFullyPaid ? { status: "PAID_OUT", paidOutAt: new Date() } : { status: "PARTIAL_PAID" }),
    });
  }
}

/**
 * Admin cancels a payout cycle.
 */
export async function cancelPayout(payoutId: string, adminNotes?: string) {
  const payout = await findSlyderReferralPayoutById(payoutId);
  if (!payout) throw new Error("Payout not found.");
  if (payout.status === "PAID") {
    throw new Error("Cannot cancel an already-paid payout.");
  }

  return updateSlyderReferralPayout(payout.id, {
    status: "CANCELLED",
    adminNotes,
  });
}
