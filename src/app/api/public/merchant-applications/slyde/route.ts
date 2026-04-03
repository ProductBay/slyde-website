import { NextResponse } from "next/server";
import { slydeMerchantApplicationSchema } from "@/modules/merchant/schemas/merchant-application.schema";
import { createSlydeMerchantApplication } from "@/modules/merchant/services/merchant-application.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_merchant_application_slyde",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: false,
  });
  if (protection) return protection;

  const json = await request.json().catch(() => null);
  const parsed = slydeMerchantApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const application = await createSlydeMerchantApplication(parsed.data);
    return NextResponse.json({ ok: true, application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create SLYDE delivery application." }, { status: 400 });
  }
}
