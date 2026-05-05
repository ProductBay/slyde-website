import { NextResponse } from "next/server";
import { attachReferralToApplicationSchema } from "@/modules/referrals/schemas/slyder-referral.schema";
import { attachReferralToApplication } from "@/modules/referrals/services/slyder-referral.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = attachReferralToApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await attachReferralToApplication(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not attach referral.";
    console.error("[api/public/slyder-referrals/attach-application] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
