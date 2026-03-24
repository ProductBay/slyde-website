import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublicSlyderApplicationInput } from "@/modules/onboarding/schemas/onboarding.schemas";
import { syncPublicSlyderApplicationToSlydeApp, type SyncedSlydeAppApplication } from "@/modules/onboarding/services/slyde-app-sync.service";
import { linkPublicSlyderApplicationToSyncedApp } from "@/modules/onboarding/services/onboarding.service";

type AppSyncQueueStatus = "queued" | "processing" | "synced" | "retrying" | "failed";

type AppSyncQueueItem = {
  id: string;
  applicationId: string;
  payload: PublicSlyderApplicationInput;
  status: AppSyncQueueStatus;
  retryCount: number;
  nextAttemptAt: string;
  lastAttemptAt?: string;
  lastError?: string;
  syncedAt?: string;
  syncResult?: SyncedSlydeAppApplication;
  createdAt: string;
  updatedAt: string;
};

const QUEUE_DIRECTORY = path.join(process.cwd(), ".data");
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
  return JSON.parse(raw) as AppSyncQueueItem[];
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
  return withQueueTransaction(async (items) => {
    const existing = items.find((item) => item.applicationId === applicationId && item.status !== "synced");
    if (existing) {
      existing.payload = payload;
      existing.status = existing.retryCount > 0 ? "retrying" : "queued";
      existing.nextAttemptAt = nowIso();
      existing.updatedAt = nowIso();
      existing.lastError = undefined;
      return existing;
    }

    const queued: AppSyncQueueItem = {
      id: crypto.randomUUID(),
      applicationId,
      payload,
      status: "queued",
      retryCount: 0,
      nextAttemptAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    items.push(queued);
    return queued;
  });
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
  return items.filter(
    (item) =>
      (item.status === "queued" || item.status === "retrying") &&
      new Date(item.nextAttemptAt).getTime() <= now,
  );
}

async function processQueueItem(item: AppSyncQueueItem) {
  await markQueueItem(item.id, (entry) => {
    entry.status = "processing";
    entry.lastAttemptAt = nowIso();
  });

  try {
    const syncResult = await syncPublicSlyderApplicationToSlydeApp(item.payload);
    await linkPublicSlyderApplicationToSyncedApp(item.applicationId, syncResult);

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
        return;
      }

      entry.status = "retrying";
      entry.nextAttemptAt = new Date(Date.now() + retryDelayMs(entry.retryCount)).toISOString();
    });
  }
}

export async function processPendingSlydeAppSyncQueue() {
  if (processingQueue) return;
  processingQueue = true;

  try {
    const dueItems = await getDueQueueItems();
    for (const item of dueItems) {
      await processQueueItem(item);
    }
  } finally {
    processingQueue = false;
  }
}
