import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { adminReferralLinkApplicationSchema } from "@/modules/referrals/schemas/public-referral.schema";
import { linkReferralToSlyderApplication } from "@/modules/referrals/services/admin-referral.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const json = await request.json();
  const parsed = adminReferralLinkApplicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const referral = await linkReferralToSlyderApplication(id, parsed.data.applicationId);
    return NextResponse.json({ ok: true, referral });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not link referral." }, { status: 400 });
  }
}
