import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { slyderReadinessUpdateSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { updateSlyderReadiness } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function PATCH(request: Request) {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  const json = await request.json();
  const parsed = slyderReadinessUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await updateSlyderReadiness(slyderContext.user.id, parsed.data);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
