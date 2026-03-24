import { NextResponse } from "next/server";
import { loginSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { loginSlyder } from "@/modules/slyder-auth/services/slyder-auth.service";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await loginSlyder(parsed.data.identifier, parsed.data.password);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
