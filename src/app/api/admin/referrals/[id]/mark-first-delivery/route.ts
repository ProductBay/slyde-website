import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { adminReferralMarkFirstDeliverySchema } from "@/modules/referrals/schemas/public-referral.schema";
import { markFirstDeliveryCompleted } from "@/modules/referrals/services/admin-referral.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const json = await request.json().catch(() => ({}));
  const parsed = adminReferralMarkFirstDeliverySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reward = await markFirstDeliveryCompleted(id, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ ok: true, reward });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not mark first delivery complete." }, { status: 400 });
  }
}
