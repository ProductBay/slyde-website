import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { resendSlyderActivationInvite } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function POST(request: Request) {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  const json = await request.json().catch(() => ({}));
  const channel =
    json && (json.channel === "email" || json.channel === "sms" || json.channel === "whatsapp")
      ? json.channel
      : "email";

  try {
    const result = await resendSlyderActivationInvite(slyderContext.user.id, channel);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
