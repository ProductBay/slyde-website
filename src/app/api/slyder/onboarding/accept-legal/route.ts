import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { slyderActivationLegalAcceptanceSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { acceptSlyderActivationLegal } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export async function POST(request: Request) {
  const slyderContext = await requireSlyderContext();
  if (slyderContext instanceof NextResponse) return slyderContext;

  const json = await request.json();
  const parsed = slyderActivationLegalAcceptanceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const headerStore = await headers();
    const result = await acceptSlyderActivationLegal(slyderContext.user.id, parsed.data, {
      ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
      userAgent: headerStore.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
