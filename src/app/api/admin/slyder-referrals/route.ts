import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { slyderReferralFiltersSchema } from "@/modules/referrals/schemas/slyder-referral.schema";
import { listSlyderReferrals } from "@/modules/referrals/repositories/slyder-referral.repository";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = slyderReferralFiltersSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    referrerType: url.searchParams.get("referrerType") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await listSlyderReferrals(parsed.data);
  return NextResponse.json(result);
}
