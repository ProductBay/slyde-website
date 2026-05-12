import { findApplication, findLatestActivationTokenForUser, findProfileByUserId, findUserById, upsertSlyderProfile, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import { evaluateSlyderOperationalEligibility } from "@/modules/onboarding/services/readiness.service";
import type { LegalDocumentType, OnboardingStore, SetupStatusResponse } from "@/types/backend/onboarding";
import type {
  CompleteSetupInput,
  SlyderActivationLegalAcceptanceInput,
  SlyderReadinessUpdateInput,
  SlyderSetupUpdateInput,
} from "@/modules/onboarding/schemas/onboarding.schemas";
import {
  getActiveLegalDocumentByType,
  getPendingUpdatedLegalDocs,
  recordMultipleLegalAcceptancesInStore,
} from "@/modules/legal/services/legal-document.service";
import { appendAuditEvent } from "@/server/audit/audit.service";
import { generateOpaqueToken, hashToken } from "@/server/auth/tokens";
import {
  getNotificationHistoryForEntityInStore,
  sendSlyderActivationNotification,
  sendSlyderStatusUpdateNotification,
  sendTemplateNotificationInStore,
} from "@/server/notifications/notification.service";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import {
  buildSlydeAppLifecycleEventPayload,
  type SlydeAppLifecycleEventPayload,
} from "@/modules/onboarding/services/slyde-app-sync.service";
import { enqueueSlydeAppLifecycleSyncEvents, processPendingSlydeAppSyncQueue } from "@/modules/onboarding/services/slyde-app-sync-queue.service";

function nowIso() {
  return new Date().toISOString();
}

async function queueLifecycleSyncEvents(events: SlydeAppLifecycleEventPayload[]) {
  if (events.length === 0) return;

  try {
    await enqueueSlydeAppLifecycleSyncEvents(events);
    void processPendingSlydeAppSyncQueue({ batchSize: 10 });
  } catch (error) {
    console.error("[slyder-onboarding.service] lifecycle sync queue failed", {
      eventTypes: events.map((event) => event.eventType),
      applicationIds: Array.from(new Set(events.map((event) => event.applicationId))),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function userControlledCompletionReached(status: SetupStatusResponse) {
  return (
    Boolean(status.activationCompleted) &&
    (status.pendingLegalDocuments?.length ?? 0) === 0 &&
    Boolean(status.setupCompletedAt) &&
    status.readinessChecklist.overallStatus === "passed"
  );
}

function mapPendingDocuments(documents: Array<{ id: string; title: string; slug: string; version: string; documentType: LegalDocumentType }>) {
  return documents.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    version: item.version,
    documentType: item.documentType,
  }));
}

async function getPendingActivationLegalDocuments(userId: string) {
  const pending = await getPendingUpdatedLegalDocs("slyder_user", userId);
  const activationDoc = await getActiveLegalDocumentByType("slyder_activation_terms");
  const filtered = pending.filter((item) => ["slyder_activation_terms", "slyder_privacy_notice"].includes(item.documentType));

  if (activationDoc && !filtered.some((item) => item.documentType === activationDoc.documentType)) {
    const store = await readPersistenceStore();
    const accepted = store.legalAcceptances.some(
      (item) =>
        item.actorType === "slyder_user" &&
        item.actorId === userId &&
        item.documentType === activationDoc.documentType &&
        item.documentVersion === activationDoc.version,
    );
    if (!accepted) filtered.unshift(activationDoc);
  }

  return mapPendingDocuments(filtered);
}

function getPendingActivationLegalDocumentsFromStore(store: OnboardingStore, userId: string) {
  const actorAcceptances = store.legalAcceptances.filter((item) => item.actorType === "slyder_user" && item.actorId === userId);

  return mapPendingDocuments(
    store.legalDocuments.filter((document) => {
      if (!document.isActive || document.status !== "published") return false;
      if (!["slyder_activation_terms", "slyder_privacy_notice"].includes(document.documentType)) return false;
      if (!document.actorScopes.includes("slyder_user")) return false;

      return !actorAcceptances.some(
        (acceptance) =>
          acceptance.documentType === document.documentType &&
          acceptance.documentVersion === document.version,
      );
    }),
  );
}

function buildCompletionSummary(status: {
  eligibilityState: "eligible_online" | "eligible_offline" | "setup_incomplete" | "blocked";
}) {
  if (status.eligibilityState === "eligible_online") {
    return {
      headline: "You're ready to go online",
      body: "Your activation, legal acceptance, setup, and readiness are complete. Your zone is live and your account can begin receiving delivery work.",
    };
  }

  if (status.eligibilityState === "eligible_offline") {
    return {
      headline: "You're fully onboarded",
      body: "Your account is fully ready, but your zone is not live yet. SLYDE will notify you as soon as deliveries open in your area.",
    };
  }

  return {
    headline: "Almost there",
    body: "You still have setup or readiness items to complete before SLYDE can enable your account for operations.",
  };
}

async function sendSlyderOnboardingCompletedEmailIfNeeded(
  store: OnboardingStore,
  userId: string,
  status: SetupStatusResponse,
) {
  const user = findUserById(store, userId);
  const profile = findProfileByUserId(store, userId);
  if (!user || !profile) {
    return;
  }

  const application = findApplication(store, profile.applicationId);
  if (!application) {
    return;
  }

  if (!userControlledCompletionReached(status)) {
    return;
  }

  const websiteBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://slydenetwork.com";
  const onboardingUrl = `${websiteBaseUrl}/slyder/onboarding/welcome`;
  const reviewUrl = `${websiteBaseUrl}/admin/slyder-applications/${application.id}`;
  const completionSummary = buildCompletionSummary(status);

  const result = await sendTemplateNotificationInStore(store, {
    templateKey: "slyder_onboarding_completed_email",
    actorType: "slyder_user",
    actorId: user.id,
    userId: user.id,
    slyderProfileId: profile.id,
    applicationId: application.id,
    relatedEntityType: "slyder_profile",
    relatedEntityId: profile.id,
    recipient: user.email,
    recipientName: profile.displayName,
    variables: {
      fullName: profile.displayName,
      completionHeadline: completionSummary.headline,
      completionBody: completionSummary.body,
      zoneName: status.zoneName || application.preferredZones[0] || application.parish,
      onboardingUrl,
    },
    payload: {
      onboardingUrl,
      completionHeadline: completionSummary.headline,
      completionBody: completionSummary.body,
      eligibilityState: status.eligibilityState,
    },
    dedupeKey: `slyder_onboarding_completed:email:${user.id}:${application.id}`,
  });

  const adminUsers = store.users.filter(
    (candidate) => candidate.roles.includes("platform_admin") || candidate.roles.includes("operations_admin"),
  );
  for (const admin of adminUsers) {
    await sendTemplateNotificationInStore(store, {
      templateKey: "admin_slyder_onboarding_completed_email",
      actorType: "admin_user",
      actorId: admin.id,
      relatedEntityType: "slyder_application",
      relatedEntityId: application.id,
      applicationId: application.id,
      userId: user.id,
      slyderProfileId: profile.id,
      recipient: admin.email,
      recipientName: admin.fullName,
      variables: {
        adminName: admin.fullName,
        fullName: profile.displayName,
        applicationCode: application.applicationCode,
        completionHeadline: completionSummary.headline,
        completionBody: completionSummary.body,
        zoneName: status.zoneName || application.preferredZones[0] || application.parish,
        reviewUrl,
      },
      payload: {
        reviewUrl,
        applicationId: application.id,
        slyderProfileId: profile.id,
        eligibilityState: status.eligibilityState,
      },
      dedupeKey: `admin_slyder_onboarding_completed:email:${application.id}:${admin.id}`,
    });
  }

  appendAuditEvent(store, {
    entityType: "slyder_profile",
    entityId: profile.id,
    eventType: "onboarding_completed_email_sent",
    actorUserId: user.id,
    metadata: { notificationId: result.id, applicationId: application.id },
  });
}

export async function getSlyderOnboardingStatus(userId: string) {
  const store = await readPersistenceStore();
  const user = findUserById(store, userId);
  if (!user) throw new Error("Slyder user not found");

  const profile = findProfileByUserId(store, userId);
  if (!profile) throw new Error("Slyder profile not found");

    const pendingLegalDocuments = getPendingActivationLegalDocumentsFromStore(store, userId);
  const status = evaluateSlyderOperationalEligibility(store, profile.id, pendingLegalDocuments);
  const application = findApplication(store, profile.applicationId);
  const notifications = getNotificationHistoryForEntityInStore(store, "slyder_profile", profile.id).slice(0, 10);

  return {
    ...status,
    applicationCode: application?.applicationCode,
    applicationStatus: application?.applicationStatus,
    applicationSubmittedAt: application?.submittedAt,
    applicationReviewedAt: application?.reviewedAt,
    applicationReviewNotes: application?.reviewNotes,
    applicationRequestedDocumentNotes: application?.requestedDocumentNotes,
    displayName: profile.displayName,
    email: profile.email,
    phone: profile.phone,
    courierType: profile.courierType,
    zoneWaiting: status.zoneStatus !== "live",
    notifications,
    completionSummary: buildCompletionSummary(status),
  };
}

export async function getSlyderOnboardingRequiredLegalDocs(userId: string) {
  return getPendingActivationLegalDocuments(userId);
}

export async function acceptSlyderActivationLegal(
  userId: string,
  input: SlyderActivationLegalAcceptanceInput,
  metadata?: { ipAddress?: string; userAgent?: string },
) {
  const result = await withPersistenceTransaction(async (store) => {
    const user = findUserById(store, userId);
    const profile = findProfileByUserId(store, userId);
    if (!user || !profile) throw new Error("Slyder activation context not found");
    const previousOnboardingStatus = profile.onboardingStatus;

    await recordMultipleLegalAcceptancesInStore(store, {
      actorType: "slyder_user",
      actorId: userId,
      context: "slyder_activation",
      acceptedDocumentTypes: input.acceptedDocumentTypes,
      acceptanceSource: "activation_flow",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata: {
        understandZoneDependency: input.understandZoneDependency,
        understandSetupRequired: input.understandSetupRequired,
      },
    });

    const privacyDoc = store.legalDocuments.find(
      (item) => item.documentType === "slyder_privacy_notice" && item.isActive && item.status === "published",
    );
    if (privacyDoc && input.acceptedDocumentTypes.includes("slyder_privacy_notice")) {
      const existingPrivacyAcceptance = store.legalAcceptances.find(
        (item) =>
          item.actorType === "slyder_user" &&
          item.actorId === userId &&
          item.documentType === "slyder_privacy_notice" &&
          item.documentVersion === privacyDoc.version,
      );

      if (!existingPrivacyAcceptance) {
        store.legalAcceptances.push({
          id: crypto.randomUUID(),
          actorType: "slyder_user",
          actorId: userId,
          documentId: privacyDoc.id,
          documentType: privacyDoc.documentType,
          documentTitleSnapshot: privacyDoc.title,
          documentVersion: privacyDoc.version,
          acceptedAt: nowIso(),
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          acceptanceSource: "activation_flow",
          checkboxLabelSnapshot: "I have read the applicable SLYDE Privacy Notice.",
          metadata: { acceptedDuring: "slyder_activation" },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
    }

    profile.contractAccepted = true;
    profile.contractAcceptedAt = nowIso();
    profile.requiredAgreementsAccepted = true;
    profile.onboardingStatus = "setup_incomplete";
    profile.readinessChecklist = profile.readinessChecklist || {
      profileConfirmed: false,
      vehicleConfirmed: false,
      payoutConfigured: false,
      legalAccepted: true,
      locationPermissionConfirmed: false,
      notificationPermissionConfirmed: false,
      equipmentConfirmed: false,
      trainingAcknowledged: false,
      emergencyContactConfirmed: false,
      overallStatus: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    profile.readinessChecklist.legalAccepted = true;
    profile.readinessChecklist.updatedAt = nowIso();
    profile.updatedAt = nowIso();
    upsertSlyderProfile(store, profile);

    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "activation_legal_accepted",
      actorUserId: userId,
      actorLabel: profile.displayName,
      metadata: { acceptedDocumentTypes: input.acceptedDocumentTypes },
    });

    const status = evaluateSlyderOperationalEligibility(store, profile.id, getPendingActivationLegalDocumentsFromStore(store, userId));
    const application = findApplication(store, profile.applicationId);
    const lifecycleEvents: SlydeAppLifecycleEventPayload[] = [];

    if (application) {
      lifecycleEvents.push(
        buildSlydeAppLifecycleEventPayload({
          store,
          eventType: "slyder_legal_accepted",
          applicationId: application.id,
          userId,
          profileId: profile.id,
          status,
          metadata: {
            acceptedDocumentTypes: input.acceptedDocumentTypes,
            understandZoneDependency: input.understandZoneDependency,
            understandSetupRequired: input.understandSetupRequired,
          },
        }),
      );

      if (previousOnboardingStatus !== status.onboardingStatus) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_state_changed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: {
              previousOnboardingStatus,
              onboardingStatus: status.onboardingStatus,
              trigger: "legal_acceptance",
            },
          }),
        );
      }

      if (userControlledCompletionReached(status)) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_completed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: { trigger: "legal_acceptance" },
          }),
        );
      }
    }

    return { status, lifecycleEvents };
  });

  await queueLifecycleSyncEvents(result.lifecycleEvents);
  return result.status;
}

export async function updateSlyderOnboardingSetup(userId: string, payload: SlyderSetupUpdateInput | CompleteSetupInput) {
  const result = await withPersistenceTransaction(async (store) => {
    const profile = findProfileByUserId(store, userId);
    if (!profile) throw new Error("Slyder profile not found");
    const previousOnboardingStatus = profile.onboardingStatus;

    if (payload.profileComplete !== undefined) profile.profileComplete = payload.profileComplete;
    if (payload.payoutSetupComplete !== undefined) profile.payoutSetupComplete = payload.payoutSetupComplete;
    if (payload.vehicleVerified !== undefined) profile.vehicleVerified = payload.vehicleVerified;
    if (payload.permissionsComplete !== undefined) profile.permissionsComplete = payload.permissionsComplete;
    if (payload.requiredAgreementsAccepted !== undefined) profile.requiredAgreementsAccepted = payload.requiredAgreementsAccepted;
    if ("coverageZoneId" in payload && payload.coverageZoneId !== undefined) profile.coverageZoneId = payload.coverageZoneId;

    profile.readinessChecklist = profile.readinessChecklist || {
      profileConfirmed: false,
      vehicleConfirmed: false,
      payoutConfigured: false,
      legalAccepted: profile.contractAccepted,
      locationPermissionConfirmed: false,
      notificationPermissionConfirmed: false,
      equipmentConfirmed: false,
      trainingAcknowledged: profile.trainingComplete,
      emergencyContactConfirmed: false,
      overallStatus: "not_started",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    if (payload.profileComplete !== undefined) profile.readinessChecklist.profileConfirmed = payload.profileComplete;
    if (payload.vehicleVerified !== undefined) profile.readinessChecklist.vehicleConfirmed = payload.vehicleVerified;
    if (payload.payoutSetupComplete !== undefined) profile.readinessChecklist.payoutConfigured = payload.payoutSetupComplete;
    if ("emergencyContactConfirmed" in payload && payload.emergencyContactConfirmed !== undefined) {
      profile.readinessChecklist.emergencyContactConfirmed = payload.emergencyContactConfirmed;
    }
    profile.readinessChecklist.updatedAt = nowIso();

    profile.updatedAt = nowIso();
    upsertSlyderProfile(store, profile);

    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "setup_updated",
      actorUserId: userId,
      metadata: payload as Record<string, unknown>,
    });

    const status = evaluateSlyderOperationalEligibility(store, profile.id, getPendingActivationLegalDocumentsFromStore(store, userId));
    await sendSlyderOnboardingCompletedEmailIfNeeded(store, userId, status);
    const application = findApplication(store, profile.applicationId);
    const lifecycleEvents: SlydeAppLifecycleEventPayload[] = [];

    if (application) {
      lifecycleEvents.push(
        buildSlydeAppLifecycleEventPayload({
          store,
          eventType: "slyder_setup_updated",
          applicationId: application.id,
          userId,
          profileId: profile.id,
          status,
          metadata: { updatedFields: Object.keys(payload) },
        }),
      );

      if (previousOnboardingStatus !== status.onboardingStatus) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_state_changed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: {
              previousOnboardingStatus,
              onboardingStatus: status.onboardingStatus,
              trigger: "setup_update",
            },
          }),
        );
      }

      if (userControlledCompletionReached(status)) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_completed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: { trigger: "setup_update" },
          }),
        );
      }
    }

    return { status, lifecycleEvents };
  });

  await queueLifecycleSyncEvents(result.lifecycleEvents);
  return result.status;
}

export async function completeSlyderOnboardingSetup(userId: string) {
  const status = await updateSlyderOnboardingSetup(userId, {
    profileComplete: true,
    requiredAgreementsAccepted: true,
    permissionsComplete: true,
  });

  return status;
}

export async function updateSlyderReadiness(userId: string, payload: SlyderReadinessUpdateInput) {
  const result = await withPersistenceTransaction(async (store) => {
    const profile = findProfileByUserId(store, userId);
    if (!profile) throw new Error("Slyder profile not found");
    const previousOnboardingStatus = profile.onboardingStatus;

    profile.readinessChecklist = profile.readinessChecklist || {
      profileConfirmed: profile.profileComplete,
      vehicleConfirmed: profile.vehicleVerified,
      payoutConfigured: profile.payoutSetupComplete,
      legalAccepted: profile.contractAccepted,
      locationPermissionConfirmed: false,
      notificationPermissionConfirmed: false,
      equipmentConfirmed: false,
      trainingAcknowledged: profile.trainingComplete,
      emergencyContactConfirmed: false,
      overallStatus: "not_started",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    if (payload.locationPermissionConfirmed !== undefined) {
      profile.readinessChecklist.locationPermissionConfirmed = payload.locationPermissionConfirmed;
    }
    if (payload.notificationPermissionConfirmed !== undefined) {
      profile.readinessChecklist.notificationPermissionConfirmed = payload.notificationPermissionConfirmed;
    }
    if (payload.equipmentConfirmed !== undefined) {
      profile.readinessChecklist.equipmentConfirmed = payload.equipmentConfirmed;
    }
    if (payload.trainingComplete !== undefined) {
      profile.trainingComplete = payload.trainingComplete;
      profile.readinessChecklist.trainingAcknowledged = payload.trainingComplete;
    }
    if (payload.trainingAcknowledgedAt) {
      profile.trainingAcknowledgedAt = payload.trainingAcknowledgedAt;
    } else if (payload.trainingComplete) {
      profile.trainingAcknowledgedAt = nowIso();
    }
    if (payload.profileConfirmed !== undefined) {
      profile.readinessChecklist.profileConfirmed = payload.profileConfirmed;
      profile.profileComplete = payload.profileConfirmed;
    }
    if (payload.vehicleConfirmed !== undefined) {
      profile.readinessChecklist.vehicleConfirmed = payload.vehicleConfirmed;
      profile.vehicleVerified = payload.vehicleConfirmed;
    }
    if (payload.payoutConfigured !== undefined) {
      profile.readinessChecklist.payoutConfigured = payload.payoutConfigured;
      profile.payoutSetupComplete = payload.payoutConfigured;
    }
    if (payload.legalAccepted !== undefined) {
      profile.readinessChecklist.legalAccepted = payload.legalAccepted;
      profile.contractAccepted = payload.legalAccepted;
    }
    if (payload.emergencyContactConfirmed !== undefined) {
      profile.readinessChecklist.emergencyContactConfirmed = payload.emergencyContactConfirmed;
    }

    profile.readinessChecklist.updatedAt = nowIso();
    profile.updatedAt = nowIso();
    upsertSlyderProfile(store, profile);

    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "readiness_updated",
      actorUserId: userId,
      metadata: payload as Record<string, unknown>,
    });

    const status = evaluateSlyderOperationalEligibility(store, profile.id, getPendingActivationLegalDocumentsFromStore(store, userId));
    await sendSlyderOnboardingCompletedEmailIfNeeded(store, userId, status);
    const application = findApplication(store, profile.applicationId);
    const lifecycleEvents: SlydeAppLifecycleEventPayload[] = [];

    if (application) {
      lifecycleEvents.push(
        buildSlydeAppLifecycleEventPayload({
          store,
          eventType: "slyder_readiness_updated",
          applicationId: application.id,
          userId,
          profileId: profile.id,
          status,
          metadata: { updatedFields: Object.keys(payload) },
        }),
      );

      if (previousOnboardingStatus !== status.onboardingStatus) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_state_changed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: {
              previousOnboardingStatus,
              onboardingStatus: status.onboardingStatus,
              trigger: "readiness_update",
            },
          }),
        );
      }

      if (userControlledCompletionReached(status)) {
        lifecycleEvents.push(
          buildSlydeAppLifecycleEventPayload({
            store,
            eventType: "slyder_onboarding_completed",
            applicationId: application.id,
            userId,
            profileId: profile.id,
            status,
            metadata: { trigger: "readiness_update" },
          }),
        );
      }
    }

    return { status, lifecycleEvents };
  });

  await queueLifecycleSyncEvents(result.lifecycleEvents);
  return result.status;
}

export async function completeSlyderReadiness(userId: string) {
  const status = await updateSlyderReadiness(userId, {
    locationPermissionConfirmed: true,
    notificationPermissionConfirmed: true,
    equipmentConfirmed: true,
    trainingComplete: true,
    profileConfirmed: true,
    vehicleConfirmed: true,
    payoutConfigured: true,
    legalAccepted: true,
    emergencyContactConfirmed: true,
    trainingAcknowledgedAt: nowIso(),
  });

  return status;
}

export async function evaluateSlyderEligibilityForUser(userId: string) {
  const result = await withPersistenceTransaction(async (store) => {
    const profile = findProfileByUserId(store, userId);
    if (!profile) throw new Error("Slyder profile not found");
    const previousOnboardingStatus = profile.onboardingStatus;
    const status = evaluateSlyderOperationalEligibility(store, profile.id, getPendingActivationLegalDocumentsFromStore(store, userId));
    const application = findApplication(store, profile.applicationId);
    const lifecycleEvents: SlydeAppLifecycleEventPayload[] = [];

    if (application && previousOnboardingStatus !== status.onboardingStatus) {
      lifecycleEvents.push(
        buildSlydeAppLifecycleEventPayload({
          store,
          eventType: "slyder_onboarding_state_changed",
          applicationId: application.id,
          userId,
          profileId: profile.id,
          status,
          metadata: {
            previousOnboardingStatus,
            onboardingStatus: status.onboardingStatus,
            trigger: "eligibility_recalculation",
          },
        }),
      );
    }

    return { status, lifecycleEvents };
  });

  await queueLifecycleSyncEvents(result.lifecycleEvents);
  return result.status;
}

export async function resendSlyderActivationInvite(userId: string, channel: "email" | "sms" | "whatsapp" = "email") {
  return withPersistenceTransaction(async (store) => {
    const user = findUserById(store, userId);
    const profile = findProfileByUserId(store, userId);
    if (!user || !profile) throw new Error("Slyder activation context not found");

    const application = findApplication(store, profile.applicationId);
    if (!application) throw new Error("Linked application not found");

    const latest = findLatestActivationTokenForUser(store, userId);
    if (latest && !latest.consumedAt && new Date(latest.expiresAt) > new Date()) {
      await sendSlyderActivationNotification(store, userId, application.id, channel, "existing-token-hidden");
      appendAuditEvent(store, {
        entityType: "user",
        entityId: userId,
        eventType: "activation_invite_resent",
        actorUserId: userId,
        metadata: { channel, reusedToken: true },
      });
      return { resent: true, channel, reusedToken: true };
    }

    const token = generateOpaqueToken();
    store.activationTokens.push({
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token),
      deliveryChannel: channel,
      status: "issued",
      issuedAt: nowIso(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    await sendSlyderActivationNotification(store, userId, application.id, channel, token);
    appendAuditEvent(store, {
      entityType: "user",
      entityId: userId,
      eventType: "activation_invite_resent",
      actorUserId: userId,
      metadata: { channel, reusedToken: false },
    });

    return { resent: true, channel, reusedToken: false };
  });
}

export async function sendSlyderActivationReminder(userId: string) {
  return withPersistenceTransaction(async (store) => {
    const user = findUserById(store, userId);
    const profile = findProfileByUserId(store, userId);
    if (!user || !profile) throw new Error("Slyder activation context not found");

    const latest = findLatestActivationTokenForUser(store, userId);
    if (!latest || latest.consumedAt || new Date(latest.expiresAt) <= new Date()) {
      throw new Error("No active activation invite is available");
    }

    const application = findApplication(store, profile.applicationId);
    if (!application) throw new Error("Linked application not found");

    const result = await sendTemplateNotificationInStore(store, {
      templateKey: "slyder_activation_ready_email",
      actorType: "slyder_user",
      actorId: user.id,
      userId: user.id,
      slyderProfileId: profile.id,
      applicationId: application.id,
      relatedEntityType: "slyder_profile",
      relatedEntityId: profile.id,
      recipient: user.email,
      recipientName: profile.displayName,
      variables: {
        fullName: profile.displayName,
        activationToken: "existing-token-hidden",
        zoneName: application.preferredZones[0] || application.parish,
      },
      payload: { reminder: true },
      dedupeKey: `activation_reminder:${user.id}:${latest.id}:${new Date().toISOString().slice(0, 10)}`,
      force: true,
    });

    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "activation_reminder_sent",
      actorUserId: user.id,
      metadata: { notificationId: result.id },
    });

    return result;
  });
}

export async function resendSlyderStatusUpdate(userId: string) {
  return withPersistenceTransaction(async (store) => {
    const user = findUserById(store, userId);
    const profile = findProfileByUserId(store, userId);
    if (!user || !profile) throw new Error("Slyder onboarding context not found");

    const application = findApplication(store, profile.applicationId);
    if (!application) throw new Error("Linked application not found");

    const status = evaluateSlyderOperationalEligibility(store, profile.id, getPendingActivationLegalDocumentsFromStore(store, userId));
    await sendSlyderStatusUpdateNotification(store, application.id, user.id, profile.id, status);

    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "status_update_resent",
      actorUserId: user.id,
      metadata: { applicationId: application.id },
    });

    return { resent: true };
  });
}

