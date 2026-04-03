import { NextResponse } from "next/server";
import { getReferrerReferralDetail } from "@/modules/referrals/services/referrer-dashboard.service";
import { requireReferrerContext } from "@/server/auth/guards";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ referralId: string }> },
) {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const { referralId } = await params;
  const detail = await getReferrerReferralDetail(context.account.id, referralId);
  if (!detail) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
