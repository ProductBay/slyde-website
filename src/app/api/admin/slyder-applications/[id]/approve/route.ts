import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { approveApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { approveApplication } from "@/modules/onboarding/services/onboarding.service";
import { shouldSyncToExternalSlydeApp } from "@/modules/onboarding/services/slyde-app-sync.service";
import {
  enqueueSlydeAppReviewDecisionSync,
  processPendingSlydeAppSyncQueue,
} from "@/modules/onboarding/services/slyde-app-sync-queue.service";

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

    if (!shouldSyncToExternalSlydeApp()) {
      return NextResponse.json({
        ok: true,
        result,
        appSync: { status: "skipped" },
        message: `Application approved on slydenetwork.com for ${result.email}.`,
      });
    }

    try {
      const queued = await enqueueSlydeAppReviewDecisionSync({
        applicationId: result.applicationId,
        email: result.email,
        decision: "approve",
        note: parsed.data.reviewNotes,
        reviewerLabel: adminContext.user.fullName,
      });
      const processing = await processPendingSlydeAppSyncQueue({ batchSize: 10 });
      const synced = queued?.status === "synced" || processing.synced > 0;

      return NextResponse.json({
        ok: true,
        result,
        appSync: {
          status: synced ? "synced" : "queued",
          queueItemId: queued?.id,
          processing,
        },
        message:
          synced
            ? `Application approved and synced to the SLYDE app for ${result.email}.`
            : `Application approved locally and queued for SLYDE app sync for ${result.email}.`,
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
        appSync: { status: "queue_failed", error: syncMessage },
        message: `Application approved locally, but SLYDE app sync could not be queued for ${result.email}. Check logs and retry.`,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
