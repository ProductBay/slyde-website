import { NextResponse } from "next/server";
import { claimRewardSchema } from "@/modules/referrals/schemas/referral-reward.schema";
import { claimRewardForSelf } from "@/modules/referrals/services/referral-reward.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_referral_reward_claim",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = claimRewardSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reward = await claimRewardForSelf(
      {
        referralId: parsed.data.referralId,
        referralCode: parsed.data.referralCode,
      },
      {
        customerAccountId: parsed.data.customerAccountId,
        phone: parsed.data.phone,
      },
    );

    return NextResponse.json({ ok: true, reward });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not claim reward." }, { status: 400 });
  }
}
