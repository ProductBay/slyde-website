import { NextResponse } from "next/server";
import { claimRewardSchema } from "@/modules/referrals/schemas/referral-reward.schema";
import { getReferrerReferralDetail } from "@/modules/referrals/services/referrer-dashboard.service";
import { claimRewardForSelf } from "@/modules/referrals/services/referral-reward.service";
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
  const parsed = claimRewardSchema.safeParse({
    ...payload,
    referralId,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reward = await claimRewardForSelf(
      { referralId },
      { customerAccountId: parsed.data.customerAccountId, phone: parsed.data.phone },
    );
    return NextResponse.json({ reward });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not claim reward." }, { status: 400 });
  }
}
