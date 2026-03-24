import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { resendSlyderStatusUpdate } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function POST() {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  try {
    const result = await resendSlyderStatusUpdate(slyderContext.user.id);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "We could not resend your status update." }, { status: 400 });
  }
}
