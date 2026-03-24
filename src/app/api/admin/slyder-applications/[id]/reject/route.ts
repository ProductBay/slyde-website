import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { rejectApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { rejectApplication } from "@/modules/onboarding/services/onboarding.service";
import { syncPublicSlyderReviewDecisionToSlydeApp } from "@/modules/onboarding/services/slyde-app-sync.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = rejectApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await rejectApplication(id, parsed.data.reason, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    });

    try {
      const appSync = await syncPublicSlyderReviewDecisionToSlydeApp({
        email: result.email,
        decision: "reject",
        note: parsed.data.reason,
        reviewerLabel: adminContext.user.fullName,
      });

      return NextResponse.json({
        ok: true,
        application: result,
        appSync: { status: "synced", ...appSync },
        message: `Application rejected and synced to the SLYDE app for ${result.email}.`,
      });
    } catch (syncError) {
      const syncMessage = syncError instanceof Error ? syncError.message : "Unknown SLYDE app sync failure";
      console.error("[slyde-app-sync] reject review sync failed", {
        applicationId: id,
        email: result.email,
        error: syncMessage,
      });

      return NextResponse.json({
        ok: true,
        application: result,
        appSync: { status: "failed", error: syncMessage },
        message: `Application rejected locally, but SLYDE app sync failed for ${result.email}. Check logs and retry.`,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
