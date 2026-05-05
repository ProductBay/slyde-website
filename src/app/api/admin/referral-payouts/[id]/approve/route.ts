import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { approvePayout } from "@/modules/referrals/services/slyder-referral-payout.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;

  try {
    const json = await request.json().catch(() => ({}));
    const adminNotes = typeof json?.adminNotes === "string" ? json.adminNotes : undefined;
    const payout = await approvePayout(id, adminNotes);
    return NextResponse.json({ ok: true, payout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Approval failed.";
    console.error("[api/admin/referral-payouts/[id]/approve] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
