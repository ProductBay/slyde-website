import { NextResponse } from "next/server";
import { getReferrerSummary } from "@/modules/referrals/services/referrer-dashboard.service";
import { requireReferrerContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const summary = await getReferrerSummary(context.account.id);
  return NextResponse.json(summary);
}
