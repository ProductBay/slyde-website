import { NextResponse } from "next/server";
import { requireSlyderContext } from "@/server/auth/guards";
import { createSlyderReferralSchema } from "@/modules/referrals/schemas/slyder-referral.schema";
import { createSlyderReferralForSlyder, getOrCreateSlyderReferralCode } from "@/modules/referrals/services/slyder-referral.service";
import { listSlyderReferralsByReferrerSlyderId } from "@/modules/referrals/repositories/slyder-referral.repository";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const ctx = await requireSlyderContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const referrals = await listSlyderReferralsByReferrerSlyderId(ctx.user.id);
    return NextResponse.json({ ok: true, referrals });
  } catch (error) {
    console.error("[api/slyder/referrals] GET failed", { error });
    return NextResponse.json({ error: "Could not load referrals." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireSlyderContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const json = await request.json();
    const parsed = createSlyderReferralSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Resolve the Slyder's phone from their profile for fraud checks
    const profile = await prisma.slyderProfile.findUnique({
      where: { userId: ctx.user.id },
      include: { application: true },
    });
    const slyderWhatsapp = profile?.application?.phone ?? ctx.user.email ?? ctx.user.id;

    const result = await createSlyderReferralForSlyder(
      ctx.user.id,
      ctx.user.fullName,
      slyderWhatsapp,
      parsed.data,
    );

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create referral.";
    console.error("[api/slyder/referrals] POST failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
