import { access, mkdir } from "node:fs/promises";
import { prisma } from "@/server/db/prisma";
import { isEmailConfigured, isSmsConfigured, isWhatsappConfigured } from "@/server/notifications/providers";
import { getPersistenceDriver } from "@/server/persistence/repository";
import { readStore } from "@/server/persistence/store";
import { getTurnstileConfig } from "@/server/security/turnstile";
import { getDataDirectory, getUploadsDirectory } from "@/server/storage-paths";

function isLocalLikeUrl(value: string | undefined) {
  if (!value) return true;
  return /localhost|127\.0\.0\.1/i.test(value);
}

export async function getSystemHealthSummary() {
  const persistenceDriver = getPersistenceDriver();
  const dataDirectory = getDataDirectory();
  const uploadsDirectory = getUploadsDirectory();
  const turnstile = getTurnstileConfig();
  const websiteBaseUrl = process.env.SLYDE_WEBSITE_BASE_URL;
  const slydeAppSyncBaseUrl = process.env.SLYDE_APP_SYNC_BASE_URL;
  const nodeEnv = process.env.NODE_ENV || "development";

  let persistenceStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  let persistenceMessage = "Persistence is available.";

  try {
    if (persistenceDriver === "prisma") {
      await prisma.$queryRaw`SELECT 1`;
    } else {
      await readStore();
    }
  } catch (error) {
    persistenceStatus = "unhealthy";
    persistenceMessage = error instanceof Error ? error.message : "Persistence check failed.";
  }

  let storageStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  let storageMessage = "Upload storage is available.";

  try {
    await mkdir(uploadsDirectory, { recursive: true });
    await access(uploadsDirectory);
  } catch (error) {
    storageStatus = "unhealthy";
    storageMessage = error instanceof Error ? error.message : "Upload storage check failed.";
  }

  const envChecks = [
    { key: "DATABASE_URL", ok: Boolean(process.env.DATABASE_URL) },
    { key: "SLYDE_WEBSITE_BASE_URL", ok: Boolean(websiteBaseUrl) },
    { key: "SLYDE_APP_SYNC_BASE_URL", ok: Boolean(slydeAppSyncBaseUrl) },
    { key: "SLYDE_APP_SYNC_SECRET", ok: Boolean(process.env.SLYDE_APP_SYNC_SECRET) },
    { key: "RESEND_API_KEY", ok: Boolean(process.env.RESEND_API_KEY) },
    { key: "RESEND_FROM_EMAIL", ok: Boolean(process.env.RESEND_FROM_EMAIL) },
  ];

  const missingCriticalEnv = envChecks.filter((item) => !item.ok).map((item) => item.key);
  const hostingWarnings = [
    ...(isLocalLikeUrl(websiteBaseUrl) ? ["SLYDE_WEBSITE_BASE_URL points to a local address."] : []),
    ...(isLocalLikeUrl(slydeAppSyncBaseUrl) ? ["SLYDE_APP_SYNC_BASE_URL points to a local address."] : []),
    ...(persistenceDriver !== "prisma" ? ["PERSISTENCE_DRIVER is not set to prisma."] : []),
    ...(turnstile.mode === "off" ? ["Turnstile protection is disabled."] : []),
  ];

  const overallStatus =
    persistenceStatus === "unhealthy" || storageStatus === "unhealthy"
      ? "unhealthy"
      : missingCriticalEnv.length > 0 || !isEmailConfigured() || hostingWarnings.length > 0
        ? "degraded"
        : "healthy";

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    hosting: {
      nodeEnv,
      websiteBaseUrl,
      slydeAppSyncBaseUrl,
      productionLocked:
        nodeEnv === "production" &&
        !isLocalLikeUrl(websiteBaseUrl) &&
        !isLocalLikeUrl(slydeAppSyncBaseUrl) &&
        persistenceDriver === "prisma",
      warnings: hostingWarnings,
    },
    persistence: {
      driver: persistenceDriver,
      status: persistenceStatus,
      message: persistenceMessage,
    },
    storage: {
      status: storageStatus,
      message: storageMessage,
      uploadsDirectory,
    },
    notifications: {
      email: {
        configured: isEmailConfigured(),
        provider: isEmailConfigured() ? "resend" : "email_stub",
      },
      whatsapp: {
        configured: isWhatsappConfigured(),
        provider: isWhatsappConfigured() ? "twilio_whatsapp" : "whatsapp_stub",
      },
      sms: {
        configured: isSmsConfigured(),
        provider: isSmsConfigured() ? "sms_live" : "sms_stub",
      },
    },
    botProtection: {
      mode: turnstile.mode,
      configured: turnstile.configured,
      siteKeyPresent: Boolean(turnstile.siteKey),
      secretKeyPresent: Boolean(turnstile.secretKey),
    },
    integration: {
      slydeAppSyncConfigured: Boolean(process.env.SLYDE_APP_SYNC_BASE_URL && process.env.SLYDE_APP_SYNC_SECRET),
    },
    env: {
      missingCriticalEnv,
      checks: envChecks,
    },
  };
}
