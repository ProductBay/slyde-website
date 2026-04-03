import { NextResponse } from "next/server";
import { referrerVerifyCodeSchema } from "@/modules/referrals/schemas/referrer-auth.schema";
import { verifyReferrerLoginCode } from "@/modules/referrals/services/referrer-auth.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

async function readJsonPayload(request: Request) {
  const raw = (await request.text()).replace(/^\uFEFF/, "");
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "auth_referrer_verify_code",
    limit: 10,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: false,
  });
  if (protection) return protection;

  const payload = await readJsonPayload(request);
  const parsed = referrerVerifyCodeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await verifyReferrerLoginCode(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not verify login code." }, { status: 400 });
  }
}
