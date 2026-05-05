import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { cancelPayout } from "@/modules/referrals/services/slyder-referral-payout.service";

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
    await cancelPayout(id, adminNotes);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancel failed.";
    console.error("[api/admin/referral-payouts/[id]/cancel] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
