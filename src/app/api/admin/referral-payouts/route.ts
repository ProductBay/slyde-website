import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { slyderReferralPayoutFiltersSchema } from "@/modules/referrals/schemas/slyder-referral-payout.schema";
import { listSlyderReferralPayouts } from "@/modules/referrals/repositories/slyder-referral.repository";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = slyderReferralPayoutFiltersSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    referralId: url.searchParams.get("referralId") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await listSlyderReferralPayouts(parsed.data);
  return NextResponse.json(result);
}
