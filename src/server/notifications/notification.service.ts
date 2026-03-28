import { notificationTemplatesRegistry } from "@/content/notifications";
import type {
  NotificationActorType,
  NotificationChannel,
  NotificationRecord,
  NotificationTemplate,
  NotificationTriggerEvent,
  OnboardingStore,
  SetupStatusResponse,
} from "@/types/backend/onboarding";
import { readStore, withStoreTransaction } from "@/server/persistence/store";
import { dispatchViaProvider } from "@/server/notifications/providers";
import { isSmsConfigured } from "@/server/notifications/providers";
import { evaluateSlyderOperationalEligibility } from "@/modules/onboarding/services/readiness.service";

type RelatedEntityType = NotificationRecord["relatedEntityType"];

type SendTemplateInput = {
  templateKey: string;
  actorType: NotificationActorType;
  actorId?: string;
  recipient?: string;
  recipientName?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  applicationId?: string;
  userId?: string;
  slyderProfileId?: string;
  variables?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  dedupeKey?: string;
  triggerEventId?: string;
  triggerEventKey?: string;
  createdBySystem?: boolean;
  triggeredByUserId?: string;
  resentFromId?: string;
  metadata?: Record<string, unknown>;
  force?: boolean;
};

type NotificationTriggerInput = {
  eventKey: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  actorType?: NotificationActorType;
  actorId?: string;
  payload?: Record<string, unknown>;
  force?: boolean;
};

type NotificationFilters = {
  channel?: string;
  status?: string;
  template?: string;
  actorType?: string;
  search?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

type NotificationTemplateFilters = {
  channel?: string;
  actorType?: string;
  eventType?: string;
  active?: string;
  search?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function getWebsiteBaseUrl() {
  return (
    process.env.SLYDE_WEBSITE_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://127.0.0.1:3002"
  ).replace(/\/+$/, "");
}

function createProviderMessageFallback() {
  return `notif_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

function renderStringTemplate(template: string | undefined, variables: Record<string, unknown>) {
  if (!template) return undefined;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => `${variables[key] ?? ""}`);
}

function ensureTemplatesSeeded(store: OnboardingStore) {
  const timestamp = nowIso();
  for (const seed of notificationTemplatesRegistry) {
    const existing = store.notificationTemplates.find((template) => template.key === seed.key);
    if (existing) {
      existing.name = seed.name;
      existing.actorType = seed.actorType;
      existing.eventType = seed.eventType;
      existing.channel = seed.channel;
      existing.subject = seed.subject;
      existing.bodyTemplate = seed.bodyTemplate;
      existing.plainTextTemplate = seed.plainTextTemplate;
      existing.version = seed.version;
      existing.locale = seed.locale ?? "en-JM";
      existing.description = seed.description;
      existing.updatedAt = timestamp;
      continue;
    }

    if (!existing) {
      store.notificationTemplates.push({
        id: crypto.randomUUID(),
        key: seed.key,
        name: seed.name,
        actorType: seed.actorType,
        eventType: seed.eventType,
        channel: seed.channel,
        subject: seed.subject,
        bodyTemplate: seed.bodyTemplate,
        plainTextTemplate: seed.plainTextTemplate,
        isActive: seed.isActive ?? true,
        version: seed.version,
        locale: seed.locale ?? "en-JM",
        description: seed.description,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }
}

function getActiveTemplateByKey(store: OnboardingStore, key: string) {
  ensureTemplatesSeeded(store);
  return store.notificationTemplates.find((template) => template.key === key && template.isActive);
}

function createTriggerEvent(store: OnboardingStore, input: NotificationTriggerInput) {
  if (!input.force) {
    const existing = store.notificationTriggers.find(
      (event) =>
        event.eventKey === input.eventKey &&
        event.relatedEntityType === input.relatedEntityType &&
        event.relatedEntityId === input.relatedEntityId &&
        event.status !== "failed",
    );
    if (existing) {
      return { event: existing, isDuplicate: true };
    }
  }

  const event: NotificationTriggerEvent = {
    id: crypto.randomUUID(),
    eventKey: input.eventKey,
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId,
    actorType: input.actorType,
    actorId: input.actorId,
    payload: input.payload,
    status: "received",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.notificationTriggers.push(event);
  return { event, isDuplicate: false };
}

function updateTriggerStatus(
  store: OnboardingStore,
  triggerEventId: string | undefined,
  status: NotificationTriggerEvent["status"],
  errorMessage?: string,
) {
  if (!triggerEventId) return;
  const event = store.notificationTriggers.find((item) => item.id === triggerEventId);
  if (!event) return;
  event.status = status;
  event.errorMessage = errorMessage;
  event.updatedAt = nowIso();
}

function dedupeExists(store: OnboardingStore, input: SendTemplateInput) {
  if (!input.dedupeKey) return false;
  return store.notifications.some(
    (item) =>
      item.dedupeKey === input.dedupeKey &&
      item.templateKey === input.templateKey &&
      item.status !== "failed" &&
      item.status !== "canceled",
  );
}

function buildLogRecord(store: OnboardingStore, template: NotificationTemplate, input: SendTemplateInput) {
  const variables = input.variables ?? {};
  const subjectSnapshot = renderStringTemplate(template.subject, variables);
  const bodySnapshot = renderStringTemplate(template.bodyTemplate, variables) || "";
  const timestamp = nowIso();

  const record: NotificationRecord = {
    id: crypto.randomUUID(),
    templateId: template.id,
    templateKey: template.key,
    triggerEventId: input.triggerEventId,
    triggerEventKey: input.triggerEventKey,
    dedupeKey: input.dedupeKey,
    actorType: input.actorType,
    actorId: input.actorId,
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId,
    userId: input.userId,
    applicationId: input.applicationId,
    slyderProfileId: input.slyderProfileId,
    channel: template.channel,
    template: template.key,
    recipient: input.recipient,
    recipientName: input.recipientName,
    status: "queued",
    subjectSnapshot,
    bodySnapshot,
    variablesSnapshot: variables,
    createdBySystem: input.createdBySystem ?? true,
    triggeredByUserId: input.triggeredByUserId,
    resentFromId: input.resentFromId,
    retryCount: 0,
    metadata: input.metadata,
    payload: input.payload ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  store.notifications.push(record);
  return record;
}

async function sendFailureAlert(store: OnboardingStore, sourceLog: NotificationRecord) {
  if (sourceLog.templateKey === "admin_notification_failure_alert") return;

  const adminUsers = store.users.filter((user) => user.roles.includes("platform_admin") || user.roles.includes("operations_admin"));
  for (const admin of adminUsers) {
    await sendTemplateNotificationInStore(store, {
      templateKey: "admin_notification_failure_alert",
      actorType: "admin_user",
      actorId: admin.id,
      relatedEntityType: sourceLog.relatedEntityType,
      relatedEntityId: sourceLog.relatedEntityId,
      recipient: admin.email,
      recipientName: admin.fullName,
      variables: {
        templateKey: sourceLog.templateKey || sourceLog.template,
        recipient: sourceLog.recipient || "Unknown recipient",
        errorMessage: sourceLog.failureReason || "Unknown delivery failure",
      },
      payload: { sourceNotificationId: sourceLog.id },
      dedupeKey: `failure_alert:${sourceLog.id}:${admin.id}`,
      force: true,
    });
  }
}

async function attemptSend(store: OnboardingStore, record: NotificationRecord) {
  if (!record.bodySnapshot) {
    record.status = "skipped";
    record.failureReason = "Rendered body was empty.";
    record.updatedAt = nowIso();
    return record;
  }

  if (!record.recipient && record.channel !== "internal") {
    record.status = "failed";
    record.failureReason = "Recipient is required for this channel.";
    record.lastAttemptAt = nowIso();
    record.updatedAt = nowIso();
    await sendFailureAlert(store, record);
    return record;
  }

  const result = await dispatchViaProvider({
    channel: record.channel,
    recipient: record.recipient,
    subject: record.subjectSnapshot,
    body: record.bodySnapshot,
  });

  record.providerName = result.providerName;
  record.providerMessageId = result.providerMessageId || createProviderMessageFallback();
  record.lastAttemptAt = nowIso();
  record.updatedAt = nowIso();

  if (result.ok) {
    record.status = record.channel === "internal" ? "confirmed" : "sent";
    record.sentAt = record.lastAttemptAt;
    record.deliveredAt = record.channel === "internal" ? record.lastAttemptAt : undefined;
    record.failureReason = undefined;
    return record;
  }

  record.status = "failed";
  record.failureReason = result.errorMessage || "Delivery attempt failed.";
  await sendFailureAlert(store, record);
  return record;
}

export function renderTemplate(store: OnboardingStore, templateKey: string, variables: Record<string, unknown>) {
  const template = getActiveTemplateByKey(store, templateKey);
  if (!template) {
    throw new Error(`Notification template not found: ${templateKey}`);
  }

  return {
    template,
    subject: renderStringTemplate(template.subject, variables),
    body: renderStringTemplate(template.bodyTemplate, variables) || "",
    plainText: renderStringTemplate(template.plainTextTemplate, variables),
  };
}

export async function sendTemplateNotificationInStore(store: OnboardingStore, input: SendTemplateInput) {
  const template = getActiveTemplateByKey(store, input.templateKey);
  if (!template) {
    throw new Error(`Notification template not found: ${input.templateKey}`);
  }

  if (!input.force && dedupeExists(store, input)) {
    const existing = [...store.notifications]
      .filter((item) => item.dedupeKey === input.dedupeKey && item.templateKey === input.templateKey)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    return existing;
  }

  const record = buildLogRecord(store, template, input);
  const attemptedRecord = await attemptSend(store, record);

  if (attemptedRecord.triggerEventId) {
    updateTriggerStatus(
      store,
      attemptedRecord.triggerEventId,
      attemptedRecord.status === "failed" ? "failed" : "processed",
      attemptedRecord.failureReason,
    );
  }

  return attemptedRecord;
}

export async function sendTemplateNotification(input: SendTemplateInput) {
  return withStoreTransaction(async (store) => sendTemplateNotificationInStore(store, input));
}

export function getNotificationHistoryForEntityInStore(store: OnboardingStore, entityType: RelatedEntityType, entityId: string) {
  return store.notifications
    .filter((item) => {
      if (item.relatedEntityType === entityType && item.relatedEntityId === entityId) return true;
      if (entityType === "slyder_application" && item.applicationId === entityId) return true;
      if (entityType === "slyder_profile" && item.slyderProfileId === entityId) return true;
      if (entityType === "employee_application" && item.relatedEntityId === entityId) return true;
      return false;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getNotificationHistoryForEntity(entityType: RelatedEntityType, entityId: string) {
  const store = await readStore();
  return getNotificationHistoryForEntityInStore(store, entityType, entityId);
}

export async function listNotificationTemplates(filters: NotificationTemplateFilters = {}) {
  const store = await readStore();
  ensureTemplatesSeeded(store);
  let items = [...store.notificationTemplates];

  if (filters.channel) items = items.filter((item) => item.channel === filters.channel);
  if (filters.actorType) items = items.filter((item) => item.actorType === filters.actorType);
  if (filters.eventType) items = items.filter((item) => item.eventType === filters.eventType);
  if (filters.active) items = items.filter((item) => `${item.isActive}` === filters.active);
  if (filters.search) {
    const query = filters.search.toLowerCase();
    items = items.filter((item) =>
      [item.key, item.name, item.eventType, item.actorType, item.channel].some((value) => value.toLowerCase().includes(query)),
    );
  }

  return items
    .map((item) => ({
      ...item,
      usageCount: store.notifications.filter((log) => log.templateKey === item.key).length,
      successCount: store.notifications.filter((log) => log.templateKey === item.key && ["sent", "delivered", "confirmed"].includes(log.status ?? "pending")).length,
      failureCount: store.notifications.filter((log) => log.templateKey === item.key && log.status === "failed").length,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

export async function getNotificationTemplateById(templateId: string) {
  const store = await readStore();
  ensureTemplatesSeeded(store);
  const template = store.notificationTemplates.find((item) => item.id === templateId);
  if (!template) return null;

  const sampleVariables = {
    firstName: "Ashandie",
    fullName: "Ashandie Powell",
    applicationCode: "SLY-2026-DEMO001",
    zoneName: "Kingston",
    requestedItems: "national_id, profile_photo",
    reviewReason: "Please re-upload a clearer document image.",
    activationToken: "demo-activation-token",
    otpCode: "482913",
    businessName: "SLYDE Market Demo",
    contactName: "Operations Lead",
    supportContact: "876-594-7320",
    supportEmail: "info@slyde.app",
    supportPhone: "876-594-7320",
    readyCount: 44,
    requiredReadyCount: 50,
    remainingNeeded: 6,
    templateKey: template.key,
    recipient: "demo@slyde.app",
    activationChannel: "email",
  };

  return {
    template,
    preview: renderTemplate(store, template.key, sampleVariables),
    recentLogs: store.notifications
      .filter((item) => item.templateKey === template.key)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 12),
  };
}

export async function updateNotificationTemplate(
  templateId: string,
  input: {
    name?: string;
    subject?: string;
    bodyTemplate?: string;
    plainTextTemplate?: string;
    isActive?: boolean;
    description?: string;
  },
) {
  return withStoreTransaction(async (store) => {
    ensureTemplatesSeeded(store);
    const template = store.notificationTemplates.find((item) => item.id === templateId);
    if (!template) throw new Error("Notification template not found");

    if (input.name !== undefined) template.name = input.name;
    if (input.subject !== undefined) template.subject = input.subject;
    if (input.bodyTemplate !== undefined) template.bodyTemplate = input.bodyTemplate;
    if (input.plainTextTemplate !== undefined) template.plainTextTemplate = input.plainTextTemplate;
    if (input.isActive !== undefined) template.isActive = input.isActive;
    if (input.description !== undefined) template.description = input.description;
    template.updatedAt = nowIso();

    return template;
  });
}

export async function listNotificationLogs(filters: NotificationFilters = {}) {
  const store = await readStore();
  let items = [...store.notifications];

  if (filters.channel) items = items.filter((item) => item.channel === filters.channel);
  if (filters.status) items = items.filter((item) => item.status === filters.status);
  if (filters.template) items = items.filter((item) => (item.templateKey || item.template) === filters.template);
  if (filters.actorType) items = items.filter((item) => item.actorType === filters.actorType);
  if (filters.relatedEntityType) items = items.filter((item) => item.relatedEntityType === filters.relatedEntityType);
  if (filters.relatedEntityId) items = items.filter((item) => item.relatedEntityId === filters.relatedEntityId);
  if (filters.search) {
    const query = filters.search.toLowerCase();
    items = items.filter((item) =>
      [
        item.recipient || "",
        item.recipientName || "",
        item.templateKey || item.template,
        item.actorType || "",
        item.relatedEntityType || "",
        item.relatedEntityId || "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }

  return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getNotificationLogById(notificationId: string) {
  const store = await readStore();
  const log = store.notifications.find((item) => item.id === notificationId);
  if (!log) return null;
  const trigger = log.triggerEventId ? store.notificationTriggers.find((item) => item.id === log.triggerEventId) ?? null : null;
  return { log, trigger };
}

export async function getNotificationHealthSummary() {
  const store = await readStore();
  const notifications = [...store.notifications];
  const sentCount = notifications.filter((item) => ["sent", "delivered", "confirmed"].includes(item.status ?? "pending")).length;
  const failedCount = notifications.filter((item) => item.status === "failed").length;
  const queuedCount = notifications.filter((item) => item.status === "queued" || item.status === "pending").length;

  const failureReasons = Object.entries(
    notifications
      .filter((item) => item.status === "failed")
      .reduce<Record<string, number>>((accumulator, item) => {
        const key = item.failureReason || "Unknown failure";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
  )
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  const channelBreakdown = (["whatsapp", "email", "sms", "internal"] as NotificationChannel[]).map((channel) => {
    const channelItems = notifications.filter((item) => item.channel === channel);
    const success = channelItems.filter((item) => ["sent", "delivered", "confirmed"].includes(item.status ?? "pending")).length;
    const failed = channelItems.filter((item) => item.status === "failed").length;
    return {
      channel,
      total: channelItems.length,
      success,
      failed,
      successRate: channelItems.length ? Math.round((success / channelItems.length) * 100) : 0,
    };
  });

  return {
    totals: {
      total: notifications.length,
      sent: sentCount,
      failed: failedCount,
      queued: queuedCount,
      recentRetries: notifications.filter((item) => (item.retryCount ?? 0) > 0).length,
    },
    failureReasons,
    channelBreakdown,
    recentFailures: notifications.filter((item) => item.status === "failed").sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 12),
  };
}

export async function retryFailedNotification(notificationId: string) {
  return withStoreTransaction(async (store) => {
    const record = store.notifications.find((item) => item.id === notificationId);
    if (!record) throw new Error("Notification not found");
    if (record.status !== "failed") throw new Error("Only failed notifications can be retried.");

    record.retryCount = (record.retryCount ?? 0) + 1;
    record.status = "queued";
    record.failureReason = undefined;
    record.updatedAt = nowIso();

    const attemptedRecord = await attemptSend(store, record);
    if (attemptedRecord.triggerEventId) {
      updateTriggerStatus(
        store,
        attemptedRecord.triggerEventId,
        attemptedRecord.status === "failed" ? "failed" : "processed",
        attemptedRecord.failureReason,
      );
    }
    return attemptedRecord;
  });
}

export async function resendNotification(store: OnboardingStore, notificationId: string, triggeredByUserId?: string) {
  const existing = store.notifications.find((entry) => entry.id === notificationId);
  if (!existing) {
    throw new Error("Notification not found");
  }

  let variables = existing.variablesSnapshot;
  let payload = existing.payload;
  const templateKey = existing.templateKey || existing.template;

  if (templateKey === "slyder_activation_ready_email" || templateKey === "slyder_activation_ready_whatsapp") {
    const activationToken = typeof existing.payload?.activationToken === "string" ? existing.payload.activationToken : undefined;

    if (!activationToken || !existing.applicationId) {
      throw new Error("Activation resend is missing the stored token or linked application.");
    }

    const websiteBaseUrl = getWebsiteBaseUrl();
    const activationUrl = `${websiteBaseUrl}/slyder/activate/${activationToken}`;
    const loginUrl = `${websiteBaseUrl}/slyder/login`;
    const onboardingUrl = `${websiteBaseUrl}/slyder/onboarding`;

    variables = {
      ...(existing.variablesSnapshot ?? {}),
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
      zoneName: getApplicationZoneName(store, existing.applicationId),
    };

    payload = {
      ...(existing.payload ?? {}),
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
    };
  }

  if (templateKey === "employee_activation_ready_email") {
    const activationToken = typeof existing.payload?.activationToken === "string" ? existing.payload.activationToken : undefined;

    if (!activationToken) {
      throw new Error("Employee activation resend is missing the stored token.");
    }

    const websiteBaseUrl = getWebsiteBaseUrl();
    const activationUrl = `${websiteBaseUrl}/employee/activate/${activationToken}`;
    const loginUrl = `${websiteBaseUrl}/employee/login`;
    const onboardingUrl = `${websiteBaseUrl}/employee/onboarding`;

    variables = {
      ...(existing.variablesSnapshot ?? {}),
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
    };

    payload = {
      ...(existing.payload ?? {}),
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
    };
  }

  return sendTemplateNotificationInStore(store, {
    templateKey,
    actorType: existing.actorType || "system_internal",
    actorId: existing.actorId,
    recipient: existing.recipient,
    recipientName: existing.recipientName,
    relatedEntityType: existing.relatedEntityType,
    relatedEntityId: existing.relatedEntityId,
    applicationId: existing.applicationId,
    userId: existing.userId,
    slyderProfileId: existing.slyderProfileId,
    variables,
    payload,
    metadata: existing.metadata,
    resentFromId: existing.id,
    triggeredByUserId,
    createdBySystem: false,
    force: true,
  });
}

export async function resendNotificationById(notificationId: string, triggeredByUserId?: string) {
  return withStoreTransaction(async (store) => resendNotification(store, notificationId, triggeredByUserId));
}

export async function resendLatestNotificationForEntity(
  entityType: RelatedEntityType,
  entityId: string,
  templateKey: string,
  triggeredByUserId?: string,
) {
  return withStoreTransaction(async (store) => {
    const log = [...store.notifications]
      .filter((item) => item.relatedEntityType === entityType && item.relatedEntityId === entityId && (item.templateKey || item.template) === templateKey)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    if (!log) throw new Error("Notification log not found for entity.");
    return resendNotification(store, log.id, triggeredByUserId);
  });
}

function zoneIdFromText(value: string | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getApplicationZoneName(store: OnboardingStore, applicationId: string) {
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) return "your area";
  return application.preferredZones[0]?.trim() || application.parish || "your area";
}

function getApplicationFirstName(store: OnboardingStore, applicationId: string) {
  const application = store.applications.find((item) => item.id === applicationId);
  return application?.fullName.split(" ")[0] || "there";
}

function getMerchantFirstName(store: OnboardingStore, merchantInterestId: string) {
  const merchant = store.merchantInterests.find((item) => item.id === merchantInterestId);
  return merchant?.contactName.split(" ")[0] || "there";
}

function getEmployeeApplicationFirstName(store: OnboardingStore, applicationId: string) {
  const application = store.employeeApplications.find((item) => item.id === applicationId);
  return application?.fullName.split(" ")[0] || "there";
}

export async function sendEmployeeApplicationSubmittedNotifications(store: OnboardingStore, applicationId: string) {
  const application = store.employeeApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Employee application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `employee_application_submitted:${application.id}`,
    relatedEntityType: "employee_application",
    relatedEntityId: application.id,
    actorType: "employee_applicant",
    actorId: application.id,
    payload: { roleInterest: application.roleInterest },
  });
  if (isDuplicate) return [];

  const websiteBaseUrl = getWebsiteBaseUrl();
  const reviewUrl = `${websiteBaseUrl}/admin/employee-applications/${application.id}`;
  const applicantVariables = {
    firstName: getEmployeeApplicationFirstName(store, application.id),
    fullName: application.fullName,
    roleInterest: application.roleInterest,
    departmentInterest: application.departmentInterest,
    supportEmail: "info@slyde.app",
    supportPhone: "876-594-7320",
  };

  const results = [
    await sendTemplateNotificationInStore(store, {
      templateKey: "employee_application_received_email",
      actorType: "employee_applicant",
      actorId: application.id,
      recipient: application.email,
      recipientName: application.fullName,
      relatedEntityType: "employee_application",
      relatedEntityId: application.id,
      variables: applicantVariables,
      payload: { roleInterest: application.roleInterest, departmentInterest: application.departmentInterest },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `employee_application_received:email:${application.id}`,
    }),
  ];

  const adminUsers = store.users.filter((user) => user.roles.includes("platform_admin") || user.roles.includes("operations_admin"));
  for (const admin of adminUsers) {
    results.push(
      await sendTemplateNotificationInStore(store, {
        templateKey: "admin_employee_application_submitted_email",
        actorType: "admin_user",
        actorId: admin.id,
        recipient: admin.email,
        recipientName: admin.fullName,
        relatedEntityType: "employee_application",
        relatedEntityId: application.id,
        variables: {
          fullName: application.fullName,
          roleInterest: application.roleInterest,
          departmentInterest: application.departmentInterest,
          location: application.location,
          reviewUrl,
        },
        payload: { applicationId: application.id, reviewUrl },
        triggerEventId: event.id,
        triggerEventKey: event.eventKey,
        dedupeKey: `admin_employee_application_submitted:email:${application.id}:${admin.id}`,
      }),
    );
  }

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function sendEmployeeActivationNotification(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
  activationToken: string,
) {
  const application = store.employeeApplications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  if (!application || !user) throw new Error("Linked employee activation records not found");

  const websiteBaseUrl = getWebsiteBaseUrl();
  const activationUrl = `${websiteBaseUrl}/employee/activate/${activationToken}`;
  const loginUrl = `${websiteBaseUrl}/employee/login`;
  const onboardingUrl = `${websiteBaseUrl}/employee/onboarding`;
  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `employee_activation_ready:${userId}:${applicationId}`,
    relatedEntityType: "employee_application",
    relatedEntityId: applicationId,
    actorType: "employee_user",
    actorId: userId,
    payload: { activationUrl, loginUrl, onboardingUrl },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "employee_activation_ready_email",
    actorType: "employee_user",
    actorId: userId,
    recipient: user.email,
    recipientName: user.fullName,
    relatedEntityType: "employee_application",
    relatedEntityId: applicationId,
    userId,
    variables: {
      fullName: application.fullName,
      roleInterest: application.roleInterest,
      departmentInterest: application.departmentInterest,
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
    },
    payload: { activationToken, activationUrl, loginUrl, onboardingUrl },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `employee_activation_ready:email:${userId}:${applicationId}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

export async function sendEmployeeActivationCompletedNotification(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
) {
  const application = store.employeeApplications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  if (!application || !user) throw new Error("Linked employee activation completion records not found");

  const websiteBaseUrl = getWebsiteBaseUrl();
  const loginUrl = `${websiteBaseUrl}/employee/login`;
  const onboardingUrl = `${websiteBaseUrl}/employee/onboarding`;
  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `employee_activation_completed:${userId}:${applicationId}`,
    relatedEntityType: "employee_application",
    relatedEntityId: applicationId,
    actorType: "employee_user",
    actorId: userId,
    payload: { loginUrl, onboardingUrl },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "employee_activation_completed_email",
    actorType: "employee_user",
    actorId: userId,
    recipient: user.email,
    recipientName: user.fullName,
    relatedEntityType: "employee_application",
    relatedEntityId: applicationId,
    userId,
    variables: {
      fullName: application.fullName,
      loginUrl,
      onboardingUrl,
    },
    payload: { loginUrl, onboardingUrl },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `employee_activation_completed:email:${userId}:${applicationId}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

export async function sendEmployeeRejectedNotification(store: OnboardingStore, applicationId: string, reason: string) {
  const application = store.employeeApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Employee application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `employee_application_rejected:${application.id}:${reason}`,
    relatedEntityType: "employee_application",
    relatedEntityId: application.id,
    actorType: "employee_applicant",
    actorId: application.id,
    payload: { reason },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "employee_application_rejected_email",
    actorType: "employee_applicant",
    actorId: application.id,
    recipient: application.email,
    recipientName: application.fullName,
    relatedEntityType: "employee_application",
    relatedEntityId: application.id,
    variables: {
      fullName: application.fullName,
      roleInterest: application.roleInterest,
      reviewReason: reason,
    },
    payload: { reason },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `employee_application_rejected:email:${application.id}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

function classifySlyderPostReviewState(status: SetupStatusResponse) {
  const nonDocumentSteps = status.remainingSteps.filter((step) => !step.startsWith("document_"));

  if (nonDocumentSteps.length > 0) {
    return {
      title: "Next step: continue your onboarding",
      body: "Your required documents have been approved. Sign in to the SLYDE website to complete your remaining setup and readiness steps before operations can be enabled.",
      stateKey: "action_required",
    } as const;
  }

  if (status.eligibilityState === "eligible_offline" && status.zoneStatus !== "live") {
    return {
      title: "You are fully onboarded",
      body: "Your required documents and onboarding steps are complete. Your account is ready, and SLYDE will notify you as soon as your zone goes live.",
      stateKey: "waiting_for_zone",
    } as const;
  }

  if (status.eligibilityState === "eligible_online" || status.zoneStatus === "live") {
    return {
      title: "You are operationally ready",
      body: "Your required documents and onboarding steps are complete, and your zone is live. Sign in to the SLYDE platform to continue into operations.",
      stateKey: "eligible_online",
    } as const;
  }

  return {
    title: "Document review is complete",
    body: "Your required documents have been approved. Sign in to the SLYDE website to review your current onboarding status and continue if any final action is still needed.",
    stateKey: "review_complete",
  } as const;
}

function classifySlyderCurrentStatus(status: SetupStatusResponse) {
  const documentSteps = status.remainingSteps.filter((step) => step.startsWith("document_"));
  const nonDocumentSteps = status.remainingSteps.filter((step) => !step.startsWith("document_"));

  if (documentSteps.length > 0 && nonDocumentSteps.length === 0) {
    return {
      title: "Waiting on SLYDE review",
      body: "Your uploaded documents are still being reviewed by SLYDE ops. No action is required from you right now unless our team requests a re-upload.",
      stateKey: "waiting_review",
    } as const;
  }

  if (nonDocumentSteps.length > 0) {
    return {
      title: "Action required from Slyder",
      body: "You still have onboarding items to complete. Sign in to the SLYDE website and continue your legal, setup, or readiness steps.",
      stateKey: "action_required",
    } as const;
  }

  if (status.eligibilityState === "eligible_offline" && status.zoneStatus !== "live") {
    return {
      title: "Ready for zone launch waiting state",
      body: "Your onboarding is complete. Your account is ready, and SLYDE will notify you when your zone goes live.",
      stateKey: "waiting_for_zone",
    } as const;
  }

  return {
    title: "Operational status update",
    body: "Your onboarding is complete and your account is positioned to move forward on the SLYDE network.",
    stateKey: "ready",
  } as const;
}

function getProfilesForZone(store: OnboardingStore, zoneId: string) {
  return store.slyderProfiles.filter((profile) => {
    const application = store.applications.find((item) => item.id === profile.applicationId);
    const applicationZoneId = zoneIdFromText(application?.preferredZones[0] || application?.parish);
    return applicationZoneId === zoneId;
  });
}

export async function onSlyderApplicationSubmitted(store: OnboardingStore, applicationId: string) {
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_application_submitted:${application.id}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_applicant",
    actorId: application.id,
    payload: { applicationCode: application.applicationCode },
  });
  if (isDuplicate) return [];

  const variables = {
    firstName: getApplicationFirstName(store, application.id),
    fullName: application.fullName,
    applicationCode: application.applicationCode,
    zoneName: getApplicationZoneName(store, application.id),
    supportContact: "876-594-7320",
    supportEmail: "info@slyde.app",
    supportPhone: "876-594-7320",
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_application_received_email",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.email,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      variables,
      payload: { applicationCode: application.applicationCode },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `application_received:email:${application.id}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_application_received_whatsapp",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.whatsappNumber || application.phone,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      variables,
      payload: { applicationCode: application.applicationCode },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `application_received:whatsapp:${application.id}`,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onSlyderDocumentsRequested(
  store: OnboardingStore,
  applicationId: string,
  requestedDocumentTypes: string[],
  notes: string,
) {
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_documents_requested:${application.id}:${requestedDocumentTypes.sort().join(",")}:${notes}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_applicant",
    actorId: application.id,
    payload: { requestedDocumentTypes, notes },
  });
  if (isDuplicate) return [];

  const variables = {
    firstName: getApplicationFirstName(store, application.id),
    fullName: application.fullName,
    applicationCode: application.applicationCode,
    requestedItems: requestedDocumentTypes.join(", "),
    reviewReason: notes || "Additional documents are required.",
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_documents_requested_email",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.email,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      variables,
      payload: { requestedDocumentTypes, notes },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `documents_requested:email:${application.id}:${requestedDocumentTypes.sort().join(",")}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_documents_requested_whatsapp",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.whatsappNumber || application.phone,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      variables,
      payload: { requestedDocumentTypes, notes },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `documents_requested:whatsapp:${application.id}:${requestedDocumentTypes.sort().join(",")}`,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onSlyderDocumentsReviewComplete(
  store: OnboardingStore,
  applicationId: string,
  userId: string,
  profileId: string,
  status: SetupStatusResponse,
) {
  const application = store.applications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  const profile = store.slyderProfiles.find((item) => item.id === profileId);
  if (!application || !user || !profile) throw new Error("Linked document review records not found");

  const nextStep = classifySlyderPostReviewState(status);
  const onboardingUrl = `${getWebsiteBaseUrl()}/slyder/onboarding`;
  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_documents_review_complete:${application.id}:${nextStep.stateKey}:${status.zoneStatus || "unknown"}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_user",
    actorId: user.id,
    payload: {
      stateKey: nextStep.stateKey,
      zoneStatus: status.zoneStatus,
      readinessStatus: status.readinessStatus,
      operationalStatus: status.operationalStatus,
    },
  });
  if (isDuplicate) return [];

  const variables = {
    firstName: profile.displayName.split(" ")[0] || application.fullName.split(" ")[0] || "there",
    fullName: profile.displayName || application.fullName,
    zoneName: getApplicationZoneName(store, application.id),
    onboardingUrl,
    nextStepTitle: nextStep.title,
    nextStepBody: nextStep.body,
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_documents_review_complete_email",
      actorType: "slyder_user",
      actorId: user.id,
      recipient: user.email,
      recipientName: profile.displayName || application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId: user.id,
      slyderProfileId: profile.id,
      variables,
      payload: { stateKey: nextStep.stateKey, onboardingUrl },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `documents_review_complete:email:${application.id}:${nextStep.stateKey}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_documents_review_complete_whatsapp",
      actorType: "slyder_user",
      actorId: user.id,
      recipient: application.whatsappNumber || profile.phone,
      recipientName: profile.displayName || application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId: user.id,
      slyderProfileId: profile.id,
      variables,
      payload: { stateKey: nextStep.stateKey, onboardingUrl },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `documents_review_complete:whatsapp:${application.id}:${nextStep.stateKey}`,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onSlyderStatusUpdate(
  store: OnboardingStore,
  applicationId: string,
  userId: string,
  profileId: string,
  status: SetupStatusResponse,
) {
  const application = store.applications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  const profile = store.slyderProfiles.find((item) => item.id === profileId);
  if (!application || !user || !profile) throw new Error("Linked status records not found");

  const current = classifySlyderCurrentStatus(status);
  const onboardingUrl = `${getWebsiteBaseUrl()}/slyder/onboarding`;
  const { event } = createTriggerEvent(store, {
    eventKey: `slyder_status_update:${application.id}:${current.stateKey}:${nowIso()}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_user",
    actorId: user.id,
    payload: {
      stateKey: current.stateKey,
      zoneStatus: status.zoneStatus,
      readinessStatus: status.readinessStatus,
      operationalStatus: status.operationalStatus,
    },
    force: true,
  });

  const variables = {
    firstName: profile.displayName.split(" ")[0] || application.fullName.split(" ")[0] || "there",
    fullName: profile.displayName || application.fullName,
    statusTitle: current.title,
    statusBody: current.body,
    onboardingUrl,
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_status_update_email",
      actorType: "slyder_user",
      actorId: user.id,
      recipient: user.email,
      recipientName: profile.displayName || application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId: user.id,
      slyderProfileId: profile.id,
      variables,
      payload: { stateKey: current.stateKey, onboardingUrl },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      force: true,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_status_update_whatsapp",
      actorType: "slyder_user",
      actorId: user.id,
      recipient: application.whatsappNumber || profile.phone,
      recipientName: profile.displayName || application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId: user.id,
      slyderProfileId: profile.id,
      variables,
      payload: { stateKey: current.stateKey, onboardingUrl },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      force: true,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onSlyderRejected(store: OnboardingStore, applicationId: string, reason: string) {
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_rejected:${application.id}:${reason}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_applicant",
    actorId: application.id,
    payload: { reason },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "slyder_rejected_email",
    actorType: "slyder_applicant",
    actorId: application.id,
    recipient: application.email,
    recipientName: application.fullName,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    applicationId: application.id,
    variables: {
      fullName: application.fullName,
      applicationCode: application.applicationCode,
      reviewReason: reason,
    },
    payload: { reason },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `application_rejected:email:${application.id}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

export async function onSlyderApproved(store: OnboardingStore, applicationId: string, userId: string, profileId: string, activationChannel: string) {
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_approved:${application.id}:${profileId}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: application.id,
    actorType: "slyder_applicant",
    actorId: application.id,
    payload: { userId, profileId, activationChannel },
  });
  if (isDuplicate) return [];

  const variables = {
    firstName: getApplicationFirstName(store, application.id),
    fullName: application.fullName,
    applicationCode: application.applicationCode,
    zoneName: getApplicationZoneName(store, application.id),
    activationChannel,
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_approved_email",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.email,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId,
      slyderProfileId: profileId,
      variables,
      payload: { userId, profileId, activationChannel },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `application_approved:email:${application.id}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "slyder_approved_whatsapp",
      actorType: "slyder_applicant",
      actorId: application.id,
      recipient: application.whatsappNumber || application.phone,
      recipientName: application.fullName,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId,
      slyderProfileId: profileId,
      variables,
      payload: { userId, profileId, activationChannel },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `application_approved:whatsapp:${application.id}`,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onSlyderActivationReady(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
  channel: "email" | "sms" | "whatsapp",
  activationToken: string,
) {
  const application = store.applications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  if (!application || !user) throw new Error("Linked activation records not found");

  const templateKey = channel === "whatsapp" ? "slyder_activation_ready_whatsapp" : "slyder_activation_ready_email";
  const websiteBaseUrl = getWebsiteBaseUrl();
  const activationUrl = `${websiteBaseUrl}/slyder/activate/${activationToken}`;
  const loginUrl = `${websiteBaseUrl}/slyder/login`;
  const onboardingUrl = `${websiteBaseUrl}/slyder/onboarding`;
  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_activation_ready:${userId}:${applicationId}:${channel}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: applicationId,
    actorType: "slyder_user",
    actorId: userId,
    payload: { channel },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey,
    actorType: "slyder_user",
    actorId: userId,
    recipient: channel === "whatsapp" ? application.whatsappNumber || application.phone : user.email,
    recipientName: application.fullName,
    relatedEntityType: "slyder_application",
    relatedEntityId: applicationId,
    applicationId,
    userId,
    variables: {
      fullName: application.fullName,
      activationToken,
      activationUrl,
      loginUrl,
      onboardingUrl,
      zoneName: getApplicationZoneName(store, applicationId),
    },
    payload: { activationToken, activationUrl, loginUrl, onboardingUrl, channel },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `activation_ready:${channel}:${userId}:${applicationId}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

export async function onSlyderActivationCompleted(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
) {
  const application = store.applications.find((item) => item.id === applicationId);
  const user = store.users.find((item) => item.id === userId);
  if (!application || !user) throw new Error("Linked activation completion records not found");

  const websiteBaseUrl = getWebsiteBaseUrl();
  const loginUrl = `${websiteBaseUrl}/slyder/login`;
  const onboardingUrl = `${websiteBaseUrl}/slyder/onboarding/welcome`;
  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `slyder_activation_completed:${userId}:${applicationId}`,
    relatedEntityType: "slyder_application",
    relatedEntityId: applicationId,
    actorType: "slyder_user",
    actorId: userId,
    payload: { loginUrl, onboardingUrl },
  });
  if (isDuplicate) return [];

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "slyder_activation_completed_email",
    actorType: "slyder_user",
    actorId: userId,
    recipient: user.email,
    recipientName: application.fullName,
    relatedEntityType: "slyder_application",
    relatedEntityId: applicationId,
    applicationId,
    userId,
    variables: {
      fullName: application.fullName,
      loginUrl,
      onboardingUrl,
      zoneName: getApplicationZoneName(store, applicationId),
    },
    payload: { loginUrl, onboardingUrl },
    triggerEventId: event.id,
    triggerEventKey: event.eventKey,
    dedupeKey: `activation_completed:email:${userId}:${applicationId}`,
  });

  updateTriggerStatus(store, event.id, result.status === "failed" ? "failed" : "processed", result.failureReason);
  return [result];
}

export async function onSlyderOtpIssued(store: OnboardingStore, userId: string, code: string) {
  const user = store.users.find((item) => item.id === userId);
  if (!user) throw new Error("User not found");

  const liveSmsConfigured = isSmsConfigured();
  const templateKey = liveSmsConfigured ? "slyder_login_otp_sms" : "slyder_login_otp_email";
  const channel = liveSmsConfigured ? "sms" : "email";
  const recipient = liveSmsConfigured ? user.phone : user.email;

  return sendTemplateNotificationInStore(store, {
    templateKey,
    actorType: "slyder_user",
    actorId: userId,
    recipient,
    recipientName: user.fullName,
    variables: {
      fullName: user.fullName,
      otpCode: code,
    },
    payload: { code, purpose: "login_otp", channel },
    dedupeKey: `login_otp:${channel}:${userId}:${code}`,
    force: true,
  });
}

export async function onMerchantInterestSubmitted(store: OnboardingStore, merchantInterestId: string) {
  const merchant = store.merchantInterests.find((item) => item.id === merchantInterestId);
  if (!merchant) throw new Error("Merchant interest not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `merchant_interest_submitted:${merchant.id}`,
    relatedEntityType: "merchant_interest",
    relatedEntityId: merchant.id,
    actorType: "merchant_interest",
    actorId: merchant.id,
    payload: { companyName: merchant.companyName, zoneName: merchant.zoneName },
  });
  if (isDuplicate) return [];

  const variables = {
    contactName: merchant.contactName,
    firstName: getMerchantFirstName(store, merchant.id),
    businessName: merchant.companyName,
    zoneName: merchant.zoneName || merchant.coverageNeeds,
  };

  const results = await Promise.all([
    sendTemplateNotificationInStore(store, {
      templateKey: "merchant_interest_received_email",
      actorType: "merchant_interest",
      actorId: merchant.id,
      recipient: merchant.email,
      recipientName: merchant.contactName,
      relatedEntityType: "merchant_interest",
      relatedEntityId: merchant.id,
      variables,
      payload: { companyName: merchant.companyName },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `merchant_interest_received:email:${merchant.id}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "merchant_interest_received_whatsapp",
      actorType: "merchant_interest",
      actorId: merchant.id,
      recipient: merchant.whatsappNumber || merchant.phone,
      recipientName: merchant.contactName,
      relatedEntityType: "merchant_interest",
      relatedEntityId: merchant.id,
      variables,
      payload: { companyName: merchant.companyName },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `merchant_interest_received:whatsapp:${merchant.id}`,
    }),
    sendTemplateNotificationInStore(store, {
      templateKey: "merchant_waitlist_confirmation_email",
      actorType: "merchant_interest",
      actorId: merchant.id,
      recipient: merchant.email,
      recipientName: merchant.contactName,
      relatedEntityType: "merchant_interest",
      relatedEntityId: merchant.id,
      variables,
      payload: { companyName: merchant.companyName, stage: "waitlist" },
      triggerEventId: event.id,
      triggerEventKey: event.eventKey,
      dedupeKey: `merchant_waitlist_confirmation:email:${merchant.id}`,
    }),
  ]);

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onZoneNearReady(store: OnboardingStore, zoneId: string) {
  const zone = store.coverageZones.find((item) => item.id === zoneId);
  if (!zone) throw new Error("Zone not found");
  const readyProfiles = getProfilesForZone(store, zoneId).filter((profile) => profile.canGoOnline);

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `zone_near_ready:${zone.id}:${readyProfiles.length}`,
    relatedEntityType: "coverage_zone",
    relatedEntityId: zone.id,
    actorType: "admin_user",
    payload: { zoneName: zone.name },
  });
  if (isDuplicate) return [];

  const adminUsers = store.users.filter((user) => user.roles.includes("platform_admin") || user.roles.includes("operations_admin"));
  const results = await Promise.all(
    adminUsers.map((admin) =>
      sendTemplateNotificationInStore(store, {
        templateKey: "admin_zone_near_ready_alert",
        actorType: "admin_user",
        actorId: admin.id,
        recipient: admin.email,
        recipientName: admin.fullName,
        relatedEntityType: "coverage_zone",
        relatedEntityId: zone.id,
        variables: {
          zoneName: zone.name,
          readyCount: readyProfiles.length,
          requiredReadyCount: zone.requiredReadySlyders,
          remainingNeeded: Math.max(zone.requiredReadySlyders - readyProfiles.length, 0),
        },
        payload: { zoneId: zone.id },
        triggerEventId: event.id,
        triggerEventKey: event.eventKey,
        dedupeKey: `admin_zone_near_ready:${zone.id}:${admin.id}`,
      }),
    ),
  );

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function notifySlydersZoneLive(store: OnboardingStore, zoneId: string) {
  const zone = store.coverageZones.find((item) => item.id === zoneId);
  if (!zone) throw new Error("Zone not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `zone_live:slyders:${zone.id}`,
    relatedEntityType: "coverage_zone",
    relatedEntityId: zone.id,
    actorType: "slyder_user",
    payload: { zoneName: zone.name },
  });
  if (isDuplicate) return [];

  const targetProfiles = getProfilesForZone(store, zoneId);
  const results: NotificationRecord[] = [];
  for (const profile of targetProfiles) {
    const application = store.applications.find((item) => item.id === profile.applicationId);
    if (!application) continue;

    results.push(
      await sendTemplateNotificationInStore(store, {
        templateKey: "slyder_zone_live_whatsapp",
        actorType: "slyder_user",
        actorId: profile.userId,
        recipient: application.whatsappNumber || profile.phone,
        recipientName: profile.displayName,
        relatedEntityType: "coverage_zone",
        relatedEntityId: zone.id,
        applicationId: application.id,
        userId: profile.userId,
        slyderProfileId: profile.id,
        variables: {
          fullName: profile.displayName,
          zoneName: zone.name,
        },
        payload: { zoneId: zone.id },
        triggerEventId: event.id,
        triggerEventKey: event.eventKey,
        dedupeKey: `zone_live:slyder:whatsapp:${zone.id}:${profile.id}`,
      }),
    );
    results.push(
      await sendTemplateNotificationInStore(store, {
        templateKey: "slyder_zone_live_email",
        actorType: "slyder_user",
        actorId: profile.userId,
        recipient: profile.email,
        recipientName: profile.displayName,
        relatedEntityType: "coverage_zone",
        relatedEntityId: zone.id,
        applicationId: application.id,
        userId: profile.userId,
        slyderProfileId: profile.id,
        variables: {
          fullName: profile.displayName,
          zoneName: zone.name,
        },
        payload: { zoneId: zone.id },
        triggerEventId: event.id,
        triggerEventKey: event.eventKey,
        dedupeKey: `zone_live:slyder:email:${zone.id}:${profile.id}`,
      }),
    );
  }

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function notifyMerchantWaitlistZoneLive(store: OnboardingStore, zoneId: string) {
  const zone = store.coverageZones.find((item) => item.id === zoneId);
  if (!zone) throw new Error("Zone not found");

  const { event, isDuplicate } = createTriggerEvent(store, {
    eventKey: `zone_live:merchants:${zone.id}`,
    relatedEntityType: "coverage_zone",
    relatedEntityId: zone.id,
    actorType: "merchant_interest",
    payload: { zoneName: zone.name },
  });
  if (isDuplicate) return [];

  const merchants = store.merchantInterests.filter((item) => item.zoneId === zoneId);
  const results: NotificationRecord[] = [];
  for (const merchant of merchants) {
    results.push(
      await sendTemplateNotificationInStore(store, {
        templateKey: "merchant_zone_live_email",
        actorType: "merchant_interest",
        actorId: merchant.id,
        recipient: merchant.email,
        recipientName: merchant.contactName,
        relatedEntityType: "coverage_zone",
        relatedEntityId: zone.id,
        variables: {
          contactName: merchant.contactName,
          businessName: merchant.companyName,
          zoneName: zone.name,
        },
        payload: { zoneId: zone.id },
        triggerEventId: event.id,
        triggerEventKey: event.eventKey,
        dedupeKey: `zone_live:merchant:email:${zone.id}:${merchant.id}`,
      }),
    );
  }

  updateTriggerStatus(store, event.id, results.some((item) => item.status === "failed") ? "partially_processed" : "processed");
  return results;
}

export async function onZoneMarkedLive(store: OnboardingStore, zoneId: string) {
  for (const profile of getProfilesForZone(store, zoneId)) {
    evaluateSlyderOperationalEligibility(store, profile.id);
  }

  const slyderResults = await notifySlydersZoneLive(store, zoneId);
  const merchantResults = await notifyMerchantWaitlistZoneLive(store, zoneId);
  return [...slyderResults, ...merchantResults];
}

export async function sendSlyderApplicationSubmittedNotification(store: OnboardingStore, applicationId: string) {
  return onSlyderApplicationSubmitted(store, applicationId);
}

export async function sendSlyderDocumentsRequestedNotification(store: OnboardingStore, applicationId: string, _userId: string | undefined, requestedDocumentTypes: string[], notes: string) {
  return onSlyderDocumentsRequested(store, applicationId, requestedDocumentTypes, notes);
}

export async function sendSlyderDocumentsReviewCompleteNotification(
  store: OnboardingStore,
  applicationId: string,
  userId: string,
  profileId: string,
  status: SetupStatusResponse,
) {
  return onSlyderDocumentsReviewComplete(store, applicationId, userId, profileId, status);
}

export async function sendSlyderStatusUpdateNotification(
  store: OnboardingStore,
  applicationId: string,
  userId: string,
  profileId: string,
  status: SetupStatusResponse,
) {
  return onSlyderStatusUpdate(store, applicationId, userId, profileId, status);
}

export async function sendSlyderApprovedNotification(store: OnboardingStore, applicationId: string, userId: string, profileId: string, activationChannel = "email") {
  return onSlyderApproved(store, applicationId, userId, profileId, activationChannel);
}

export async function sendSlyderRejectedNotification(store: OnboardingStore, applicationId: string, reason: string) {
  return onSlyderRejected(store, applicationId, reason);
}

export async function sendSlyderActivationNotification(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
  channel: "email" | "sms" | "whatsapp",
  activationToken: string,
) {
  return onSlyderActivationReady(store, userId, applicationId, channel, activationToken);
}

export async function sendSlyderActivationCompletedNotification(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
) {
  return onSlyderActivationCompleted(store, userId, applicationId);
}

export async function sendSlyderOtpNotification(store: OnboardingStore, userId: string, code: string) {
  return onSlyderOtpIssued(store, userId, code);
}
