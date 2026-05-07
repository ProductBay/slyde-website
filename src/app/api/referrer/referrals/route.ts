import { NextResponse } from "next/server";
import { getReferrerReferrals, getReferrerSlyderReferrals } from "@/modules/referrals/services/referrer-dashboard.service";
import { requireReferrerContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const [referrals, slyderReferrals] = await Promise.all([
    getReferrerReferrals(context.account.id),
    getReferrerSlyderReferrals(context.account.id),
  ]);

  return NextResponse.json({ items: referrals, slyderItems: slyderReferrals });
}
