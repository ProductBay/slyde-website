import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { residentialIntakeSchema } from "@/modules/residential-intake/schemas/residential-intake.schemas";
import { submitResidentialIntake } from "@/modules/residential-intake/services/residential-intake.service";
import { processPendingHandoffJobs, shouldHandoff } from "@/modules/residential-intake/services/residential-handoff.service";
import { getResidentialKycStatus } from "@/modules/residential-intake/services/residential-kyc.service";
import { getSessionContext } from "@/server/auth/session";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  try {
    const protection = await protectPublicRoute(request, {
      routeKey: "public_residential_intake",
      limit: 5,
      windowMs: 15 * 60 * 1000,
      requireTurnstile: true,
    });
    if (protection) return protection;

    const json = await request.json();
    const parsed = residentialIntakeSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const session = await getSessionContext();
    if (!session?.user?.isEnabled) {
      return NextResponse.json({ error: "You must be signed in to submit a residential dispatch request." }, { status: 401 });
    }

    const kyc = await getResidentialKycStatus(session.user.id);
    if (kyc.status !== "approved") {
      return NextResponse.json(
        {
          error: "Residential account verification is required before submitting dispatch requests.",
          kycStatus: kyc.status,
        },
        { status: 403 },
      );
    }

    const headerStore = await headers();
    const ipAddress = headerStore.get("x-forwarded-for") ?? undefined;
    const userAgent = headerStore.get("user-agent") ?? undefined;
    const sourceCampaign = (request as Request & { nextUrl?: URL }).nextUrl?.searchParams.get("utm_campaign") ?? undefined;

    const result = await submitResidentialIntake(
      parsed.data,
      { ipAddress, userAgent, sourceCampaign },
      {
        userId: session.user.id,
        fullName: session.user.fullName,
        phone: session.user.phone,
        email: session.user.email,
      },
    );

    if (shouldHandoff()) {
      void processPendingHandoffJobs();
    }

    return NextResponse.json({
      ok: true,
      referenceCode: result.referenceCode,
      leadId: result.leadId,
      submittedAt: result.submittedAt,
      message: "Your dispatch request has been received. We will be in touch shortly.",
    });
  } catch (err) {
    console.error("[residential-intake] POST error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
