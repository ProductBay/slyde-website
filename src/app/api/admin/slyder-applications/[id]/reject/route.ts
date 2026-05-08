import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { rejectApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { rejectApplication } from "@/modules/onboarding/services/onboarding.service";
import { shouldSyncToExternalSlydeApp } from "@/modules/onboarding/services/slyde-app-sync.service";
import {
  enqueueSlydeAppReviewDecisionSync,
  processPendingSlydeAppSyncQueue,
} from "@/modules/onboarding/services/slyde-app-sync-queue.service";

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

    if (!shouldSyncToExternalSlydeApp()) {
      return NextResponse.json({
        ok: true,
        application: result,
        appSync: { status: "skipped" },
        message: `Application rejected on slydenetwork.com for ${result.email}.`,
      });
    }

    try {
      const queued = await enqueueSlydeAppReviewDecisionSync({
        applicationId: id,
        email: result.email,
        decision: "reject",
        note: parsed.data.reason,
        reviewerLabel: adminContext.user.fullName,
      });
      const processing = await processPendingSlydeAppSyncQueue({ batchSize: 10 });
      const synced = queued?.status === "synced" || processing.synced > 0;

      return NextResponse.json({
        ok: true,
        application: result,
        appSync: {
          status: synced ? "synced" : "queued",
          queueItemId: queued?.id,
          processing,
        },
        message:
          synced
            ? `Application rejected and synced to the SLYDE app for ${result.email}.`
            : `Application rejected locally and queued for SLYDE app sync for ${result.email}.`,
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
        appSync: { status: "queue_failed", error: syncMessage },
        message: `Application rejected locally, but SLYDE app sync could not be queued for ${result.email}. Check logs and retry.`,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
