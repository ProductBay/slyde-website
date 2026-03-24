import {
  attachApplication,
  findApplication,
  findProfileByApplicationId,
  findProfileByUserId,
  findLatestActivationTokenForUser,
  findUserByEmailAndPhone,
  findUserByEmailOrPhone,
  findUserById,
  getApplicationVehicle,
  upsertSlyderProfile,
  upsertUser,
} from "@/modules/onboarding/repositories/onboarding.repository";
import type {
  ApplicationStatus,
  DocumentType,
  ReferralAttribution,
  OnboardingStore,
  StoredUser,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderApplicationVehicle,
  SlyderProfile,
} from "@/types/backend/onboarding";
import { appendAuditEvent } from "@/server/audit/audit.service";
import {
  sendSlyderActivationNotification,
  sendSlyderApplicationSubmittedNotification,
  sendSlyderApprovedNotification,
  sendSlyderDocumentsReviewCompleteNotification,
  sendSlyderDocumentsRequestedNotification,
  sendSlyderRejectedNotification,
} from "@/server/notifications/notification.service";
import { withStoreTransaction, readStore } from "@/server/persistence/store";
import { hashToken, generateOpaqueToken } from "@/server/auth/tokens";
import type {
  ApproveApplicationInput,
  PublicSlyderApplicationInput,
  RequestDocumentsInput,
} from "@/modules/onboarding/schemas/onboarding.schemas";
import { evaluateReadinessForProfile } from "@/modules/onboarding/services/readiness.service";
import {
  canApproveApplication,
  courierNeedsVehicle,
  getApplicationDocuments,
  normalizeEmail,
  normalizePhone,
  requiredDocumentTypesForApplication,
  type AdminActor,
} from "@/modules/onboarding/services/onboarding-rules.service";
import { recordMultipleLegalAcceptancesInStore } from "@/modules/legal/services/legal-document.service";
import type { SyncedSlydeAppApplication } from "@/modules/onboarding/services/slyde-app-sync.service";
import { getPersistenceDriver } from "@/server/persistence/repository";
import {
  createPublicApplicationInPrisma,
  findRecentPublicApplicationInPrisma,
  updateApplicationDocumentInPrisma,
  updatePublicApplicationLinksInPrisma,
} from "@/modules/onboarding/repositories/prisma-public-application.repository";

function nowIso() {
  return new Date().toISOString();
}

function applicationCode() {
  return `SLY-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function documentTypeMap(): Record<string, DocumentType> {
  return {
    nationalId: "national_id",
    driversLicense: "drivers_license",
    vehicleRegistration: "registration",
    insurance: "insurance",
    fitness: "fitness",
    profilePhoto: "profile_photo",
    supporting: "other",
  };
}

function buildVehicle(applicationId: string, input: PublicSlyderApplicationInput): SlyderApplicationVehicle | undefined {
  if (!Object.values(input.vehicle).some(Boolean)) return undefined;
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    applicationId,
    ...input.vehicle,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function buildDocuments(applicationId: string, input: PublicSlyderApplicationInput): SlyderApplicationDocument[] {
  const typeMap = documentTypeMap();
  return Object.entries(input.documents).flatMap(([key, files]) =>
    files.map((file) => {
      const type = typeMap[key] ?? "other";
      if (!file.storageKey || !file.fileUrl) {
        throw new Error(`Uploaded document metadata is incomplete for ${file.name}. Upload must finish before submission.`);
      }

      return {
        id: crypto.randomUUID(),
        applicationId,
        type,
        fileUrl: file.fileUrl,
        storageKey: file.storageKey,
        fileName: file.name,
        mimeType: file.type,
        verificationStatus: "pending",
        uploadedAt: nowIso(),
      };
    }),
  );
}

export async function createPublicSlyderApplication(
  input: PublicSlyderApplicationInput,
  metadata?: { ipAddress?: string; userAgent?: string },
  syncResult?: SyncedSlydeAppApplication,
) {
  return withStoreTransaction(async (store) => {
    const persistenceDriver = getPersistenceDriver();
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedPhone = normalizePhone(input.phone);
    const existingPrisma =
      persistenceDriver === "prisma" ? await findRecentPublicApplicationInPrisma(input.email, input.phone) : null;

    const existingRecent = store.applications.find(
      (item) =>
        normalizeEmail(item.email) === normalizedEmail &&
        normalizePhone(item.phone) === normalizedPhone &&
        item.applicationStatus !== "rejected",
    );

    if (existingRecent) {
      if (syncResult) {
        existingRecent.linkedUserId = syncResult.userId;
        existingRecent.linkedSlyderProfileId = syncResult.slyderId;
        existingRecent.updatedAt = nowIso();

        if (persistenceDriver === "prisma") {
          await updatePublicApplicationLinksInPrisma(existingRecent.id, {
            linkedUserId: syncResult.userId,
            linkedSlyderProfileId: syncResult.slyderId,
          });
        }
      }

      return {
        applicationId: existingRecent.id,
        applicationCode: existingRecent.applicationCode,
        applicationStatus: existingRecent.applicationStatus,
        submittedAt: existingRecent.submittedAt,
        linkedUserId: existingRecent.linkedUserId,
        linkedSlyderProfileId: existingRecent.linkedSlyderProfileId,
      };
    }

    if (existingPrisma) {
      if (syncResult) {
        await updatePublicApplicationLinksInPrisma(existingPrisma.id, {
          linkedUserId: syncResult.userId,
          linkedSlyderProfileId: syncResult.slyderId,
        });
      }

      return {
        applicationId: existingPrisma.id,
        applicationCode: existingPrisma.applicationCode,
        applicationStatus: existingPrisma.applicationStatus,
        submittedAt: existingPrisma.submittedAt.toISOString(),
        linkedUserId: syncResult?.userId ?? existingPrisma.linkedUserId ?? undefined,
        linkedSlyderProfileId: syncResult?.slyderId ?? existingPrisma.linkedSlyderProfileId ?? undefined,
      };
    }

    const timestamp = nowIso();
    const applicationId = crypto.randomUUID();
    const code = applicationCode();

    const application: SlyderApplication = {
      id: applicationId,
      applicationCode: code,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      parish: input.parish,
      address: input.address,
      trn: input.trn,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      courierType: input.courierType,
      workTypePreference: input.workTypePreference,
      availability: input.availability,
      preferredZones: input.preferredZones,
      deliveryTypePreferences: input.deliveryTypePreferences,
      maxTravelComfort: input.maxTravelComfort,
      peakHours: input.peakHours,
      smartphoneType: input.smartphoneType,
      whatsappNumber: input.whatsappNumber,
      gpsConfirmed: input.gpsConfirmed,
      internetConfirmed: input.internetConfirmed,
      readinessAnswers: {
        ...input.readinessAnswers,
        referralAttribution: input.referral ?? null,
      },
      agreementsAccepted: input.agreementsAccepted,
      referralAttribution: input.referral as ReferralAttribution | undefined,
      applicationStatus: "submitted",
      accountStatus: "not_created",
      operationalStatus: "setup_incomplete",
      readinessStatus: "not_started",
      submittedAt: timestamp,
      linkedUserId: syncResult?.userId,
      linkedSlyderProfileId: syncResult?.slyderId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const vehicle = buildVehicle(applicationId, input);
    const documents = buildDocuments(applicationId, input);

    if (persistenceDriver === "prisma") {
      await createPublicApplicationInPrisma(application, vehicle, documents);
    }

    attachApplication(store, application, vehicle, documents);
    appendAuditEvent(store, {
      entityType: "application",
      entityId: applicationId,
      eventType: "application_submitted",
      metadata: { applicationCode: code },
    });
    await sendSlyderApplicationSubmittedNotification(store, applicationId);

    await recordMultipleLegalAcceptancesInStore(store, {
      actorType: "slyder_applicant",
      actorId: applicationId,
      context: "slyder_application",
      acceptedDocumentTypes: ["slyder_privacy_notice", "slyder_onboarding_terms"],
      acceptanceSource: "website_form",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata: { applicationCode: code },
    });

    return {
      applicationId,
      applicationCode: code,
      applicationStatus: application.applicationStatus,
      submittedAt: application.submittedAt,
      linkedUserId: application.linkedUserId,
      linkedSlyderProfileId: application.linkedSlyderProfileId,
    };
  });
}

export async function linkPublicSlyderApplicationToSyncedApp(
  applicationId: string,
  syncResult: SyncedSlydeAppApplication,
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) {
      throw new Error("Application not found for sync linking.");
    }

    application.linkedUserId = syncResult.userId;
    application.linkedSlyderProfileId = syncResult.slyderId;
    application.updatedAt = nowIso();

    if (getPersistenceDriver() === "prisma") {
      await updatePublicApplicationLinksInPrisma(applicationId, {
        linkedUserId: syncResult.userId,
        linkedSlyderProfileId: syncResult.slyderId,
      });
    }

    appendAuditEvent(store, {
      entityType: "application",
      entityId: applicationId,
      eventType: "application_synced_to_slyde_app",
      metadata: {
        linkedUserId: syncResult.userId,
        linkedSlyderProfileId: syncResult.slyderId,
        syncStatus: syncResult.status,
        syncedAt: syncResult.syncedAt,
      },
    });

    return {
      applicationId,
      linkedUserId: application.linkedUserId,
      linkedSlyderProfileId: application.linkedSlyderProfileId,
    };
  });
}

export async function listSlyderApplications(input: {
  status?: ApplicationStatus;
  search?: string;
  sortBy: "submittedAt" | "updatedAt" | "fullName" | "applicationCode";
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
}) {
  const store = await readStore();
  let items = [...store.applications];

  if (input.status) {
    items = items.filter((item) => item.applicationStatus === input.status);
  }

  if (input.search && input.search.length >= 2) {
    const query = input.search.toLowerCase();
    items = items.filter((item) =>
      [
        item.fullName,
        item.phone,
        item.email,
        item.applicationCode,
        item.courierType,
        item.parish,
        item.applicationStatus,
      ].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }

  items.sort((left, right) => {
    const leftValue = left[input.sortBy];
    const rightValue = right[input.sortBy];
    const comparison = `${leftValue}`.localeCompare(`${rightValue}`);
    return input.sortDirection === "asc" ? comparison : -comparison;
  });

  const total = items.length;
  const start = (input.page - 1) * input.pageSize;
  const paged = items.slice(start, start + input.pageSize);

  return {
    items: paged,
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

export async function getSlyderApplicationDetail(applicationId: string) {
  const store = await readStore();
  const application = findApplication(store, applicationId);
  if (!application) {
    throw new Error("Application not found");
  }

  return {
    application,
    vehicle: getApplicationVehicle(store, application.id) ?? null,
    documents: getApplicationDocuments(store, application.id),
    history: store.history.filter((item) => item.entityId === application.id || item.metadata?.applicationId === application.id),
    linkedUser: application.linkedUserId ? findUserById(store, application.linkedUserId) ?? null : null,
    linkedSlyderProfile: application.linkedSlyderProfileId
      ? store.slyderProfiles.find((item) => item.id === application.linkedSlyderProfileId) ?? null
      : null,
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  reviewNotes: string | undefined,
  actor: AdminActor,
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    application.applicationStatus = status;
    application.reviewNotes = reviewNotes || application.reviewNotes;
    application.reviewedAt = nowIso();
    application.reviewedBy = actor.id;
    application.updatedAt = nowIso();

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: `application_status_${status}`,
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { reviewNotes },
    });

    return application;
  });
}

export async function requestApplicationDocuments(
  applicationId: string,
  payload: RequestDocumentsInput,
  actor: AdminActor,
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) throw new Error("Application not found");

    application.applicationStatus = "documents_pending";
    application.requestedDocumentTypes = payload.requestedDocumentTypes;
    application.requestedDocumentNotes = payload.notes;
    application.reviewedAt = nowIso();
    application.reviewedBy = actor.id;
    application.updatedAt = nowIso();

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: "documents_requested",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: payload,
    });
    await sendSlyderDocumentsRequestedNotification(
      store,
      application.id,
      application.linkedUserId,
      payload.requestedDocumentTypes,
      payload.notes,
    );

    return application;
  });
}

export async function rejectApplication(applicationId: string, reason: string, actor: AdminActor) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) throw new Error("Application not found");

    application.applicationStatus = "rejected";
    application.rejectionReason = reason;
    application.reviewedAt = nowIso();
    application.reviewedBy = actor.id;
    application.updatedAt = nowIso();

    if (application.linkedUserId) {
      const linkedUser = findUserById(store, application.linkedUserId);
      if (linkedUser) {
        linkedUser.accountStatus = "disabled";
        linkedUser.isEnabled = false;
        linkedUser.updatedAt = nowIso();
      }
    }

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: "application_rejected",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { reason },
    });
    await sendSlyderRejectedNotification(store, application.id, reason);

    return {
      ...application,
      email: application.email,
    };
  });
}

function provisionUserForApplication(store: OnboardingStore, application: SlyderApplication): StoredUser {
  const existing =
    findUserByEmailAndPhone(store, application.email, application.phone) ??
    findUserByEmailOrPhone(store, application.email) ??
    findUserByEmailOrPhone(store, application.phone);
  const timestamp = nowIso();

  if (existing) {
    existing.roles = Array.from(new Set([...existing.roles, "slyder"]));
    existing.userType = "slyder";
    existing.accountStatus = existing.accountStatus === "active" ? "active" : "activation_pending";
    existing.isEnabled = true;
    existing.email = normalizeEmail(application.email);
    existing.phone = normalizePhone(application.phone);
    existing.fullName = application.fullName;
    existing.updatedAt = timestamp;
    upsertUser(store, existing);
    return existing;
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalizeEmail(application.email),
    phone: normalizePhone(application.phone),
    fullName: application.fullName,
    roles: ["slyder"],
    userType: "slyder",
    accountStatus: "activation_pending",
    isEnabled: true,
    activationIssuedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  upsertUser(store, user);
  return user;
}

function provisionSlyderProfile(
  store: OnboardingStore,
  application: SlyderApplication,
  user: StoredUser,
  actor: AdminActor,
): SlyderProfile {
  const existing = findProfileByApplicationId(store, application.id) ?? findProfileByUserId(store, user.id);
  const timestamp = nowIso();

  if (existing) {
    existing.accountStatus = user.accountStatus;
    existing.displayName = application.fullName;
    existing.phone = normalizePhone(application.phone);
    existing.email = normalizeEmail(application.email);
    existing.courierType = application.courierType;
    existing.coverageZoneId = existing.coverageZoneId || application.preferredZones[0]?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    existing.updatedAt = timestamp;
    upsertSlyderProfile(store, existing);
    return existing;
  }

  const profile: SlyderProfile = {
    id: crypto.randomUUID(),
    userId: user.id,
    applicationId: application.id,
    coverageZoneId: application.preferredZones[0]?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    displayName: application.fullName,
    phone: normalizePhone(application.phone),
    email: normalizeEmail(application.email),
    courierType: application.courierType,
    onboardingStatus: "activation_pending",
    readinessStatus: "not_started",
    operationalStatus: "inactive",
    accountStatus: user.accountStatus,
    contractAccepted: false,
    vehicleVerified: !courierNeedsVehicle(application.courierType),
    payoutSetupComplete: false,
    profileComplete: false,
    trainingComplete: false,
    permissionsComplete: false,
    requiredAgreementsAccepted: false,
    canReceiveOrders: false,
    canGoOnline: false,
    readinessChecklist: {
      profileConfirmed: false,
      vehicleConfirmed: !courierNeedsVehicle(application.courierType),
      payoutConfigured: false,
      legalAccepted: false,
      locationPermissionConfirmed: false,
      notificationPermissionConfirmed: false,
      equipmentConfirmed: false,
      trainingAcknowledged: false,
      emergencyContactConfirmed: false,
      overallStatus: "not_started",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    approvedAt: timestamp,
    approvedBy: actor.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  upsertSlyderProfile(store, profile);
  return profile;
}

async function issueActivationToken(
  store: OnboardingStore,
  userId: string,
  applicationId: string,
  channel: "email" | "sms" | "whatsapp",
) {
  const existing = findLatestActivationTokenForUser(store, userId);
  if (existing && !existing.consumedAt && new Date(existing.expiresAt) > new Date()) {
    return null;
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
  await sendSlyderActivationNotification(store, userId, applicationId, channel, token);
  return token;
}

export async function approveApplication(
  applicationId: string,
  payload: ApproveApplicationInput,
  actor: AdminActor,
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) throw new Error("Application not found");

    if (application.applicationStatus === "approved" && application.linkedUserId && application.linkedSlyderProfileId) {
      const existingUser = findUserById(store, application.linkedUserId);
      const existingProfile = findProfileByApplicationId(store, application.id);
      if (existingUser && existingProfile) {
        evaluateReadinessForProfile(store, existingProfile.id);
        return {
          applicationId: application.id,
          applicationStatus: application.applicationStatus,
          email: application.email,
          linkedUserId: existingUser.id,
          linkedSlyderProfileId: existingProfile.id,
          accountStatus: existingUser.accountStatus,
          activationStatus: existingUser.accountStatus,
          activationToken: null,
        };
      }
    }

    const approvalCheck = canApproveApplication(store, application);
    if (!approvalCheck.ok) {
      throw new Error(approvalCheck.reason);
    }

    const user = provisionUserForApplication(store, application);
    const profile = provisionSlyderProfile(store, application, user, actor);

    application.applicationStatus = "approved";
    application.reviewNotes = payload.reviewNotes || application.reviewNotes;
    application.reviewedAt = nowIso();
    application.reviewedBy = actor.id;
    application.linkedUserId = user.id;
    application.linkedSlyderProfileId = profile.id;
    application.accountStatus = user.accountStatus;
    application.readinessStatus = profile.readinessStatus;
    application.operationalStatus = profile.operationalStatus;
    application.updatedAt = nowIso();

    const activationToken = await issueActivationToken(store, user.id, application.id, payload.activationChannel);

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: "application_approved",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { userId: user.id, profileId: profile.id },
    });
    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "user_created_or_linked_for_slyder",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { applicationId: application.id },
    });
    appendAuditEvent(store, {
      entityType: "slyder_profile",
      entityId: profile.id,
      eventType: "slyder_profile_created",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { applicationId: application.id },
    });
    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "activation_initiated",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { applicationId: application.id, channel: payload.activationChannel },
    });

    await sendSlyderApprovedNotification(store, application.id, user.id, profile.id, payload.activationChannel);

    const readiness = evaluateReadinessForProfile(store, profile.id);

    return {
      applicationId: application.id,
      applicationStatus: application.applicationStatus,
      email: application.email,
      linkedUserId: user.id,
      linkedSlyderProfileId: profile.id,
      accountStatus: user.accountStatus,
      activationStatus: user.accountStatus,
      activationToken, // returned for integration/testing; replace with provider delivery in production.
      readiness,
    };
  });
}

export async function updateDocumentVerification(
  applicationId: string,
  documentId: string,
  verificationStatus: SlyderApplicationDocument["verificationStatus"],
  actor: { id: string; fullName: string },
  rejectionReason?: string,
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) throw new Error("Application not found");

    const document = store.documents.find((item) => item.id === documentId && item.applicationId === applicationId);
    if (!document) throw new Error("Document not found");

    document.verificationStatus = verificationStatus;
    document.rejectionReason = rejectionReason;
    document.reviewedAt = nowIso();
    document.reviewedBy = actor.id;

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: "document_verification_updated",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: { documentId, verificationStatus, rejectionReason },
    });

    const readiness = application.linkedSlyderProfileId
      ? evaluateReadinessForProfile(store, application.linkedSlyderProfileId)
      : null;

    if (
      verificationStatus === "approved" &&
      readiness &&
      application.linkedUserId &&
      application.linkedSlyderProfileId &&
      requiredDocumentTypesForApplication(application).every((type) =>
        store.documents.some(
          (item) =>
            item.applicationId === application.id &&
            item.type === type &&
            item.verificationStatus === "approved",
        ),
      )
    ) {
      await sendSlyderDocumentsReviewCompleteNotification(
        store,
        application.id,
        application.linkedUserId,
        application.linkedSlyderProfileId,
        readiness,
      );
    }

    return { document, readiness };
  });
}

export async function replaceApplicationDocument(
  applicationId: string,
  documentId: string,
  file: {
    fileUrl: string;
    storageKey: string;
    fileName: string;
    mimeType: string;
  },
  actor: { id: string; fullName: string },
) {
  return withStoreTransaction(async (store) => {
    const application = findApplication(store, applicationId);
    if (!application) throw new Error("Application not found");

    const document = store.documents.find((item) => item.id === documentId && item.applicationId === applicationId);
    if (!document) throw new Error("Document not found");

    const uploadedAt = nowIso();
    document.fileUrl = file.fileUrl;
    document.storageKey = file.storageKey;
    document.fileName = file.fileName;
    document.mimeType = file.mimeType;
    document.uploadedAt = uploadedAt;
    document.verificationStatus = "pending";
    document.rejectionReason = undefined;
    document.reviewedAt = undefined;
    document.reviewedBy = undefined;

    if (getPersistenceDriver() === "prisma") {
      await updateApplicationDocumentInPrisma(document.id, {
        fileUrl: document.fileUrl,
        storageKey: document.storageKey,
        fileName: document.fileName,
        mimeType: document.mimeType,
        uploadedAt,
        verificationStatus: "pending",
      });
    }

    appendAuditEvent(store, {
      entityType: "application",
      entityId: application.id,
      eventType: "document_replaced_by_admin",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: {
        documentId,
        fileName: file.fileName,
        storageKey: file.storageKey,
      },
    });

    return { document };
  });
}
