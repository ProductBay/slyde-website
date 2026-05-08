import { NextResponse } from "next/server";
import { processPendingSlydeAppSyncQueue } from "@/modules/onboarding/services/slyde-app-sync-queue.service";
import { getSlydeAppSyncReadiness } from "@/modules/onboarding/services/slyde-app-sync.service";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.SLYDE_QUEUE_PROCESSOR_SECRET || process.env.CRON_SECRET;
  if (!configuredSecret && process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!configuredSecret) {
    return false;
  }

  const headerSecret = request.headers.get("x-slyde-processor-key");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return headerSecret === configuredSecret || bearer === configuredSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readiness = getSlydeAppSyncReadiness();
  if (!readiness.enabled) {
    return NextResponse.json(
      {
        ok: false,
        processed: 0,
        skipped: true,
        integration: readiness,
      },
      { status: 200 },
    );
  }

  const batchSizeHeader = request.headers.get("x-slyde-sync-batch-size");
  const parsedBatchSize = batchSizeHeader ? Number.parseInt(batchSizeHeader, 10) : undefined;
  const batchSize = parsedBatchSize && parsedBatchSize > 0 ? Math.min(parsedBatchSize, 100) : 25;
  const result = await processPendingSlydeAppSyncQueue({ batchSize });

  return NextResponse.json({
    ok: true,
    ...result,
    integration: {
      enabled: readiness.enabled,
      baseUrlConfigured: readiness.baseUrlConfigured,
      secretConfigured: readiness.secretConfigured,
      warnings: readiness.warnings,
    },
  });
}

export async function GET(request: Request) {
  return POST(request);
}
