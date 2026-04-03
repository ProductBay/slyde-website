import { NextResponse } from "next/server";
import { getReferrerReferrals } from "@/modules/referrals/services/referrer-dashboard.service";
import { requireReferrerContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const referrals = await getReferrerReferrals(context.account.id);
  return NextResponse.json({ items: referrals });
}
