import { NextResponse } from "next/server";
import { referralLookupSchema } from "@/modules/referrals/schemas/public-referral.schema";
import { lookupReferralByCode } from "@/modules/referrals/services/public-referral.service";
import { findSlyderReferralByCode } from "@/modules/referrals/repositories/slyder-referral.repository";

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function getReferredName(referral: {
  referredFirstName?: string | null;
  referredLastName?: string | null;
  referredEmail?: string | null;
  referredWhatsapp?: string | null;
}) {
  const name = [referral.referredFirstName, referral.referredLastName].filter(Boolean).join(" ").trim();
  return name || referral.referredEmail || referral.referredWhatsapp || "Referral link shared";
}

function getSlyderRewardStatus(status: string) {
  if (status === "PAID_OUT") return "paid_out";
  if (status === "PARTIAL_PAID") return "partial_paid";
  if (status === "REWARD_ACTIVE") return "reward_active";
  if (["LIVE", "ACTIVATED", "APPROVED"].includes(status)) return "pending_reward_activation";
  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = referralLookupSchema.safeParse({
    referralCode: url.searchParams.get("referralCode") ?? url.searchParams.get("code") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const referralCode = parsed.data.referralCode.trim().toUpperCase();
  const referral = await lookupReferralByCode(referralCode);
  if (!referral) {
    const slyderReferral = await findSlyderReferralByCode(referralCode);

    if (!slyderReferral) {
      return NextResponse.json({ error: "Referral not found." }, { status: 404 });
    }

    return NextResponse.json({
      referralCode: slyderReferral.referralCode,
      referrerName: slyderReferral.referrerName,
      referredName: getReferredName(slyderReferral),
      status: slyderReferral.status,
      statusReason: slyderReferral.adminNotes || slyderReferral.qualificationNotes || undefined,
      rewardStatus: getSlyderRewardStatus(slyderReferral.status),
      createdAt: toIso(slyderReferral.createdAt),
      updatedAt: toIso(slyderReferral.updatedAt),
      reward: {
        status: getSlyderRewardStatus(slyderReferral.status) || "not_ready",
        rewardType: "SLYDER_REFERRAL_CASH_PAYOUT",
        rewardValue: slyderReferral.totalRewardAmount,
        currency: slyderReferral.rewardCurrency,
        minOrderValue: undefined,
        expiresAt: toIso(slyderReferral.expiresAt) || toIso(slyderReferral.updatedAt) || new Date().toISOString(),
        isTransferable: false,
        transferCount: 0,
        claimedByReferrer: slyderReferral.paidAmount > 0,
        giftedToRecipient: false,
      },
    });
  }

  return NextResponse.json(referral);
}
