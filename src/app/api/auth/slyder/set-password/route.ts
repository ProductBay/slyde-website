import { NextResponse } from "next/server";
import { setPasswordSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { setSlyderPassword } from "@/modules/slyder-auth/services/slyder-auth.service";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = setPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await setSlyderPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
