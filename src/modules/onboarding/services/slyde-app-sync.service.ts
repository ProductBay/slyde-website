import { readFile } from "node:fs/promises";
import type { PublicSlyderApplicationInput } from "@/modules/onboarding/schemas/onboarding.schemas";
import { resolveUploadPath } from "@/server/uploads/storage";
import type { OnboardingStore, SetupStatusResponse, SlyderApplication, SlyderProfile, StoredUser } from "@/types/backend/onboarding";

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

export type SlydeAppActivationInviteResult = {
  email: string;
  userId: string;
  slyderId: string;
  expiresAt: string;
  delivery: "sent";
  responseStatus: number;
  sentAt: string;
};

export type SlydeAppLifecycleEventType =
  | "slyder_activation_completed"
  | "slyder_legal_accepted"
  | "slyder_setup_updated"
  | "slyder_readiness_updated"
  | "slyder_onboarding_state_changed"
  | "slyder_onboarding_completed";

export type SlydeAppLifecycleEventPayload = {
  eventId: string;
  eventType: SlydeAppLifecycleEventType;
  occurredAt: string;
  sourceSystem: "slyde_website";
  correlationId: string;
  idempotencyKey: string;
  applicationId: string;
  linkedUserId?: string;
  linkedSlyderProfileId?: string;
  email?: string;
  accountStatus: string;
  onboardingStatus: string;
  readinessStatus: string;
  canGoOnline: boolean;
  canReceiveOrders: boolean;
  metadata?: Record<string, unknown>;
};

const DEV_SYNC_SECRET = "slyde-public-sync-dev-key";
const DEFAULT_DEV_SYNC_BASE_URL = "http://localhost:3000";

function isDevelopmentRuntime() {
  return process.env.NODE_ENV !== "production";
}

function getAppSyncConfig() {
  const configuredBaseUrl = process.env.SLYDE_APP_SYNC_BASE_URL?.trim();
  const configuredSecret = process.env.SLYDE_APP_SYNC_SECRET?.trim();
  const baseUrl = configuredBaseUrl || (isDevelopmentRuntime() ? DEFAULT_DEV_SYNC_BASE_URL : "");
  const secret = configuredSecret || (isDevelopmentRuntime() ? DEV_SYNC_SECRET : "");
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    secret,
    configuredBaseUrl,
    configuredSecret,
  };
}

function originFromUrl(value?: string) {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

export function shouldSyncToExternalSlydeApp() {
  return getSlydeAppSyncReadiness().enabled;
}

function isLocalOrigin(origin?: string) {
  return Boolean(origin && /localhost|127\.0\.0\.1|\[::1\]/i.test(origin));
}

export function getSlydeAppSyncReadiness() {
  const config = getAppSyncConfig();
  const appSyncOrigin = originFromUrl(config.baseUrl);
  const websiteOrigin = originFromUrl(process.env.SLYDE_WEBSITE_BASE_URL);
  const reasons: string[] = [];
  const warnings: string[] = [];
  const production = process.env.NODE_ENV === "production";

  if (!appSyncOrigin) {
    reasons.push("SLYDE_APP_SYNC_BASE_URL is missing or invalid.");
  }
  if (!config.secret) {
    reasons.push("SLYDE_APP_SYNC_SECRET is missing.");
  }
  if (appSyncOrigin && websiteOrigin && appSyncOrigin === websiteOrigin) {
    reasons.push("SLYDE_APP_SYNC_BASE_URL points to this website, so outbound app sync is disabled.");
  }
  if (production && !config.configuredBaseUrl) {
    reasons.push("SLYDE_APP_SYNC_BASE_URL must be explicitly configured in production.");
  }
  if (production && !config.configuredSecret) {
    reasons.push("SLYDE_APP_SYNC_SECRET must be explicitly configured in production.");
  }
  if (production && config.secret === DEV_SYNC_SECRET) {
    reasons.push("SLYDE_APP_SYNC_SECRET is still the development default.");
  }
  if (production && isLocalOrigin(appSyncOrigin)) {
    reasons.push("SLYDE_APP_SYNC_BASE_URL points to a local address in production.");
  }
  if (!production && !config.configuredBaseUrl) {
    warnings.push("Using development default SLYDE_APP_SYNC_BASE_URL.");
  }
  if (!production && !config.configuredSecret) {
    warnings.push("Using development default SLYDE_APP_SYNC_SECRET.");
  }

  return {
    enabled: reasons.length === 0,
    baseUrl: config.baseUrl || undefined,
    baseUrlConfigured: Boolean(config.configuredBaseUrl),
    secretConfigured: Boolean(config.configuredSecret),
    usingDevelopmentDefaults: !production && (!config.configuredBaseUrl || !config.configuredSecret),
    reasons,
    warnings,
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
  if (!shouldSyncToExternalSlydeApp()) {
    throw new Error("SLYDE app sync is not enabled or configured.");
  }
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
  if (!shouldSyncToExternalSlydeApp()) {
    throw new Error("SLYDE app review sync is not enabled or configured.");
  }
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

export async function sendSlydeAppActivationInvite(input: { email: string }) {
  const config = getAppSyncConfig();
  if (!shouldSyncToExternalSlydeApp()) {
    throw new Error("SLYDE app sync is not enabled or configured.");
  }
  const payload = {
    email: input.email,
  };

  console.info("[slyde-app-sync] activation invite starting", {
    email: payload.email,
  });

  const response = await fetch(`${config.baseUrl}/api/internal/public-slyder-applications/activation-invite`, {
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
        email?: string;
        userId?: string;
        slyderId?: string;
        expiresAt?: string;
        delivery?: "sent";
        error?: string;
      }
    | null;

  if (
    !response.ok ||
    !json?.email ||
    !json?.userId ||
    !json?.slyderId ||
    !json?.expiresAt ||
    json.delivery !== "sent"
  ) {
    console.error("[slyde-app-sync] activation invite failed", {
      email: payload.email,
      responseStatus: response.status,
      error: json?.error || "Unknown activation invite failure",
    });
    throw new Error(json?.error || "Unable to send the SLYDE app activation email.");
  }

  const sentAt = new Date().toISOString();
  console.info("[slyde-app-sync] activation invite succeeded", {
    email: payload.email,
    responseStatus: response.status,
    sentAt,
  });

  return {
    email: json.email,
    userId: json.userId,
    slyderId: json.slyderId,
    expiresAt: json.expiresAt,
    delivery: json.delivery,
    responseStatus: response.status,
    sentAt,
  } satisfies SlydeAppActivationInviteResult;
}

export async function syncSlydeAppLifecycleEvent(input: SlydeAppLifecycleEventPayload) {
  const config = getAppSyncConfig();
  if (!shouldSyncToExternalSlydeApp()) {
    throw new Error("SLYDE app lifecycle sync is not enabled or configured.");
  }

  console.info("[slyde-app-sync] lifecycle event sync starting", {
    eventId: input.eventId,
    eventType: input.eventType,
    applicationId: input.applicationId,
    linkedUserId: input.linkedUserId,
    linkedSlyderProfileId: input.linkedSlyderProfileId,
  });

  const response = await fetch(`${config.baseUrl}/api/internal/slyder-lifecycle-events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-slyde-integration-key": config.secret,
      "idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    console.error("[slyde-app-sync] lifecycle event sync failed", {
      eventId: input.eventId,
      eventType: input.eventType,
      applicationId: input.applicationId,
      responseStatus: response.status,
      error: json?.error || "Unknown sync failure",
    });
    throw new Error(json?.error || `Unable to sync ${input.eventType} lifecycle event into the SLYDE app.`);
  }

  const syncedAt = new Date().toISOString();
  console.info("[slyde-app-sync] lifecycle event sync succeeded", {
    eventId: input.eventId,
    eventType: input.eventType,
    applicationId: input.applicationId,
    responseStatus: response.status,
    syncedAt,
  });

  return {
    eventId: input.eventId,
    eventType: input.eventType,
    responseStatus: response.status,
    syncedAt,
  };
}

function lifecycleIdempotencyKey(input: {
  eventType: SlydeAppLifecycleEventType;
  applicationId: string;
  userId?: string;
  profileId?: string;
  status?: SetupStatusResponse;
  metadata?: Record<string, unknown>;
}) {
  const statusKey = input.status
    ? [
        input.status.accountStatus,
        input.status.onboardingStatus,
        input.status.readinessStatus,
        input.status.canGoOnline,
        input.status.canReceiveOrders,
      ].join(":")
    : "status-unavailable";
  const metadataKey = input.metadata ? JSON.stringify(input.metadata) : "none";
  return [
    "slyde_website",
    input.eventType,
    input.applicationId,
    input.userId || "no-user",
    input.profileId || "no-profile",
    statusKey,
    metadataKey,
  ].join(":");
}

export function buildSlydeAppLifecycleEventPayload(input: {
  store: OnboardingStore;
  eventType: SlydeAppLifecycleEventType;
  applicationId: string;
  userId?: string;
  profileId?: string;
  status: SetupStatusResponse;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
}) {
  const application = input.store.applications.find((item) => item.id === input.applicationId);
  const profile =
    (input.profileId ? input.store.slyderProfiles.find((item) => item.id === input.profileId) : undefined) ??
    input.store.slyderProfiles.find((item) => item.applicationId === input.applicationId);
  const user =
    (input.userId ? input.store.users.find((item) => item.id === input.userId) : undefined) ??
    (profile ? input.store.users.find((item) => item.id === profile.userId) : undefined);

  if (!application) {
    throw new Error("Application not found for lifecycle sync payload.");
  }

  return buildSlydeAppLifecycleEventPayloadFromRecords({
    eventType: input.eventType,
    application,
    profile,
    user,
    status: input.status,
    occurredAt: input.occurredAt,
    metadata: input.metadata,
  });
}

export function buildSlydeAppLifecycleEventPayloadFromRecords(input: {
  eventType: SlydeAppLifecycleEventType;
  application: SlyderApplication;
  profile?: SlyderProfile;
  user?: StoredUser;
  status: SetupStatusResponse;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
}) {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const linkedUserId = input.user?.id ?? input.application.linkedUserId;
  const linkedSlyderProfileId = input.profile?.id ?? input.application.linkedSlyderProfileId;
  const idempotencyKey = lifecycleIdempotencyKey({
    eventType: input.eventType,
    applicationId: input.application.id,
    userId: linkedUserId,
    profileId: linkedSlyderProfileId,
    status: input.status,
    metadata: input.metadata,
  });

  return {
    eventId: crypto.randomUUID(),
    eventType: input.eventType,
    occurredAt,
    sourceSystem: "slyde_website",
    correlationId: input.application.id,
    idempotencyKey,
    applicationId: input.application.id,
    linkedUserId,
    linkedSlyderProfileId,
    email: input.user?.email ?? input.profile?.email ?? input.application.email,
    accountStatus: input.status.accountStatus,
    onboardingStatus: input.status.onboardingStatus,
    readinessStatus: input.status.readinessStatus,
    canGoOnline: input.status.canGoOnline,
    canReceiveOrders: input.status.canReceiveOrders,
    metadata: input.metadata,
  } satisfies SlydeAppLifecycleEventPayload;
}
