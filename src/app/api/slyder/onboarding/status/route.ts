import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function GET() {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  try {
    const result = await getSlyderOnboardingStatus(slyderContext.user.id);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
