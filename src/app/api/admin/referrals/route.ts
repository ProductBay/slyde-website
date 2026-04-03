import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { adminReferralFiltersSchema } from "@/modules/referrals/schemas/public-referral.schema";
import { listReferrals } from "@/modules/referrals/services/admin-referral.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = adminReferralFiltersSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    parish: url.searchParams.get("parish") ?? undefined,
    rewardStatus: url.searchParams.get("rewardStatus") ?? undefined,
    duplicateFlagged: url.searchParams.get("duplicateFlagged") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const referrals = await listReferrals(parsed.data);
  return NextResponse.json({ rows: referrals });
}
