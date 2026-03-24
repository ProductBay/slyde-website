import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { publicSlyderApplicationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { createPublicSlyderApplication } from "@/modules/onboarding/services/onboarding.service";
import {
  enqueueSlydeAppSync,
  processPendingSlydeAppSyncQueue,
} from "@/modules/onboarding/services/slyde-app-sync-queue.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_slyder_applications",
    limit: 8,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = publicSlyderApplicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const headerStore = await headers();
  const result = await createPublicSlyderApplication(parsed.data, {
    ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  });

  let syncStatus: "queued" | "queue_failed" = "queued";
  try {
    await enqueueSlydeAppSync(result.applicationId, parsed.data);
    void processPendingSlydeAppSyncQueue();
  } catch {
    syncStatus = "queue_failed";
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
}
