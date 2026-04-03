import { NextResponse } from "next/server";
import { referralLookupSchema } from "@/modules/referrals/schemas/public-referral.schema";
import { lookupReferralByCode } from "@/modules/referrals/services/public-referral.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = referralLookupSchema.safeParse({
    referralCode: url.searchParams.get("referralCode") ?? url.searchParams.get("code") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const referral = await lookupReferralByCode(parsed.data.referralCode);
  if (!referral) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  return NextResponse.json(referral);
}
