import { NextResponse } from "next/server";
import { merchantLoginSchema } from "@/modules/merchant-ops/schemas/merchant-auth.schema";
import { loginMerchant } from "@/modules/merchant-ops/services/merchant-auth.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = merchantLoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid login input" }, { status: 400 });
  }

  try {
    const result = await loginMerchant(parsed.data.identifier, parsed.data.password);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in" }, { status: 400 });
  }
}
