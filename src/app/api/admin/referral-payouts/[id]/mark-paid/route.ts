import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { markReferralPayoutPaidSchema } from "@/modules/referrals/schemas/slyder-referral-payout.schema";
import { markPayoutPaid } from "@/modules/referrals/services/slyder-referral-payout.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;

  try {
    const json = await request.json();
    const parsed = markReferralPayoutPaidSchema.safeParse({ ...json, payoutId: id });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await markPayoutPaid(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mark paid failed.";
    console.error("[api/admin/referral-payouts/[id]/mark-paid] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
