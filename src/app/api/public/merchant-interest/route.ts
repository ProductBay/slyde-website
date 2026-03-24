import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { businessInquirySchema } from "@/lib/forms";
import { createMerchantInterest } from "@/modules/merchant/services/merchant-interest.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_merchant_interest",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = businessInquirySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const headerStore = await headers();
  const result = await createMerchantInterest({
    ...parsed.data,
    ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  });

  return NextResponse.json(
    {
      ok: true,
      merchantInterest: result,
      workflow: {
        currentStage: "inquiry_received",
        nextStage: "merchant_waitlist_review",
      },
    },
    { status: 201 },
  );
}
