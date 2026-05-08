import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublicSlyderApplicationInput } from "@/modules/onboarding/schemas/onboarding.schemas";
import {
  shouldSyncToExternalSlydeApp,
  syncPublicSlyderApplicationToSlydeApp,
  syncPublicSlyderReviewDecisionToSlydeApp,
  syncSlydeAppLifecycleEvent,
  type SlydeAppLifecycleEventPayload,
  type SyncedSlydeAppApplication,
  type SyncedSlydeAppReviewDecision,
} from "@/modules/onboarding/services/slyde-app-sync.service";
import { linkPublicSlyderApplicationToSyncedApp } from "@/modules/onboarding/services/onboarding.service";
import { getDataDirectory } from "@/server/storage-paths";

type AppSyncQueueStatus = "queued" | "processing" | "synced" | "retrying" | "failed";

type AppSyncQueueItemType = "application_submit" | "review_decision" | "lifecycle_event";

type ReviewDecisionQueuePayload = {
  applicationId: string;
  email: string;
  decision: "approve" | "reject";
  note?: string;
  reviewerLabel?: string;
};

type AppSyncQueueItem = {
  id: string;
  type?: AppSyncQueueItemType;
  applicationId: string;
  idempotencyKey?: string;
  payload: PublicSlyderApplicationInput | ReviewDecisionQueuePayload | SlydeAppLifecycleEventPayload;
  status: AppSyncQueueStatus;
  retryCount: number;
  nextAttemptAt: string;
  lastAttemptAt?: string;
  lastError?: string;
  syncedAt?: string;
  syncResult?: SyncedSlydeAppApplication | SyncedSlydeAppReviewDecision | Awaited<ReturnType<typeof syncSlydeAppLifecycleEvent>>;
  createdAt: string;
  updatedAt: string;
};

const QUEUE_DIRECTORY = getDataDirectory();
const QUEUE_FILE = path.join(QUEUE_DIRECTORY, "slyde-app-sync-queue.json");
const MAX_RETRIES = 8;

let queueWriteLock: Promise<void> = Promise.resolve();
let processingQueue = false;

function nowIso() {
  return new Date().toISOString();
}

function retryDelayMs(retryCount: number) {
  const schedule = [30_000, 60_000, 5 * 60_000, 15 * 60_000, 30 * 60_000, 60 * 60_000];
  return schedule[Math.min(retryCount, schedule.length - 1)];
}

async function ensureQueueFile() {
  await mkdir(QUEUE_DIRECTORY, { recursive: true });

  try {
    await readFile(QUEUE_FILE, "utf8");
  } catch {
    await writeFile(QUEUE_FILE, "[]", "utf8");
  }
}

async function readQueue(): Promise<AppSyncQueueItem[]> {
  await ensureQueueFile();
  const raw = await readFile(QUEUE_FILE, "utf8");
  const parsed = JSON.parse(raw) as AppSyncQueueItem[];
  return parsed.map((item) => ({
    ...item,
    type: item.type ?? "application_submit",
    idempotencyKey: item.idempotencyKey ?? `application_submit:${item.applicationId}`,
  }));
}

async function writeQueue(items: AppSyncQueueItem[]) {
  await ensureQueueFile();
  const tempFile = `${QUEUE_FILE}.tmp`;
  await writeFile(tempFile, JSON.stringify(items, null, 2), "utf8");
  await rename(tempFile, QUEUE_FILE);
}

async function withQueueTransaction<T>(mutator: (items: AppSyncQueueItem[]) => Promise<T> | T): Promise<T> {
  const run = async () => {
    const items = await readQueue();
    const result = await mutator(items);
    await writeQueue(items);
    return result;
  };

  const resultPromise = queueWriteLock.then(run, run);
  queueWriteLock = resultPromise.then(() => undefined, () => undefined);
  return resultPromise;
}

export async function enqueueSlydeAppSync(applicationId: string, payload: PublicSlyderApplicationInput) {
  if (!shouldSyncToExternalSlydeApp()) {
    console.info("[slyde-app-sync-queue] application submit sync skipped because integration is disabled", {
      applicationId,
    });
    return null;
  }

  return withQueueTransaction(async (items) => {
    const idempotencyKey = `application_submit:${applicationId}`;
    const existing = items.find((item) => item.idempotencyKey === idempotencyKey && item.status !== "synced");
    if (existing) {
      existing.payload = payload;
      existing.type = "application_submit";
      existing.idempotencyKey = idempotencyKey;
      existing.status = existing.retryCount > 0 ? "retrying" : "queued";
      existing.nextAttemptAt = nowIso();
      existing.updatedAt = nowIso();
      existing.lastError = undefined;
      return existing;
    }

    const queued: AppSyncQueueItem = {
      id: crypto.randomUUID(),
      type: "application_submit",
      applicationId,
      idempotencyKey,
      payload,
      status: "queued",
      retryCount: 0,
      nextAttemptAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    items.push(queued);
    console.info("[slyde-app-sync-queue] application submit sync queued", {
      queueItemId: queued.id,
      applicationId,
      idempotencyKey,
    });
    return queued;
  });
}

export async function enqueueSlydeAppReviewDecisionSync(payload: ReviewDecisionQueuePayload) {
  if (!shouldSyncToExternalSlydeApp()) {
    console.info("[slyde-app-sync-queue] review decision sync skipped because integration is disabled", {
      applicationId: payload.applicationId,
      decision: payload.decision,
    });
    return null;
  }

  return withQueueTransaction(async (items) => {
    const idempotencyKey = `review_decision:${payload.applicationId}:${payload.decision}`;
    const existing = items.find((item) => item.idempotencyKey === idempotencyKey);
    if (existing) {
      if (existing.status === "synced") return existing;
      existing.type = "review_decision";
      existing.payload = payload;
      existing.status = existing.retryCount > 0 ? "retrying" : "queued";
      existing.nextAttemptAt = nowIso();
      existing.updatedAt = nowIso();
      existing.lastError = undefined;
      return existing;
    }

    const queued: AppSyncQueueItem = {
      id: crypto.randomUUID(),
      type: "review_decision",
      applicationId: payload.applicationId,
      idempotencyKey,
      payload,
      status: "queued",
      retryCount: 0,
      nextAttemptAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    items.push(queued);
    console.info("[slyde-app-sync-queue] review decision sync queued", {
      queueItemId: queued.id,
      applicationId: payload.applicationId,
      decision: payload.decision,
      idempotencyKey,
    });
    return queued;
  });
}

export async function enqueueSlydeAppLifecycleSync(payload: SlydeAppLifecycleEventPayload) {
  if (!shouldSyncToExternalSlydeApp()) {
    console.info("[slyde-app-sync-queue] lifecycle sync skipped because integration is disabled", {
      applicationId: payload.applicationId,
      eventType: payload.eventType,
    });
    return null;
  }

  return withQueueTransaction(async (items) => {
    const existing = items.find((item) => item.idempotencyKey === payload.idempotencyKey);
    if (existing) {
      if (existing.status === "synced") return existing;
      existing.type = "lifecycle_event";
      existing.payload = payload;
      existing.status = existing.retryCount > 0 ? "retrying" : "queued";
      existing.nextAttemptAt = nowIso();
      existing.updatedAt = nowIso();
      existing.lastError = undefined;
      return existing;
    }

    const queued: AppSyncQueueItem = {
      id: crypto.randomUUID(),
      type: "lifecycle_event",
      applicationId: payload.applicationId,
      idempotencyKey: payload.idempotencyKey,
      payload,
      status: "queued",
      retryCount: 0,
      nextAttemptAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    items.push(queued);
    console.info("[slyde-app-sync-queue] lifecycle sync queued", {
      queueItemId: queued.id,
      applicationId: payload.applicationId,
      eventType: payload.eventType,
      idempotencyKey: payload.idempotencyKey,
    });
    return queued;
  });
}

export async function enqueueSlydeAppLifecycleSyncEvents(payloads: SlydeAppLifecycleEventPayload[]) {
  const queued = [];
  for (const payload of payloads) {
    const item = await enqueueSlydeAppLifecycleSync(payload);
    if (item) queued.push(item);
  }
  return queued;
}

async function markQueueItem(
  id: string,
  mutate: (item: AppSyncQueueItem) => void,
) {
  await withQueueTransaction(async (items) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    mutate(item);
    item.updatedAt = nowIso();
  });
}

async function getDueQueueItems() {
  const items = await readQueue();
  const now = Date.now();
  const staleProcessingCutoff = now - 10 * 60_000;
  return items.filter(
    (item) =>
      ((item.status === "queued" || item.status === "retrying") &&
        new Date(item.nextAttemptAt).getTime() <= now) ||
      (item.status === "processing" &&
        Boolean(item.lastAttemptAt) &&
        new Date(item.lastAttemptAt as string).getTime() <= staleProcessingCutoff),
  );
}

function queueItemType(item: AppSyncQueueItem): AppSyncQueueItemType {
  return item.type ?? "application_submit";
}

async function processQueueItem(item: AppSyncQueueItem) {
  await markQueueItem(item.id, (entry) => {
    entry.status = "processing";
    entry.lastAttemptAt = nowIso();
  });

  try {
    const type = queueItemType(item);
    let syncResult: AppSyncQueueItem["syncResult"];

    if (type === "application_submit") {
      const appSyncResult = await syncPublicSlyderApplicationToSlydeApp(item.payload as PublicSlyderApplicationInput);
      await linkPublicSlyderApplicationToSyncedApp(item.applicationId, appSyncResult);
      syncResult = appSyncResult;
    } else if (type === "review_decision") {
      const payload = item.payload as ReviewDecisionQueuePayload;
      syncResult = await syncPublicSlyderReviewDecisionToSlydeApp({
        email: payload.email,
        decision: payload.decision,
        note: payload.note,
        reviewerLabel: payload.reviewerLabel,
      });
    } else {
      syncResult = await syncSlydeAppLifecycleEvent(item.payload as SlydeAppLifecycleEventPayload);
    }

    await markQueueItem(item.id, (entry) => {
      entry.status = "synced";
      entry.syncedAt = nowIso();
      entry.syncResult = syncResult;
      entry.lastError = undefined;
    });
  } catch (error) {
    await markQueueItem(item.id, (entry) => {
      entry.retryCount += 1;
      entry.lastError = error instanceof Error ? error.message : "Unknown sync failure";
      if (entry.retryCount >= MAX_RETRIES) {
        entry.status = "failed";
        entry.nextAttemptAt = nowIso();
        return;
      }

      entry.status = "retrying";
      entry.nextAttemptAt = new Date(Date.now() + retryDelayMs(entry.retryCount)).toISOString();
    });
  }
}

export async function processPendingSlydeAppSyncQueue(options: { batchSize?: number } = {}) {
  if (!shouldSyncToExternalSlydeApp()) {
    console.info("[slyde-app-sync-queue] processing skipped because integration is disabled");
    return { processed: 0, synced: 0, failed: 0, retried: 0, skipped: true };
  }

  if (processingQueue) return { processed: 0, synced: 0, failed: 0, retried: 0, skipped: true, reason: "already_processing" };
  processingQueue = true;

  try {
    const dueItems = (await getDueQueueItems()).slice(0, options.batchSize ?? 25);
    let synced = 0;
    let failed = 0;
    let retried = 0;
    for (const item of dueItems) {
      await processQueueItem(item);
      const [latest] = (await readQueue()).filter((entry) => entry.id === item.id);
      if (latest?.status === "synced") synced += 1;
      if (latest?.status === "failed") failed += 1;
      if (latest?.status === "retrying") retried += 1;
    }
    return { processed: dueItems.length, synced, failed, retried, skipped: false };
  } finally {
    processingQueue = false;
  }
}

export async function getSlydeAppSyncQueueSummary() {
  const items = await readQueue();
  const byStatus = items.reduce<Record<AppSyncQueueStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { queued: 0, processing: 0, synced: 0, retrying: 0, failed: 0 },
  );
  const byType = items.reduce<Record<AppSyncQueueItemType, number>>(
    (acc, item) => {
      acc[queueItemType(item)] += 1;
      return acc;
    },
    { application_submit: 0, review_decision: 0, lifecycle_event: 0 },
  );
  const dueCount = (await getDueQueueItems()).length;
  const oldestPending = items
    .filter((item) => item.status === "queued" || item.status === "retrying" || item.status === "failed")
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))[0];

  return {
    queueFile: QUEUE_FILE,
    total: items.length,
    byStatus,
    byType,
    dueCount,
    oldestPendingAt: oldestPending?.createdAt,
    maxRetries: MAX_RETRIES,
  };
}
