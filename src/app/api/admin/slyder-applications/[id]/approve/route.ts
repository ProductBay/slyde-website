import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { approveApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { approveApplication } from "@/modules/onboarding/services/onboarding.service";
import { syncPublicSlyderReviewDecisionToSlydeApp } from "@/modules/onboarding/services/slyde-app-sync.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = approveApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await approveApplication(id, parsed.data, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    });

    try {
      const appSync = await syncPublicSlyderReviewDecisionToSlydeApp({
        email: result.email,
        decision: "approve",
        note: parsed.data.reviewNotes,
        reviewerLabel: adminContext.user.fullName,
      });

      return NextResponse.json({
        ok: true,
        result,
        appSync: { status: "synced", ...appSync },
        message: `Application approved and synced to the SLYDE app for ${result.email}.`,
      });
    } catch (syncError) {
      const syncMessage = syncError instanceof Error ? syncError.message : "Unknown SLYDE app sync failure";
      console.error("[slyde-app-sync] approve review sync failed", {
        applicationId: id,
        email: result.email,
        error: syncMessage,
      });

      return NextResponse.json({
        ok: true,
        result,
        appSync: { status: "failed", error: syncMessage },
        message: `Application approved locally, but SLYDE app sync failed for ${result.email}. Check logs and retry.`,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
