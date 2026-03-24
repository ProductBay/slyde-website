import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { evaluateSlyderEligibilityForUser } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function POST() {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  try {
    const result = await evaluateSlyderEligibilityForUser(slyderContext.user.id);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
