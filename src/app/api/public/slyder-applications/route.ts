import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { publicSlyderApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { createPublicSlyderApplication } from "@/modules/onboarding/services/onboarding.service";
import {
  enqueueSlydeAppSync,
  processPendingSlydeAppSyncQueue,
} from "@/modules/onboarding/services/slyde-app-sync-queue.service";
import { shouldSyncToExternalSlydeApp } from "@/modules/onboarding/services/slyde-app-sync.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";

export async function POST(request: Request) {
  try {
    const protection = await protectPublicRoute(request, {
      routeKey: "public_slyder_applications",
      limit: 8,
      windowMs: 10 * 60 * 1000,
      requireTurnstile: true,
    });
    if (protection) return protection;

    const json = await request.json();
    const leadId = typeof json?.leadId === "string" ? json.leadId : "";
    if (!leadId) {
      return NextResponse.json({ error: "A SLYDE admin invite is required before submitting the full Slyder application." }, { status: 403 });
    }

    const lead = await findLeadById(leadId);
    if (!lead?.applicationInviteUnlocked) {
      return NextResponse.json({ error: "Your full Slyder application is not unlocked yet. Please wait for SLYDE to send your next step." }, { status: 403 });
    }

    const parsed = publicSlyderApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const headerStore = await headers();
    const result = await createPublicSlyderApplication(parsed.data, {
      ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
      userAgent: headerStore.get("user-agent") ?? undefined,
    });

    let syncStatus: "queued" | "queue_failed" | "skipped" = "skipped";
    if (shouldSyncToExternalSlydeApp()) {
      try {
        await enqueueSlydeAppSync(result.applicationId, parsed.data);
        void processPendingSlydeAppSyncQueue();
        syncStatus = "queued";
      } catch {
        syncStatus = "queue_failed";
      }
    }

    return NextResponse.json(
      {
        ok: true,
        applicationId: result.applicationId,
        applicationCode: result.applicationCode,
        applicationStatus: result.applicationStatus,
        submittedAt: result.submittedAt,
        linkedUserId: result.linkedUserId,
        linkedSlyderProfileId: result.linkedSlyderProfileId,
        appSync: {
          status: syncStatus,
        },
        workflow: {
          currentStage: "application_submitted",
          nextStage: "admin_review_queue",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/public/slyder-applications] submission failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "We could not submit your application right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
