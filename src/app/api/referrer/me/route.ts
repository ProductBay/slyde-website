import { NextResponse } from "next/server";
import { requireReferrerContext } from "@/server/auth/guards";
import { getReferrerMe } from "@/modules/referrals/services/referrer-dashboard.service";

export async function GET() {
  const context = await requireReferrerContext();
  if (context instanceof NextResponse) return context;

  const me = await getReferrerMe(context.account.id);
  return NextResponse.json(me);
}
