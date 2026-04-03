import { NextResponse } from "next/server";
import { merchantStatusLookupSchema } from "@/modules/merchant/schemas/merchant-status.schema";
import { lookupMerchantApplicantStatus } from "@/modules/merchant/services/merchant-status.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_merchant_status_lookup",
    limit: 8,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: false,
  });
  if (protection) return protection;

  const json = await request.json().catch(() => null);
  const parsed = merchantStatusLookupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await lookupMerchantApplicantStatus(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to look up merchant status." }, { status: 400 });
  }
}
