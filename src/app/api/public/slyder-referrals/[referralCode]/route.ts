import { NextResponse } from "next/server";
import { lookupReferralCode } from "@/modules/referrals/services/slyder-referral.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ referralCode: string }> },
) {
  const { referralCode } = await params;

  const result = await lookupReferralCode(referralCode);
  if (!result) {
    return NextResponse.json({ error: "Referral code not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
