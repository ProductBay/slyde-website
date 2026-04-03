import { NextResponse } from "next/server";
import { merchantSetPasswordSchema } from "@/modules/merchant-ops/schemas/merchant-auth.schema";
import { setMerchantPassword } from "@/modules/merchant-ops/services/merchant-auth.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = merchantSetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid activation input" }, { status: 400 });
  }

  try {
    const result = await setMerchantPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
