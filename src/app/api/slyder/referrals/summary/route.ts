import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { getSlyderReferralSummaryForSlyder } from "@/modules/referrals/repositories/slyder-referral.repository";
import { getOrCreateSlyderReferralCode } from "@/modules/referrals/services/slyder-referral.service";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const ctx = await requireSlyderContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const profile = await prisma.slyderProfile.findUnique({
      where: { userId: ctx.user.id },
      include: { application: true },
    });
    const slyderWhatsapp = profile?.application?.phone ?? ctx.user.email ?? ctx.user.id;

    const [summary, link] = await Promise.all([
      getSlyderReferralSummaryForSlyder(ctx.user.id),
      getOrCreateSlyderReferralCode(ctx.user.id, ctx.user.fullName, slyderWhatsapp),
    ]);

    return NextResponse.json({
      ok: true,
      referralCode: link.referralCode,
      referralLink: link.referralLink,
      totalReferrals: summary.totalReferrals,
      liveReferrals: summary.liveReferrals,
      totalEarned: summary.totalEarned,
      totalPaid: summary.totalPaid,
      remainingPotential: summary.remainingPotential,
      referrals: summary.referrals,
    });
  } catch (error) {
    console.error("[api/slyder/referrals/summary] GET failed", { error });
    return NextResponse.json({ error: "Could not load referral summary." }, { status: 500 });
  }
}
