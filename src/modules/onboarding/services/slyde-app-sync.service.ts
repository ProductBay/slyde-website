import { readFile } from "node:fs/promises";
import type { PublicSlyderApplicationInput } from "@/modules/onboarding/schemas/onboarding.schemas";
import { resolveUploadPath } from "@/server/uploads/storage";

export type SyncedSlydeAppApplication = {
  userId: string;
  slyderId: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  syncedAt: string;
};

export type SyncedSlydeAppReviewDecision = {
  email: string;
  decision: "approve" | "reject";
  note?: string;
  reviewerLabel?: string;
  responseStatus: number;
  syncedAt: string;
};

function getAppSyncConfig() {
  const baseUrl = process.env.SLYDE_APP_SYNC_BASE_URL || "http://localhost:3000";
  const secret = process.env.SLYDE_APP_SYNC_SECRET || "slyde-public-sync-dev-key";
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    secret,
  };
}

async function buildFileDataUrl(file: {
  fileUrl?: string;
  type?: string;
}) {
  if (!file.fileUrl?.startsWith("/uploads/")) {
    return undefined;
  }

  const relativePath = file.fileUrl.replace(/^\/uploads\//, "");
  const absolutePath = resolveUploadPath(relativePath.split("/"));
  const buffer = await readFile(absolutePath);
  const mimeType = file.type?.trim() || "application/octet-stream";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function withDocumentDataUrls(input: PublicSlyderApplicationInput) {
  const documents = await Promise.all(
    Object.entries(input.documents).map(async ([key, files]) => [
      key,
      await Promise.all(
        files.map(async (file) => {
          try {
            return {
              ...file,
              fileDataUrl: await buildFileDataUrl(file),
            };
          } catch (error) {
            console.warn("[slyde-app-sync] unable to build fileDataUrl for document", {
              fileUrl: file.fileUrl,
              storageKey: file.storageKey,
              error: error instanceof Error ? error.message : "Unknown fileDataUrl build failure",
            });

            return file;
          }
        }),
      ),
    ]),
  );

  return {
    ...input,
    documents: Object.fromEntries(documents) as PublicSlyderApplicationInput["documents"],
  };
}

export async function syncPublicSlyderApplicationToSlydeApp(input: PublicSlyderApplicationInput) {
  const config = getAppSyncConfig();
  const payload = await withDocumentDataUrls(input);

  console.info("[slyde-app-sync] public application sync starting", {
    email: input.email,
    documentCounts: Object.fromEntries(Object.entries(payload.documents).map(([key, files]) => [key, files.length])),
  });

  const response = await fetch(`${config.baseUrl}/api/internal/public-slyder-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-slyde-integration-key": config.secret,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as
    | {
        userId?: string;
        slyderId?: string;
        status?: SyncedSlydeAppApplication["status"];
        syncedAt?: string;
        error?: string;
      }
    | null;

  if (!response.ok || !json?.userId || !json?.slyderId || !json?.status || !json?.syncedAt) {
    throw new Error(json?.error || "Unable to sync the application into the SLYDE app approval queue.");
  }

  console.info("[slyde-app-sync] public application sync succeeded", {
    email: input.email,
    responseStatus: response.status,
    syncedAt: json.syncedAt,
  });

  return {
    userId: json.userId,
    slyderId: json.slyderId,
    status: json.status,
    syncedAt: json.syncedAt,
  } satisfies SyncedSlydeAppApplication;
}

export async function syncPublicSlyderReviewDecisionToSlydeApp(input: {
  email: string;
  decision: "approve" | "reject";
  note?: string;
  reviewerLabel?: string;
}) {
  const config = getAppSyncConfig();
  const payload = {
    email: input.email,
    decision: input.decision,
    note: input.note,
    reviewerLabel: input.reviewerLabel,
  };

  console.info("[slyde-app-sync] review decision sync starting", {
    email: payload.email,
    decision: payload.decision,
    reviewerLabel: payload.reviewerLabel,
  });

  const response = await fetch(`${config.baseUrl}/api/internal/public-slyder-applications/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-slyde-integration-key": config.secret,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    console.error("[slyde-app-sync] review decision sync failed", {
      email: payload.email,
      decision: payload.decision,
      responseStatus: response.status,
      error: json?.error || "Unknown sync failure",
    });
    throw new Error(json?.error || `Unable to sync the ${payload.decision} review decision into the SLYDE app.`);
  }

  const syncedAt = new Date().toISOString();
  console.info("[slyde-app-sync] review decision sync succeeded", {
    email: payload.email,
    decision: payload.decision,
    responseStatus: response.status,
    syncedAt,
  });

  return {
    email: payload.email,
    decision: payload.decision,
    note: payload.note,
    reviewerLabel: payload.reviewerLabel,
    responseStatus: response.status,
    syncedAt,
  } satisfies SyncedSlydeAppReviewDecision;
}
