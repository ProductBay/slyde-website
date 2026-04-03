import { NextResponse } from "next/server";
import { giftRewardSchema } from "@/modules/referrals/schemas/referral-reward.schema";
import { getReferrerReferralDetail } from "@/modules/referrals/services/referrer-dashboard.service";
import { giftReward } from "@/modules/referrals/services/referral-reward.service";
import { requireReferrerContext } from "@/server/auth/guards";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ referralId: string }> },
) {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const { referralId } = await params;
  const allowed = await getReferrerReferralDetail(context.account.id, referralId);
  if (!allowed) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = giftRewardSchema.safeParse({
    ...payload,
    referralId,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reward = await giftReward(
      { referralId },
      {
        customerAccountId: parsed.data.recipientCustomerAccountId,
        phone: parsed.data.recipientPhone,
      },
      {
        actorId: context.account.id,
        phone: context.account.phone,
      },
    );
    return NextResponse.json({ reward });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not gift reward." }, { status: 400 });
  }
}
