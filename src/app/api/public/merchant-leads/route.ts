import { NextResponse } from "next/server";
import { merchantLeadSchema } from "@/modules/merchant/schemas/merchant-lead.schema";
import { createMerchantLead } from "@/modules/merchant/services/merchant-lead.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_merchant_leads",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: false,
  });
  if (protection) return protection;

  const json = await request.json().catch(() => null);
  const parsed = merchantLeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const lead = await createMerchantLead(parsed.data);
    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create merchant lead." }, { status: 400 });
  }
}
