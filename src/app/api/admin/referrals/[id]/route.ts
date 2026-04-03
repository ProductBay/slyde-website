import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getReferralDetail } from "@/modules/referrals/services/admin-referral.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const detail = await getReferralDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
