import { withStoreTransaction, readStore } from "@/server/persistence/store";
import { getPersistenceDriver } from "@/server/persistence/repository";
import {
  getNotificationHealthSummary,
  getNotificationHistoryForEntityInStore,
  getNotificationLogById,
  listNotificationLogs,
  onZoneMarkedLive,
  resendNotification,
  retryFailedNotification,
} from "@/server/notifications/notification.service";
import { uploadExistsForUrl } from "@/server/uploads/storage";
import type { AdminApplicationDetail, AdminApplicationRow, AdminDashboardData, AdminNotificationView, AdminSlyderRow, AdminZoneView } from "@/types/admin";
import type { CoverageZone, LaunchStatus, NotificationRecord, NotificationStatus, OnboardingStore } from "@/types/backend/onboarding";
import { zoneStatusMessages } from "@/content/site";
import { listPublicApplicationsFromPrisma } from "@/modules/onboarding/repositories/prisma-public-application.repository";

const DEFAULT_ZONE_TARGET = 24;

const DEFAULT_ZONE_SEEDS: Array<Pick<CoverageZone, "id" | "name" | "parish" | "requiredReadySlyders" | "merchantAvailability" | "estimatedLaunchLabel">> = [
  { id: "kingston", name: "Kingston", parish: "Kingston", requiredReadySlyders: 50, merchantAvailability: "waitlist", estimatedLaunchLabel: "Launching Soon" },
  { id: "montego-bay", name: "Montego Bay", parish: "St James", requiredReadySlyders: 36, merchantAvailability: "waitlist", estimatedLaunchLabel: "Near Ready" },
  { id: "mandeville", name: "Mandeville", parish: "Manchester", requiredReadySlyders: 28, merchantAvailability: "closed", estimatedLaunchLabel: "Building Network" },
  { id: "spanish-town", name: "Spanish Town", parish: "St Catherine", requiredReadySlyders: 32, merchantAvailability: "closed", estimatedLaunchLabel: "Building Network" },
  { id: "ochos-rios", name: "Ocho Rios", parish: "St Ann", requiredReadySlyders: 24, merchantAvailability: "closed", estimatedLaunchLabel: "Network Build" },
  { id: "savanna-la-mar", name: "Savanna-la-Mar", parish: "Westmoreland", requiredReadySlyders: 18, merchantAvailability: "closed", estimatedLaunchLabel: "Network Build" },
];

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeNotificationStatus(status?: NotificationStatus): NotificationStatus {
  return status ?? "sent";
}

function deriveZoneName(application: OnboardingStore["applications"][number]) {
  return application.preferredZones[0]?.trim() || application.parish.trim();
}

function deriveZoneId(application: OnboardingStore["applications"][number]) {
  return slugify(deriveZoneName(application));
}

async function ensureCoverageZones(store?: OnboardingStore) {
  if (getPersistenceDriver() === "prisma") {
    if (store) {
      await syncApplicationsFromPrisma(store);
      hydrateZones(store);
      return store;
    }

    return withStoreTransaction(async (transactionStore) => {
      await syncApplicationsFromPrisma(transactionStore);
      hydrateZones(transactionStore);
      return transactionStore;
    });
  }

  if (store) {
    hydrateZones(store);
    return store;
  }

  return withStoreTransaction(async (transactionStore) => {
    hydrateZones(transactionStore);
    return transactionStore;
  });
}

async function syncApplicationsFromPrisma(store: OnboardingStore) {
  const prismaApplications = await listPublicApplicationsFromPrisma();

  for (const item of prismaApplications) {
    const applicationIndex = store.applications.findIndex((entry) => entry.id === item.application.id);
    if (applicationIndex >= 0) {
      store.applications[applicationIndex] = item.application;
    } else {
      store.applications.push(item.application);
    }

    if (item.vehicle) {
      const vehicleIndex = store.vehicles.findIndex((entry) => entry.id === item.vehicle?.id);
      if (vehicleIndex >= 0) {
        store.vehicles[vehicleIndex] = item.vehicle;
      } else {
        store.vehicles.push(item.vehicle);
      }
    }

    for (const document of item.documents) {
      const documentIndex = store.documents.findIndex((entry) => entry.id === document.id);
      if (documentIndex >= 0) {
        store.documents[documentIndex] = document;
      } else {
        store.documents.push(document);
      }
    }
  }
}

function hydrateZones(store: OnboardingStore) {
  const timestamp = nowIso();
  const known = new Set(store.coverageZones.map((zone) => zone.id));

  for (const seed of DEFAULT_ZONE_SEEDS) {
    if (!known.has(seed.id)) {
      store.coverageZones.push({
        ...seed,
        isLive: false,
        isPaused: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      known.add(seed.id);
    }
  }

  for (const application of store.applications) {
    const zoneId = deriveZoneId(application);
    if (!zoneId || known.has(zoneId)) continue;

    store.coverageZones.push({
      id: zoneId,
      name: toTitleCase(deriveZoneName(application)),
      parish: application.parish,
      requiredReadySlyders: DEFAULT_ZONE_TARGET,
      merchantAvailability: "closed",
      estimatedLaunchLabel: "Building Network",
      isLive: false,
      isPaused: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    known.add(zoneId);
  }
}

function getApplicationNotifications(store: OnboardingStore, applicationId: string) {
  return getNotificationHistoryForEntityInStore(store, "slyder_application", applicationId);
}

function getLatestNotificationStatus(
  notifications: NotificationRecord[],
  channel: "email" | "whatsapp",
  templateKeys = ["slyder_application_received_email", "slyder_application_received_whatsapp", "slyder_application_submitted"],
): NotificationStatus | "not_sent" {
  const match = [...notifications]
    .filter((item) => item.channel === channel && templateKeys.includes(item.templateKey || item.template))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  return match ? normalizeNotificationStatus(match.status) : "not_sent";
}

function computeLaunchStatus(zone: CoverageZone, readyCount: number): LaunchStatus {
  if (zone.isPaused) return "paused";
  if (zone.isLive) return "live";

  const percentage = Math.round((readyCount / Math.max(zone.requiredReadySlyders, 1)) * 100);
  if (percentage >= 100) return "ready";
  if (percentage >= 75) return "near_ready";
  if (percentage >= 35) return "building";
  return "not_ready";
}

function buildZoneMetrics(store: OnboardingStore, zone: CoverageZone) {
  const applications = store.applications.filter((item) => deriveZoneId(item) === zone.id);
  const approvedProfiles = store.slyderProfiles.filter((profile) => {
    const application = store.applications.find((item) => item.id === profile.applicationId);
    return application ? deriveZoneId(application) === zone.id : false;
  });
  const readyProfiles = approvedProfiles.filter((profile) => profile.readinessStatus === "passed");
  const readinessPercentage = Math.min(100, Math.round((readyProfiles.length / Math.max(zone.requiredReadySlyders, 1)) * 100));

  return {
    applicants: applications.length,
    approvedSlyders: approvedProfiles.length,
    readySlyders: readyProfiles.length,
    requiredReadySlyders: zone.requiredReadySlyders,
    readinessPercentage,
    remainingNeeded: Math.max(zone.requiredReadySlyders - readyProfiles.length, 0),
  };
}

function buildZonePublicMessage(zone: CoverageZone, launchStatus: LaunchStatus, metrics: ReturnType<typeof buildZoneMetrics>) {
  const zoneMessage = zoneStatusMessages[launchStatus === "paused" ? "building" : launchStatus === "not_ready" ? "not_ready" : launchStatus === "building" ? "building" : launchStatus === "near_ready" ? "near_ready" : launchStatus === "ready" ? "ready" : "live"];

  return {
    headline: zoneMessage.headline,
    body: zoneMessage.body,
    recruitmentMessage: `${metrics.remainingNeeded} more ready Slyders needed to move ${zone.name} closer to launch threshold.`,
    slyderBenefitMessage: `Early approved Slyders in ${zone.name} are best positioned as the zone approaches launch.`,
  };
}

function buildZoneView(store: OnboardingStore, zone: CoverageZone): AdminZoneView {
  const metrics = buildZoneMetrics(store, zone);
  const launchStatus = computeLaunchStatus(zone, metrics.readySlyders);

  return {
    id: zone.id,
    name: zone.name,
    parish: zone.parish,
    launchStatus,
    merchantAvailability: zone.merchantAvailability,
    estimatedLaunchLabel: zone.estimatedLaunchLabel,
    isLive: zone.isLive,
    isPaused: zone.isPaused,
    metrics,
    publicMessage: buildZonePublicMessage(zone, launchStatus, metrics),
  };
}

function buildNotificationView(store: OnboardingStore, notification: NotificationRecord): AdminNotificationView {
  const application = notification.applicationId ? store.applications.find((item) => item.id === notification.applicationId) : null;
  const profile = notification.slyderProfileId ? store.slyderProfiles.find((item) => item.id === notification.slyderProfileId) : null;
  const merchant = notification.relatedEntityType === "merchant_interest"
    ? store.merchantInterests.find((item) => item.id === notification.relatedEntityId)
    : null;
  const applicantName =
    application?.fullName ||
    profile?.displayName ||
    merchant?.contactName ||
    (notification.userId ? store.users.find((user) => user.id === notification.userId)?.fullName : null) ||
    "Unknown contact";

  return {
    id: notification.id,
    applicationId: notification.applicationId,
    slyderProfileId: notification.slyderProfileId,
    applicantName,
    channel: notification.channel,
    recipient: notification.recipient || application?.email || profile?.email || merchant?.email || "Unknown recipient",
    template: notification.templateKey || notification.template,
    actorType: notification.actorType,
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
    providerName: notification.providerName,
    providerMessageId: notification.providerMessageId,
    retryCount: notification.retryCount,
    subjectSnapshot: notification.subjectSnapshot,
    bodySnapshot: notification.bodySnapshot,
    variablesSnapshot: notification.variablesSnapshot,
    status: normalizeNotificationStatus(notification.status),
    failureReason: notification.failureReason,
    createdAt: notification.createdAt,
    lastAttemptAt: notification.lastAttemptAt,
    sentAt: notification.sentAt,
    deliveredAt: notification.deliveredAt,
    resentFromId: notification.resentFromId,
  };
}

function buildApplicationRow(store: OnboardingStore, application: OnboardingStore["applications"][number]): AdminApplicationRow {
  const notifications = getApplicationNotifications(store, application.id);
  return {
    id: application.id,
    applicationCode: application.applicationCode,
    fullName: application.fullName,
    phone: application.phone,
    email: application.email,
    parish: application.parish,
    town: deriveZoneName(application),
    zoneId: deriveZoneId(application),
    zoneName: toTitleCase(deriveZoneName(application)),
    courierType: application.courierType,
    submittedAt: application.submittedAt,
    applicationStatus: application.applicationStatus,
    accountStatus: application.accountStatus,
    readinessStatus: application.readinessStatus,
    operationalStatus: application.operationalStatus,
    whatsappStatus: getLatestNotificationStatus(notifications, "whatsapp"),
    emailStatus: getLatestNotificationStatus(notifications, "email"),
    linkedProfileId: application.linkedSlyderProfileId,
    linkedUserId: application.linkedUserId,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const store = await ensureCoverageZones();
  const zoneViews = store.coverageZones.map((zone) => buildZoneView(store, zone)).sort((left, right) => right.metrics.readinessPercentage - left.metrics.readinessPercentage);
  const applications = store.applications.map((item) => buildApplicationRow(store, item));
  const notifications = store.notifications.map((item) => buildNotificationView(store, item));
  const health = await getNotificationHealthSummary();

  return {
    kpis: [
      { label: "Total Applicants", value: store.applications.length, subtext: "Public website submissions" },
      { label: "Approved Slyders", value: store.slyderProfiles.length, subtext: "Profiles provisioned" },
      { label: "Ready for Launch", value: store.slyderProfiles.filter((item) => item.canGoOnline).length, subtext: "Can go online" },
      { label: "Active Zones", value: zoneViews.filter((item) => item.metrics.applicants > 0).length, subtext: "With applicant activity" },
      { label: "Near-Ready Zones", value: zoneViews.filter((item) => item.launchStatus === "near_ready" || item.launchStatus === "ready").length, subtext: "Approaching launch threshold" },
      { label: "Live Zones", value: zoneViews.filter((item) => item.launchStatus === "live").length, subtext: "Operationally active" },
      { label: "Pending Applications", value: applications.filter((item) => ["submitted", "under_review", "documents_pending"].includes(item.applicationStatus)).length, subtext: "Need review attention" },
      { label: "Failed Notifications", value: notifications.filter((item) => item.status === "failed").length, subtext: "Retry available" },
    ],
    topZones: zoneViews.slice(0, 5),
    pendingApplications: applications
      .filter((item) => ["submitted", "under_review", "documents_pending"].includes(item.applicationStatus))
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
      .slice(0, 6),
    notificationSummary: {
      whatsappSent: health.channelBreakdown.find((item) => item.channel === "whatsapp")?.success ?? 0,
      emailSent: health.channelBreakdown.find((item) => item.channel === "email")?.success ?? 0,
      failed: health.totals.failed,
      recentFailures: health.recentFailures.map((item) => buildNotificationView(store, item)).slice(0, 5),
    },
    launchGroups: {
      not_ready: zoneViews.filter((item) => item.launchStatus === "not_ready"),
      building: zoneViews.filter((item) => item.launchStatus === "building"),
      near_ready: zoneViews.filter((item) => item.launchStatus === "near_ready"),
      ready: zoneViews.filter((item) => item.launchStatus === "ready"),
      live: zoneViews.filter((item) => item.launchStatus === "live"),
      paused: zoneViews.filter((item) => item.launchStatus === "paused"),
    },
  };
}

export async function listAdminApplications(filters: {
  search?: string;
  status?: string;
  parish?: string;
  zone?: string;
  courierType?: string;
  notificationStatus?: string;
  sort?: "newest" | "oldest" | "zone" | "readiness";
}) {
  const store = await ensureCoverageZones();
  let items = store.applications.map((item) => buildApplicationRow(store, item));

  if (filters.search) {
    const query = filters.search.toLowerCase();
    items = items.filter((item) =>
      [item.fullName, item.applicationCode, item.phone, item.email, item.zoneName].some((value) => value.toLowerCase().includes(query)),
    );
  }
  if (filters.status) items = items.filter((item) => item.applicationStatus === filters.status);
  if (filters.parish) items = items.filter((item) => item.parish === filters.parish);
  if (filters.zone) items = items.filter((item) => item.zoneId === filters.zone);
  if (filters.courierType) items = items.filter((item) => item.courierType === filters.courierType);
  if (filters.notificationStatus) {
    items = items.filter((item) => item.whatsappStatus === filters.notificationStatus || item.emailStatus === filters.notificationStatus);
  }

  const sort = filters.sort || "newest";
  items.sort((left, right) => {
    if (sort === "oldest") return left.submittedAt.localeCompare(right.submittedAt);
    if (sort === "zone") return left.zoneName.localeCompare(right.zoneName);
    if (sort === "readiness") return right.readinessStatus.localeCompare(left.readinessStatus);
    return right.submittedAt.localeCompare(left.submittedAt);
  });

  return {
    items,
    parishes: Array.from(new Set(store.applications.map((item) => item.parish))).sort(),
    zones: store.coverageZones.map((zone) => ({ id: zone.id, name: zone.name })).sort((left, right) => left.name.localeCompare(right.name)),
  };
}

export async function getAdminApplicationDetail(applicationId: string): Promise<AdminApplicationDetail> {
  const store = await ensureCoverageZones();
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");

  const applicationRow = buildApplicationRow(store, application);
  const vehicle = store.vehicles.find((item) => item.applicationId === application.id) ?? null;
  const documents = await Promise.all(
    store.documents
      .filter((item) => item.applicationId === application.id)
      .map(async (item) => ({
        ...item,
        previewAvailable: await uploadExistsForUrl(item.fileUrl),
      })),
  );
  const notificationHistory = getApplicationNotifications(store, application.id)
    .map((item) => buildNotificationView(store, item))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const zone = buildZoneView(
    store,
    store.coverageZones.find((item) => item.id === applicationRow.zoneId) || {
      id: applicationRow.zoneId,
      name: applicationRow.zoneName,
      parish: application.parish,
      requiredReadySlyders: DEFAULT_ZONE_TARGET,
      merchantAvailability: "closed",
      estimatedLaunchLabel: "Building Network",
      isLive: false,
      isPaused: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  );
  const auditTimeline = store.history
    .filter((item) => item.entityId === application.id || item.metadata?.applicationId === application.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((item) => ({
      id: item.id,
      eventType: item.eventType,
      actorLabel: item.actorLabel,
      createdAt: item.createdAt,
      metadata: item.metadata,
    }));

  const projectedPercentage = Math.min(
    100,
    Math.round(((zone.metrics.readySlyders + 1) / Math.max(zone.metrics.requiredReadySlyders, 1)) * 100),
  );

  return {
    application: {
      ...applicationRow,
      dateOfBirth: application.dateOfBirth,
      address: application.address,
      trn: application.trn,
      emergencyContactName: application.emergencyContactName,
      emergencyContactPhone: application.emergencyContactPhone,
      workTypePreference: application.workTypePreference,
      availability: application.availability,
      preferredZones: application.preferredZones,
      deliveryTypePreferences: application.deliveryTypePreferences,
      maxTravelComfort: application.maxTravelComfort,
      peakHours: application.peakHours,
      smartphoneType: application.smartphoneType,
      whatsappNumber: application.whatsappNumber,
      gpsConfirmed: application.gpsConfirmed,
      internetConfirmed: application.internetConfirmed,
      readinessAnswers: application.readinessAnswers,
      agreementsAccepted: application.agreementsAccepted,
      reviewNotes: application.reviewNotes,
      rejectionReason: application.rejectionReason,
      requestedDocumentNotes: application.requestedDocumentNotes,
      requestedDocumentTypes: application.requestedDocumentTypes,
      reviewedAt: application.reviewedAt,
      referralAttribution: application.referralAttribution,
    },
    vehicle,
    documents,
    notificationHistory,
    auditTimeline,
    linkedUser: application.linkedUserId
      ? (() => {
          const user = store.users.find((item) => item.id === application.linkedUserId);
          return user
            ? { id: user.id, fullName: user.fullName, accountStatus: user.accountStatus, isEnabled: user.isEnabled }
            : null;
        })()
      : null,
    linkedSlyderProfile: application.linkedSlyderProfileId
      ? (() => {
          const profile = store.slyderProfiles.find((item) => item.id === application.linkedSlyderProfileId);
          return profile
            ? {
                id: profile.id,
                onboardingStatus: profile.onboardingStatus,
                readinessStatus: profile.readinessStatus,
                operationalStatus: profile.operationalStatus,
                accountStatus: profile.accountStatus,
                canGoOnline: profile.canGoOnline,
              }
            : null;
        })()
      : null,
    zone,
    readinessContribution: {
      currentPercentage: zone.metrics.readinessPercentage,
      projectedPercentage,
      message: `Approving this applicant would move ${zone.name} from ${zone.metrics.readinessPercentage}% to ${projectedPercentage}% readiness.`,
    },
  };
}

export async function listAdminSlyders(filters: {
  zone?: string;
  readinessStatus?: string;
  setupStatus?: string;
  accountStatus?: string;
}) {
  const store = await ensureCoverageZones();
  let items: AdminSlyderRow[] = store.slyderProfiles.map((profile) => {
    const application = store.applications.find((item) => item.id === profile.applicationId);
    const zoneName = application ? toTitleCase(deriveZoneName(application)) : "Unassigned";
    const zoneId = application ? deriveZoneId(application) : "unassigned";
    return {
      id: profile.id,
      applicationId: profile.applicationId,
      displayName: profile.displayName,
      zoneId,
      zoneName,
      courierType: profile.courierType,
      accountStatus: profile.accountStatus,
      onboardingStatus: profile.onboardingStatus,
      readinessStatus: profile.readinessStatus,
      operationalStatus: profile.operationalStatus,
      contractAccepted: profile.contractAccepted,
      permissionsComplete: profile.permissionsComplete,
      approvedAt: profile.approvedAt,
      canGoOnline: profile.canGoOnline,
      canReceiveOrders: profile.canReceiveOrders,
      userId: profile.userId,
    };
  });

  if (filters.zone) items = items.filter((item) => item.zoneId === filters.zone);
  if (filters.readinessStatus) items = items.filter((item) => item.readinessStatus === filters.readinessStatus);
  if (filters.setupStatus) items = items.filter((item) => item.onboardingStatus === filters.setupStatus);
  if (filters.accountStatus) items = items.filter((item) => item.accountStatus === filters.accountStatus);

  items.sort((left, right) => right.approvedAt.localeCompare(left.approvedAt));
  return items;
}

export async function listCoverageZones() {
  const store = await ensureCoverageZones();
  return store.coverageZones.map((zone) => buildZoneView(store, zone)).sort((left, right) => right.metrics.readinessPercentage - left.metrics.readinessPercentage);
}

export async function getCoverageZoneDetail(zoneId: string) {
  const store = await ensureCoverageZones();
  const zone = store.coverageZones.find((item) => item.id === zoneId);
  if (!zone) throw new Error("Zone not found");

  const view = buildZoneView(store, zone);
  const applicants = store.applications
    .filter((item) => deriveZoneId(item) === zoneId)
    .map((item) => buildApplicationRow(store, item))
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
  const slyders = (await listAdminSlyders({ zone: zoneId })).slice(0, 12);

  return {
    zone: view,
    applicants,
    slyders,
    insight: view.metrics.remainingNeeded > 0
      ? `${view.metrics.remainingNeeded} more ready Slyders needed to reach the launch threshold in ${view.name}.`
      : `${view.name} is ready for launch activation and merchant onboarding review.`,
  };
}

export async function listAdminNotifications(filters: {
  channel?: string;
  status?: string;
  template?: string;
  actorType?: string;
  search?: string;
}) {
  const store = await ensureCoverageZones();
  const logs = await listNotificationLogs(filters);
  return logs.map((item) => buildNotificationView(store, item));
}

export async function updateZoneLaunchState(zoneId: string, action: "mark_live" | "pause" | "resume") {
  return withStoreTransaction(async (store) => {
    await ensureCoverageZones(store);
    const zone = store.coverageZones.find((item) => item.id === zoneId);
    if (!zone) throw new Error("Zone not found");

    if (action === "mark_live") {
      zone.isLive = true;
      zone.isPaused = false;
      zone.merchantAvailability = "open";
      zone.estimatedLaunchLabel = "Live";
    } else if (action === "pause") {
      zone.isPaused = true;
      zone.isLive = false;
      zone.merchantAvailability = "waitlist";
      zone.estimatedLaunchLabel = "Paused";
    } else {
      zone.isPaused = false;
      zone.estimatedLaunchLabel = "Resuming";
    }
    zone.updatedAt = nowIso();

    if (action === "mark_live") {
      await onZoneMarkedLive(store, zoneId);
    }

    return buildZoneView(store, zone);
  });
}

export async function resendAdminNotification(notificationId: string, triggeredByUserId?: string) {
  return withStoreTransaction(async (store) => {
    const notification = await resendNotification(store, notificationId, triggeredByUserId);
    return buildNotificationView(store, notification);
  });
}

export async function retryAdminNotification(notificationId: string) {
  const notification = await retryFailedNotification(notificationId);
  const store = await ensureCoverageZones();
  return buildNotificationView(store, notification);
}

export async function getAdminNotificationDetail(notificationId: string) {
  const [store, detail] = await Promise.all([ensureCoverageZones(), getNotificationLogById(notificationId)]);
  if (!detail) throw new Error("Notification not found");

  return {
    notification: buildNotificationView(store, detail.log),
    trigger: detail.trigger,
  };
}
