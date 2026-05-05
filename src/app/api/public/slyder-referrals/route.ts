import { NextResponse } from "next/server";
import { createPublicReferralSchema } from "@/modules/referrals/schemas/slyder-referral.schema";
import { createPublicReferral } from "@/modules/referrals/services/slyder-referral.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createPublicReferralSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createPublicReferral(parsed.data);
    return NextResponse.json({ ok: true, referralCode: result.referralCode, referralLink: result.referralLink }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create referral.";
    console.error("[api/public/slyder-referrals] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
