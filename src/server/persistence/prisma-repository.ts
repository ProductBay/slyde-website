import { prisma } from "@/server/db/prisma";
import type { PersistenceRepository } from "@/server/persistence/repository";
import { createSeedStore } from "@/server/persistence/store";
import type {
  ActivationToken,
  EmployeeAnnouncement,
  EmployeeApplication,
  EmployeeGuide,
  EmployeeGuideAcknowledgement,
  EmployeePayrollRecord,
  EmployeePayoutRecord,
  EmployeeProfile,
  CoverageZone,
  LegalAcceptance,
  LegalDocument,
  LegalDocumentPublishHistory,
  MerchantInterestRecord,
  NotificationRecord,
  NotificationTemplate,
  NotificationTriggerEvent,
  OnboardingStore,
  OtpChallenge,
  SessionRecord,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderApplicationVehicle,
  SlyderProfile,
  SlyderStatusHistory,
  StoredUser,
} from "@/types/backend/onboarding";

type PrismaTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

function toDate(value: string | undefined | null) {
  return value ? new Date(value) : null;
}

function toDateOnly(value: string | undefined | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function isUuid(value: string | null | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function mapUser(record: Awaited<ReturnType<typeof prisma.user.findFirst>>): StoredUser | null {
  if (!record) return null;

  return {
    id: record.id,
    email: record.email,
    phone: record.phone,
    fullName: record.fullName,
    passwordHash: record.passwordHash ?? undefined,
    roles: record.roles,
    userType: record.userType,
    accountStatus: record.accountStatus,
    isEnabled: record.isEnabled,
    activationIssuedAt: toIso(record.activationIssuedAt),
    lastLoginAt: toIso(record.lastLoginAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapActivationToken(record: Awaited<ReturnType<typeof prisma.activationToken.findFirst>>): ActivationToken | null {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.userId,
    tokenHash: record.tokenHash,
    deliveryChannel: record.deliveryChannel,
    status: record.status,
    issuedAt: toIso(record.issuedAt),
    expiresAt: record.expiresAt.toISOString(),
    consumedAt: toIso(record.consumedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: toIso(record.updatedAt),
  };
}

function mapOtpChallenge(record: Awaited<ReturnType<typeof prisma.otpChallenge.findFirst>>): OtpChallenge | null {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.userId,
    codeHash: record.codeHash,
    expiresAt: record.expiresAt.toISOString(),
    consumedAt: toIso(record.consumedAt),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapSessionRecord(record: Awaited<ReturnType<typeof prisma.sessionRecord.findFirst>>): SessionRecord | null {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.userId,
    roles: record.roles,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
  };
}

function mapSlyderApplication(record: Awaited<ReturnType<typeof prisma.slyderApplication.findFirst>>): SlyderApplication | null {
  if (!record) return null;

  const readinessAnswers = (record.readinessAnswers as Record<string, unknown> | null) ?? {};
  const referralAttribution =
    (readinessAnswers as { referralAttribution?: SlyderApplication["referralAttribution"] }).referralAttribution;

  return {
    id: record.id,
    applicationCode: record.applicationCode,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    dateOfBirth: record.dateOfBirth.toISOString().slice(0, 10),
    parish: record.parish,
    address: record.address,
    trn: record.trn,
    emergencyContactName: record.emergencyContactName,
    emergencyContactPhone: record.emergencyContactPhone,
    courierType: record.courierType,
    workTypePreference: record.workTypePreference,
    availability: record.availability,
    preferredZones: record.preferredZones,
    deliveryTypePreferences: record.deliveryTypePreferences,
    maxTravelComfort: record.maxTravelComfort,
    peakHours: record.peakHours,
    smartphoneType: record.smartphoneType,
    whatsappNumber: record.whatsappNumber,
    gpsConfirmed: record.gpsConfirmed,
    internetConfirmed: record.internetConfirmed,
    readinessAnswers,
    agreementsAccepted: (record.agreementsAccepted as Record<string, boolean> | null) ?? {},
    referralAttribution,
    applicationStatus: record.applicationStatus,
    accountStatus: record.accountStatus,
    operationalStatus: record.operationalStatus,
    readinessStatus: record.readinessStatus,
    reviewNotes: record.reviewNotes ?? undefined,
    rejectionReason: record.rejectionReason ?? undefined,
    requestedDocumentNotes: record.requestedDocumentNotes ?? undefined,
    requestedDocumentTypes: record.requestedDocumentTypes,
    submittedAt: record.submittedAt.toISOString(),
    reviewedAt: toIso(record.reviewedAt),
    reviewedBy: record.reviewedBy ?? undefined,
    linkedUserId: record.linkedUserId ?? undefined,
    linkedSlyderProfileId: record.linkedSlyderProfileId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapSlyderApplicationVehicle(
  record: Awaited<ReturnType<typeof prisma.slyderApplicationVehicle.findFirst>>,
): SlyderApplicationVehicle | null {
  if (!record) return null;

  return {
    id: record.id,
    applicationId: record.applicationId,
    make: record.make ?? undefined,
    model: record.model ?? undefined,
    year: record.year ?? undefined,
    color: record.color ?? undefined,
    plateNumber: record.plateNumber ?? undefined,
    registrationExpiry: record.registrationExpiry?.toISOString().slice(0, 10),
    insuranceExpiry: record.insuranceExpiry?.toISOString().slice(0, 10),
    fitnessExpiry: record.fitnessExpiry?.toISOString().slice(0, 10),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapSlyderApplicationDocument(
  record: Awaited<ReturnType<typeof prisma.slyderApplicationDocument.findFirst>>,
): SlyderApplicationDocument | null {
  if (!record) return null;

  return {
    id: record.id,
    applicationId: record.applicationId,
    type: record.type,
    fileUrl: record.fileUrl,
    storageKey: record.storageKey,
    fileName: record.fileName,
    mimeType: record.mimeType,
    verificationStatus: record.verificationStatus,
    rejectionReason: record.rejectionReason ?? undefined,
    uploadedAt: record.uploadedAt.toISOString(),
    reviewedAt: toIso(record.reviewedAt),
    reviewedBy: record.reviewedBy ?? undefined,
  };
}

function mapSlyderProfile(record: Awaited<ReturnType<typeof prisma.slyderProfile.findFirst>>): SlyderProfile | null {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.userId,
    applicationId: record.applicationId,
    coverageZoneId: record.coverageZoneId ?? undefined,
    displayName: record.displayName,
    phone: record.phone,
    email: record.email,
    courierType: record.courierType,
    onboardingStatus: record.onboardingStatus,
    readinessStatus: record.readinessStatus,
    operationalStatus: record.operationalStatus,
    accountStatus: record.accountStatus,
    contractAccepted: record.contractAccepted,
    contractAcceptedAt: toIso(record.contractAcceptedAt),
    vehicleVerified: record.vehicleVerified,
    payoutSetupComplete: record.payoutSetupComplete,
    profileComplete: record.profileComplete,
    trainingComplete: record.trainingComplete,
    permissionsComplete: record.permissionsComplete,
    requiredAgreementsAccepted: record.requiredAgreementsAccepted,
    setupCompletedAt: toIso(record.setupCompletedAt),
    trainingAcknowledgedAt: toIso(record.trainingAcknowledgedAt),
    activatedAt: toIso(record.activatedAt),
    canGoOnline: record.canGoOnline,
    canReceiveOrders: record.canReceiveOrders,
    readinessChecklist: {
      profileConfirmed: record.profileConfirmed,
      vehicleConfirmed: record.vehicleConfirmed,
      payoutConfigured: record.payoutConfigured,
      legalAccepted: record.legalAccepted,
      locationPermissionConfirmed: record.locationPermissionConfirmed,
      notificationPermissionConfirmed: record.notificationPermissionConfirmed,
      equipmentConfirmed: record.equipmentConfirmed,
      trainingAcknowledged: record.trainingAcknowledged,
      emergencyContactConfirmed: record.emergencyContactConfirmed,
      overallStatus: record.readinessChecklistStatus,
      createdAt: toIso(record.readinessChecklistCreatedAt) ?? record.createdAt.toISOString(),
      updatedAt: toIso(record.readinessChecklistUpdatedAt) ?? record.updatedAt.toISOString(),
    },
    approvedAt: record.approvedAt.toISOString(),
    approvedBy: record.approvedBy,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapStatusHistory(record: Awaited<ReturnType<typeof prisma.statusHistory.findFirst>>): SlyderStatusHistory | null {
  if (!record) return null;

  return {
    id: record.id,
    entityType: record.entityType,
    entityId: record.entityId,
    eventType: record.eventType,
    actorUserId: record.actorUserId ?? undefined,
    actorLabel: record.actorLabel ?? undefined,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapEmployeeApplication(
  record: Awaited<ReturnType<typeof prisma.employeeApplication.findFirst>>,
): EmployeeApplication | null {
  if (!record) return null;

  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    roleInterest: record.roleInterest,
    departmentInterest: record.departmentInterest,
    employmentType: record.employmentType,
    location: record.location,
    experienceSummary: record.experienceSummary,
    managerTrackInterest: record.managerTrackInterest ?? undefined,
    resumeUrl: record.resumeUrl ?? undefined,
    notes: record.notes ?? undefined,
    status: record.status,
    submittedAt: record.submittedAt.toISOString(),
    reviewedAt: toIso(record.reviewedAt),
    reviewedBy: record.reviewedByLabel ?? undefined,
    linkedUserId: record.linkedUserId ?? undefined,
    linkedEmployeeProfileId: record.linkedEmployeeProfileId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapEmployeeProfile(
  record: Awaited<ReturnType<typeof prisma.employeeProfile.findFirst>>,
): EmployeeProfile | null {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.userId,
    employeeCode: record.employeeCode,
    displayName: record.displayName,
    department: record.department,
    title: record.title,
    employmentType: record.employmentType,
    managerUserId: record.managerUserId ?? undefined,
    startDate: record.startDate.toISOString().slice(0, 10),
    locationLabel: record.locationLabel,
    payrollFrequency: record.payrollFrequency,
    payoutMethod: record.payoutMethod,
    payoutAccountMasked: record.payoutAccountMasked ?? undefined,
    isOnboarded: record.isOnboarded,
    onboardingCompletedAt: toIso(record.onboardingCompletedAt),
    emergencyContactName: record.emergencyContactName ?? undefined,
    emergencyContactPhone: record.emergencyContactPhone ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapEmployeeAnnouncement(
  record: Awaited<ReturnType<typeof prisma.employeeAnnouncement.findFirst>>,
): EmployeeAnnouncement | null {
  if (!record) return null;

  return {
    id: record.id,
    title: record.title,
    excerpt: record.excerpt,
    body: record.body,
    audience: record.audience,
    publishedByUserId: record.publishedByUserId ?? undefined,
    priority: record.priority,
    publishedAt: record.publishedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapEmployeeGuide(
  record: Awaited<ReturnType<typeof prisma.employeeGuide.findFirst>>,
): EmployeeGuide | null {
  if (!record) return null;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    category: record.category,
    audience: record.audience,
    contentMarkdown: record.contentMarkdown,
    isFeatured: record.isFeatured,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapEmployeeGuideAcknowledgement(
  record: Awaited<ReturnType<typeof prisma.employeeGuideAcknowledgement.findFirst>>,
): EmployeeGuideAcknowledgement | null {
  if (!record) return null;

  return {
    id: record.id,
    guideId: record.guideId,
    employeeProfileId: record.employeeProfileId,
    acknowledgedAt: record.acknowledgedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapEmployeePayrollRecord(
  record: Awaited<ReturnType<typeof prisma.employeePayrollRecord.findFirst>>,
): EmployeePayrollRecord | null {
  if (!record) return null;

  return {
    id: record.id,
    employeeProfileId: record.employeeProfileId,
    payPeriodStart: record.payPeriodStart.toISOString().slice(0, 10),
    payPeriodEnd: record.payPeriodEnd.toISOString().slice(0, 10),
    grossAmount: Number(record.grossAmount),
    deductionsAmount: Number(record.deductionsAmount),
    netAmount: Number(record.netAmount),
    status: record.status,
    payDate: record.payDate.toISOString().slice(0, 10),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapEmployeePayoutRecord(
  record: Awaited<ReturnType<typeof prisma.employeePayoutRecord.findFirst>>,
): EmployeePayoutRecord | null {
  if (!record) return null;

  return {
    id: record.id,
    employeeProfileId: record.employeeProfileId,
    sourceLabel: record.sourceLabel,
    amount: Number(record.amount),
    status: record.status,
    payoutDate: record.payoutDate.toISOString().slice(0, 10),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapCoverageZone(
  record: Awaited<ReturnType<typeof prisma.coverageZone.findFirst>>,
): CoverageZone | null {
  if (!record) return null;

  return {
    id: record.id,
    name: record.name,
    parish: record.parish,
    requiredReadySlyders: record.requiredReadySlyders,
    merchantAvailability: record.merchantAvailability,
    estimatedLaunchLabel: record.estimatedLaunchLabel,
    isLive: record.isLive,
    isPaused: record.isPaused,
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantInterest(
  record: Awaited<ReturnType<typeof prisma.merchantInterest.findFirst>>,
): MerchantInterestRecord | null {
  if (!record) return null;

  return {
    id: record.id,
    companyName: record.companyName,
    contactName: record.contactName,
    email: record.email,
    phone: record.phone,
    whatsappNumber: record.whatsappNumber ?? undefined,
    businessType: record.businessType,
    deliveryVolume: record.deliveryVolume,
    coverageNeeds: record.coverageNeeds,
    goals: record.goals,
    parish: record.parish ?? undefined,
    town: record.town ?? undefined,
    zoneId: record.zoneId ?? undefined,
    zoneName: record.zoneName ?? undefined,
    operationalNotes: record.operationalNotes ?? undefined,
    lifecycleStatus: record.lifecycleStatus,
    linkedMerchantUserId: record.linkedMerchantUserId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapNotificationTemplate(
  record: Awaited<ReturnType<typeof prisma.notificationTemplate.findFirst>>,
): NotificationTemplate | null {
  if (!record) return null;

  return {
    id: record.id,
    key: record.key,
    name: record.name,
    actorType: record.actorType,
    eventType: record.eventType,
    channel: record.channel,
    subject: record.subject ?? undefined,
    bodyTemplate: record.bodyTemplate,
    plainTextTemplate: record.plainTextTemplate ?? undefined,
    isActive: record.isActive,
    version: record.version,
    locale: record.locale ?? undefined,
    description: record.description ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapNotificationTriggerEvent(
  record: Awaited<ReturnType<typeof prisma.notificationTriggerEvent.findFirst>>,
): NotificationTriggerEvent | null {
  if (!record) return null;

  return {
    id: record.id,
    eventKey: record.eventKey,
    relatedEntityType: record.relatedEntityType ?? undefined,
    relatedEntityId: record.relatedEntityId ?? undefined,
    actorType: record.actorType ?? undefined,
    actorId: record.actorId ?? undefined,
    payload: (record.payload as Record<string, unknown> | null) ?? undefined,
    status: record.status,
    errorMessage: record.errorMessage ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapNotificationRecord(
  record: Awaited<ReturnType<typeof prisma.notificationRecord.findFirst>>,
): NotificationRecord | null {
  if (!record) return null;

  return {
    id: record.id,
    templateId: record.templateId ?? undefined,
    templateKey: record.templateKey ?? undefined,
    triggerEventId: record.triggerEventId ?? undefined,
    triggerEventKey: record.triggerEventKey ?? undefined,
    dedupeKey: record.dedupeKey ?? undefined,
    actorType: record.actorType ?? undefined,
    actorId: record.actorId ?? undefined,
    relatedEntityType: record.relatedEntityType ?? undefined,
    relatedEntityId: record.relatedEntityId ?? undefined,
    userId: record.userId ?? undefined,
    applicationId: record.applicationId ?? undefined,
    slyderProfileId: record.slyderProfileId ?? undefined,
    channel: record.channel,
    template: record.template,
    recipient: record.recipient ?? undefined,
    recipientName: record.recipientName ?? undefined,
    status: record.status ?? undefined,
    providerName: record.providerName ?? undefined,
    providerMessageId: record.providerMessageId ?? undefined,
    subjectSnapshot: record.subjectSnapshot ?? undefined,
    bodySnapshot: record.bodySnapshot ?? undefined,
    variablesSnapshot: (record.variablesSnapshot as Record<string, unknown> | null) ?? undefined,
    failureReason: record.failureReason ?? undefined,
    resentFromId: record.resentFromId ?? undefined,
    retryCount: record.retryCount ?? undefined,
    lastAttemptAt: toIso(record.lastAttemptAt),
    sentAt: toIso(record.sentAt),
    deliveredAt: toIso(record.deliveredAt),
    createdBySystem: record.createdBySystem ?? undefined,
    triggeredByUserId: record.triggeredByUserId ?? undefined,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    payload: record.payload as Record<string, unknown>,
    createdAt: record.createdAt.toISOString(),
    updatedAt: toIso(record.updatedAt),
  };
}

function mapLegalDocument(
  record: Awaited<ReturnType<typeof prisma.legalDocument.findFirst>>,
): LegalDocument | null {
  if (!record) return null;

  return {
    id: record.id,
    documentType: record.documentType,
    categoryKey: record.categoryKey,
    actorScopes: record.actorScopes,
    requiresAcceptance: record.requiresAcceptance,
    version: record.version,
    title: record.title,
    slug: record.slug,
    contentMarkdown: record.contentMarkdown,
    summary: record.summary ?? undefined,
    excerpt: record.excerpt ?? undefined,
    status: record.status,
    isActive: record.isActive,
    effectiveFrom: toIso(record.effectiveFrom),
    publishedAt: toIso(record.publishedAt),
    archivedAt: toIso(record.archivedAt),
    createdBy: record.createdBy ?? undefined,
    updatedBy: record.updatedBy ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapLegalAcceptance(
  record: Awaited<ReturnType<typeof prisma.legalAcceptance.findFirst>>,
): LegalAcceptance | null {
  if (!record) return null;

  return {
    id: record.id,
    actorType: record.actorType,
    actorId: record.actorId,
    documentId: record.documentId,
    documentType: record.documentType,
    documentTitleSnapshot: record.documentTitleSnapshot,
    documentVersion: record.documentVersion,
    acceptedAt: record.acceptedAt.toISOString(),
    ipAddress: record.ipAddress ?? undefined,
    userAgent: record.userAgent ?? undefined,
    acceptanceSource: record.acceptanceSource,
    checkboxLabelSnapshot: record.checkboxLabelSnapshot ?? undefined,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapLegalDocumentPublishHistory(
  record: Awaited<ReturnType<typeof prisma.legalDocumentPublishHistory.findFirst>>,
): LegalDocumentPublishHistory | null {
  if (!record) return null;

  return {
    id: record.id,
    legalDocumentId: record.legalDocumentId,
    action: record.action,
    note: record.note ?? undefined,
    actedBy: record.actedBy ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mergeById<T extends { id: string }>(base: T[], overlay: T[]) {
  const map = new Map(base.map((item) => [item.id, item] as const));
  for (const item of overlay) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

async function overlaySupportedPrismaSlices(store: OnboardingStore): Promise<OnboardingStore> {
  const [
    users,
    activationTokens,
    otpChallenges,
    sessions,
    applications,
    vehicles,
    documents,
    slyderProfiles,
    history,
    employeeApplications,
    employeeProfiles,
    employeeAnnouncements,
    employeeGuides,
    employeeGuideAcknowledgements,
    employeePayrollRecords,
    employeePayoutRecords,
    notificationTemplates,
    notificationTriggerEvents,
    notificationRecords,
    legalDocuments,
    legalAcceptances,
    legalDocumentPublishHistory,
    coverageZones,
    merchantInterests,
  ] = await prisma.$transaction([
    prisma.user.findMany(),
    prisma.activationToken.findMany(),
    prisma.otpChallenge.findMany(),
    prisma.sessionRecord.findMany(),
    prisma.slyderApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.slyderApplicationVehicle.findMany(),
    prisma.slyderApplicationDocument.findMany(),
    prisma.slyderProfile.findMany(),
    prisma.statusHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.employeeApplication.findMany({
      orderBy: {
        submittedAt: "desc",
      },
    }),
    prisma.employeeProfile.findMany(),
    prisma.employeeAnnouncement.findMany({
      orderBy: {
        publishedAt: "desc",
      },
    }),
    prisma.employeeGuide.findMany({
      orderBy: {
        title: "asc",
      },
    }),
    prisma.employeeGuideAcknowledgement.findMany(),
    prisma.employeePayrollRecord.findMany({
      orderBy: {
        payDate: "desc",
      },
    }),
    prisma.employeePayoutRecord.findMany({
      orderBy: {
        payoutDate: "desc",
      },
    }),
    prisma.notificationTemplate.findMany(),
    prisma.notificationTriggerEvent.findMany(),
    prisma.notificationRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.legalDocument.findMany(),
    prisma.legalAcceptance.findMany({
      orderBy: {
        acceptedAt: "desc",
      },
    }),
    prisma.legalDocumentPublishHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.coverageZone.findMany(),
    prisma.merchantInterest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    ...store,
    users: mergeById(
      store.users,
      users
        .map((item) => mapUser(item))
        .filter((item): item is StoredUser => Boolean(item)),
    ),
    activationTokens: mergeById(
      store.activationTokens,
      activationTokens
        .map((item) => mapActivationToken(item))
        .filter((item): item is ActivationToken => Boolean(item)),
    ),
    otpChallenges: mergeById(
      store.otpChallenges,
      otpChallenges
        .map((item) => mapOtpChallenge(item))
        .filter((item): item is OtpChallenge => Boolean(item)),
    ),
    sessions: mergeById(
      store.sessions,
      sessions
        .map((item) => mapSessionRecord(item))
        .filter((item): item is SessionRecord => Boolean(item)),
    ),
    applications: mergeById(
      store.applications,
      applications
        .map((item) => mapSlyderApplication(item))
        .filter((item): item is SlyderApplication => Boolean(item)),
    ),
    vehicles: mergeById(
      store.vehicles,
      vehicles
        .map((item) => mapSlyderApplicationVehicle(item))
        .filter((item): item is SlyderApplicationVehicle => Boolean(item)),
    ),
    documents: mergeById(
      store.documents,
      documents
        .map((item) => mapSlyderApplicationDocument(item))
        .filter((item): item is SlyderApplicationDocument => Boolean(item)),
    ),
    slyderProfiles: mergeById(
      store.slyderProfiles,
      slyderProfiles
        .map((item) => mapSlyderProfile(item))
        .filter((item): item is SlyderProfile => Boolean(item)),
    ),
    history: mergeById(
      store.history,
      history
        .map((item) => mapStatusHistory(item))
        .filter((item): item is SlyderStatusHistory => Boolean(item)),
    ),
    employeeApplications: mergeById(
      store.employeeApplications,
      employeeApplications
        .map((item) => mapEmployeeApplication(item))
        .filter((item): item is EmployeeApplication => Boolean(item)),
    ),
    employeeProfiles: mergeById(
      store.employeeProfiles,
      employeeProfiles
        .map((item) => mapEmployeeProfile(item))
        .filter((item): item is EmployeeProfile => Boolean(item)),
    ),
    employeeAnnouncements: mergeById(
      store.employeeAnnouncements,
      employeeAnnouncements
        .map((item) => mapEmployeeAnnouncement(item))
        .filter((item): item is EmployeeAnnouncement => Boolean(item)),
    ),
    employeeGuides: mergeById(
      store.employeeGuides,
      employeeGuides
        .map((item) => mapEmployeeGuide(item))
        .filter((item): item is EmployeeGuide => Boolean(item)),
    ),
    employeeGuideAcknowledgements: mergeById(
      store.employeeGuideAcknowledgements,
      employeeGuideAcknowledgements
        .map((item) => mapEmployeeGuideAcknowledgement(item))
        .filter((item): item is EmployeeGuideAcknowledgement => Boolean(item)),
    ),
    employeePayrollRecords: mergeById(
      store.employeePayrollRecords,
      employeePayrollRecords
        .map((item) => mapEmployeePayrollRecord(item))
        .filter((item): item is EmployeePayrollRecord => Boolean(item)),
    ),
    employeePayoutRecords: mergeById(
      store.employeePayoutRecords,
      employeePayoutRecords
        .map((item) => mapEmployeePayoutRecord(item))
        .filter((item): item is EmployeePayoutRecord => Boolean(item)),
    ),
    notificationTemplates: mergeById(
      store.notificationTemplates,
      notificationTemplates
        .map((item) => mapNotificationTemplate(item))
        .filter((item): item is NotificationTemplate => Boolean(item)),
    ),
    notificationTriggers: mergeById(
      store.notificationTriggers,
      notificationTriggerEvents
        .map((item) => mapNotificationTriggerEvent(item))
        .filter((item): item is NotificationTriggerEvent => Boolean(item)),
    ),
    notifications: mergeById(
      store.notifications,
      notificationRecords
        .map((item) => mapNotificationRecord(item))
        .filter((item): item is NotificationRecord => Boolean(item)),
    ),
    legalDocuments: mergeById(
      store.legalDocuments,
      legalDocuments
        .map((item) => mapLegalDocument(item))
        .filter((item): item is LegalDocument => Boolean(item)),
    ),
    legalAcceptances: mergeById(
      store.legalAcceptances,
      legalAcceptances
        .map((item) => mapLegalAcceptance(item))
        .filter((item): item is LegalAcceptance => Boolean(item)),
    ),
    legalPublishHistory: mergeById(
      store.legalPublishHistory,
      legalDocumentPublishHistory
        .map((item) => mapLegalDocumentPublishHistory(item))
        .filter((item): item is LegalDocumentPublishHistory => Boolean(item)),
    ),
    coverageZones: mergeById(
      store.coverageZones,
      coverageZones
        .map((item) => mapCoverageZone(item))
        .filter((item): item is CoverageZone => Boolean(item)),
    ),
    merchantInterests: mergeById(
      store.merchantInterests,
      merchantInterests
        .map((item) => mapMerchantInterest(item))
        .filter((item): item is MerchantInterestRecord => Boolean(item)),
    ),
  };
}

async function persistSupportedPrismaSlices(tx: PrismaTransactionClient, store: OnboardingStore) {
  const supportedUsers = store.users;
  const supportedUserIds = new Set(supportedUsers.map((user) => user.id));
  const supportedActivationTokens = store.activationTokens.filter((token) => supportedUserIds.has(token.userId));
  const supportedOtpChallenges = store.otpChallenges.filter((challenge) => supportedUserIds.has(challenge.userId));
  const supportedSessions = store.sessions.filter((session) => supportedUserIds.has(session.userId));
  const supportedApplications = store.applications;
  const supportedVehicles = store.vehicles;
  const supportedDocuments = store.documents;
  const supportedSlyderProfiles = store.slyderProfiles;
  const supportedHistory = store.history.filter(
    (item) => item.entityType === "application" || item.entityType === "user" || item.entityType === "slyder_profile",
  );
  const supportedEmployeeProfiles = store.employeeProfiles;
  const supportedEmployeeApplications = store.employeeApplications;
  const supportedEmployeeAnnouncements = store.employeeAnnouncements;
  const supportedEmployeeGuides = store.employeeGuides;
  const supportedEmployeeGuideAcknowledgements = store.employeeGuideAcknowledgements;
  const supportedEmployeePayrollRecords = store.employeePayrollRecords;
  const supportedEmployeePayoutRecords = store.employeePayoutRecords;
  const supportedNotificationTemplates = store.notificationTemplates;
  const supportedNotificationTriggers = store.notificationTriggers;
  const supportedNotifications = store.notifications;
  const supportedLegalDocuments = store.legalDocuments;
  const supportedLegalAcceptances = store.legalAcceptances;
  const supportedLegalPublishHistory = store.legalPublishHistory;
  const supportedCoverageZones = store.coverageZones;
  const supportedMerchantInterests = store.merchantInterests;

  for (const user of supportedUsers) {
    await tx.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        passwordHash: user.passwordHash ?? null,
        roles: user.roles,
        userType: user.userType,
        accountStatus: user.accountStatus,
        isEnabled: user.isEnabled,
        activationIssuedAt: toDate(user.activationIssuedAt),
        lastLoginAt: toDate(user.lastLoginAt),
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        passwordHash: user.passwordHash ?? null,
        roles: user.roles,
        userType: user.userType,
        accountStatus: user.accountStatus,
        isEnabled: user.isEnabled,
        activationIssuedAt: toDate(user.activationIssuedAt),
        lastLoginAt: toDate(user.lastLoginAt),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  for (const token of supportedActivationTokens) {
    await tx.activationToken.upsert({
      where: { id: token.id },
      update: {
        userId: token.userId,
        tokenHash: token.tokenHash,
        deliveryChannel: token.deliveryChannel,
        status: token.status ?? "issued",
        issuedAt: toDate(token.issuedAt),
        expiresAt: new Date(token.expiresAt),
        consumedAt: toDate(token.consumedAt),
        updatedAt: toDate(token.updatedAt),
      },
      create: {
        id: token.id,
        userId: token.userId,
        tokenHash: token.tokenHash,
        deliveryChannel: token.deliveryChannel,
        status: token.status ?? "issued",
        issuedAt: toDate(token.issuedAt),
        expiresAt: new Date(token.expiresAt),
        consumedAt: toDate(token.consumedAt),
        createdAt: new Date(token.createdAt),
        updatedAt: toDate(token.updatedAt),
      },
    });
  }

  for (const challenge of supportedOtpChallenges) {
    await tx.otpChallenge.upsert({
      where: { id: challenge.id },
      update: {
        userId: challenge.userId,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
        createdAt: new Date(challenge.createdAt),
      },
      create: {
        id: challenge.id,
        userId: challenge.userId,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
        createdAt: new Date(challenge.createdAt),
      },
    });
  }

  for (const session of supportedSessions) {
    await tx.sessionRecord.upsert({
      where: { id: session.id },
      update: {
        userId: session.userId,
        roles: session.roles,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      },
      create: {
        id: session.id,
        userId: session.userId,
        roles: session.roles,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      },
    });
  }

  for (const application of supportedApplications) {
    await tx.slyderApplication.upsert({
      where: { id: application.id },
      update: {
        applicationCode: application.applicationCode,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        dateOfBirth: toDateOnly(application.dateOfBirth) ?? new Date(application.dateOfBirth),
        parish: application.parish,
        address: application.address,
        trn: application.trn,
        emergencyContactName: application.emergencyContactName,
        emergencyContactPhone: application.emergencyContactPhone,
        courierType: application.courierType,
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
        readinessAnswers: application.readinessAnswers as any,
        agreementsAccepted: application.agreementsAccepted as any,
        applicationStatus: application.applicationStatus,
        accountStatus: application.accountStatus,
        operationalStatus: application.operationalStatus,
        readinessStatus: application.readinessStatus,
        reviewNotes: application.reviewNotes ?? null,
        rejectionReason: application.rejectionReason ?? null,
        requestedDocumentNotes: application.requestedDocumentNotes ?? null,
        requestedDocumentTypes: application.requestedDocumentTypes ?? [],
        submittedAt: new Date(application.submittedAt),
        reviewedAt: toDate(application.reviewedAt),
        reviewedBy: application.reviewedBy ?? null,
        linkedUserId: application.linkedUserId ?? null,
        linkedSlyderProfileId: application.linkedSlyderProfileId ?? null,
        updatedAt: new Date(application.updatedAt),
      },
      create: {
        id: application.id,
        applicationCode: application.applicationCode,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        dateOfBirth: toDateOnly(application.dateOfBirth) ?? new Date(application.dateOfBirth),
        parish: application.parish,
        address: application.address,
        trn: application.trn,
        emergencyContactName: application.emergencyContactName,
        emergencyContactPhone: application.emergencyContactPhone,
        courierType: application.courierType,
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
        readinessAnswers: application.readinessAnswers as any,
        agreementsAccepted: application.agreementsAccepted as any,
        applicationStatus: application.applicationStatus,
        accountStatus: application.accountStatus,
        operationalStatus: application.operationalStatus,
        readinessStatus: application.readinessStatus,
        reviewNotes: application.reviewNotes ?? null,
        rejectionReason: application.rejectionReason ?? null,
        requestedDocumentNotes: application.requestedDocumentNotes ?? null,
        requestedDocumentTypes: application.requestedDocumentTypes ?? [],
        submittedAt: new Date(application.submittedAt),
        reviewedAt: toDate(application.reviewedAt),
        reviewedBy: application.reviewedBy ?? null,
        linkedUserId: application.linkedUserId ?? null,
        linkedSlyderProfileId: application.linkedSlyderProfileId ?? null,
        createdAt: new Date(application.createdAt),
        updatedAt: new Date(application.updatedAt),
      },
    });
  }

  for (const vehicle of supportedVehicles) {
    await tx.slyderApplicationVehicle.upsert({
      where: { id: vehicle.id },
      update: {
        applicationId: vehicle.applicationId,
        make: vehicle.make ?? null,
        model: vehicle.model ?? null,
        year: vehicle.year ?? null,
        color: vehicle.color ?? null,
        plateNumber: vehicle.plateNumber ?? null,
        registrationExpiry: toDateOnly(vehicle.registrationExpiry),
        insuranceExpiry: toDateOnly(vehicle.insuranceExpiry),
        fitnessExpiry: toDateOnly(vehicle.fitnessExpiry),
        updatedAt: new Date(vehicle.updatedAt),
      },
      create: {
        id: vehicle.id,
        applicationId: vehicle.applicationId,
        make: vehicle.make ?? null,
        model: vehicle.model ?? null,
        year: vehicle.year ?? null,
        color: vehicle.color ?? null,
        plateNumber: vehicle.plateNumber ?? null,
        registrationExpiry: toDateOnly(vehicle.registrationExpiry),
        insuranceExpiry: toDateOnly(vehicle.insuranceExpiry),
        fitnessExpiry: toDateOnly(vehicle.fitnessExpiry),
        createdAt: new Date(vehicle.createdAt),
        updatedAt: new Date(vehicle.updatedAt),
      },
    });
  }

  for (const document of supportedDocuments) {
    await tx.slyderApplicationDocument.upsert({
      where: { id: document.id },
      update: {
        applicationId: document.applicationId,
        type: document.type,
        fileUrl: document.fileUrl,
        storageKey: document.storageKey,
        fileName: document.fileName,
        mimeType: document.mimeType,
        verificationStatus: document.verificationStatus,
        rejectionReason: document.rejectionReason ?? null,
        uploadedAt: new Date(document.uploadedAt),
        reviewedAt: toDate(document.reviewedAt),
        reviewedBy: document.reviewedBy ?? null,
      },
      create: {
        id: document.id,
        applicationId: document.applicationId,
        type: document.type,
        fileUrl: document.fileUrl,
        storageKey: document.storageKey,
        fileName: document.fileName,
        mimeType: document.mimeType,
        verificationStatus: document.verificationStatus,
        rejectionReason: document.rejectionReason ?? null,
        uploadedAt: new Date(document.uploadedAt),
        reviewedAt: toDate(document.reviewedAt),
        reviewedBy: document.reviewedBy ?? null,
      },
    });
  }

  for (const profile of supportedSlyderProfiles) {
    await tx.slyderProfile.upsert({
      where: { id: profile.id },
      update: {
        userId: profile.userId,
        applicationId: profile.applicationId,
        coverageZoneId: isUuid(profile.coverageZoneId) ? profile.coverageZoneId : null,
        displayName: profile.displayName,
        phone: profile.phone,
        email: profile.email,
        courierType: profile.courierType,
        onboardingStatus: profile.onboardingStatus,
        readinessStatus: profile.readinessStatus,
        operationalStatus: profile.operationalStatus,
        accountStatus: profile.accountStatus,
        contractAccepted: profile.contractAccepted,
        contractAcceptedAt: toDate(profile.contractAcceptedAt),
        vehicleVerified: profile.vehicleVerified,
        payoutSetupComplete: profile.payoutSetupComplete,
        profileComplete: profile.profileComplete,
        trainingComplete: profile.trainingComplete,
        permissionsComplete: profile.permissionsComplete,
        requiredAgreementsAccepted: profile.requiredAgreementsAccepted,
        setupCompletedAt: toDate(profile.setupCompletedAt),
        trainingAcknowledgedAt: toDate(profile.trainingAcknowledgedAt),
        activatedAt: toDate(profile.activatedAt),
        canGoOnline: profile.canGoOnline,
        canReceiveOrders: profile.canReceiveOrders,
        profileConfirmed: profile.readinessChecklist?.profileConfirmed ?? false,
        vehicleConfirmed: profile.readinessChecklist?.vehicleConfirmed ?? profile.vehicleVerified,
        payoutConfigured: profile.readinessChecklist?.payoutConfigured ?? profile.payoutSetupComplete,
        legalAccepted: profile.readinessChecklist?.legalAccepted ?? profile.requiredAgreementsAccepted,
        locationPermissionConfirmed: profile.readinessChecklist?.locationPermissionConfirmed ?? false,
        notificationPermissionConfirmed: profile.readinessChecklist?.notificationPermissionConfirmed ?? false,
        equipmentConfirmed: profile.readinessChecklist?.equipmentConfirmed ?? false,
        trainingAcknowledged: profile.readinessChecklist?.trainingAcknowledged ?? false,
        emergencyContactConfirmed: profile.readinessChecklist?.emergencyContactConfirmed ?? false,
        readinessChecklistStatus: profile.readinessChecklist?.overallStatus ?? profile.readinessStatus,
        readinessChecklistCreatedAt: toDate(profile.readinessChecklist?.createdAt),
        readinessChecklistUpdatedAt: toDate(profile.readinessChecklist?.updatedAt),
        approvedAt: new Date(profile.approvedAt),
        approvedBy: profile.approvedBy,
        updatedAt: new Date(profile.updatedAt),
      },
      create: {
        id: profile.id,
        userId: profile.userId,
        applicationId: profile.applicationId,
        coverageZoneId: isUuid(profile.coverageZoneId) ? profile.coverageZoneId : null,
        displayName: profile.displayName,
        phone: profile.phone,
        email: profile.email,
        courierType: profile.courierType,
        onboardingStatus: profile.onboardingStatus,
        readinessStatus: profile.readinessStatus,
        operationalStatus: profile.operationalStatus,
        accountStatus: profile.accountStatus,
        contractAccepted: profile.contractAccepted,
        contractAcceptedAt: toDate(profile.contractAcceptedAt),
        vehicleVerified: profile.vehicleVerified,
        payoutSetupComplete: profile.payoutSetupComplete,
        profileComplete: profile.profileComplete,
        trainingComplete: profile.trainingComplete,
        permissionsComplete: profile.permissionsComplete,
        requiredAgreementsAccepted: profile.requiredAgreementsAccepted,
        setupCompletedAt: toDate(profile.setupCompletedAt),
        trainingAcknowledgedAt: toDate(profile.trainingAcknowledgedAt),
        activatedAt: toDate(profile.activatedAt),
        canGoOnline: profile.canGoOnline,
        canReceiveOrders: profile.canReceiveOrders,
        profileConfirmed: profile.readinessChecklist?.profileConfirmed ?? false,
        vehicleConfirmed: profile.readinessChecklist?.vehicleConfirmed ?? profile.vehicleVerified,
        payoutConfigured: profile.readinessChecklist?.payoutConfigured ?? profile.payoutSetupComplete,
        legalAccepted: profile.readinessChecklist?.legalAccepted ?? profile.requiredAgreementsAccepted,
        locationPermissionConfirmed: profile.readinessChecklist?.locationPermissionConfirmed ?? false,
        notificationPermissionConfirmed: profile.readinessChecklist?.notificationPermissionConfirmed ?? false,
        equipmentConfirmed: profile.readinessChecklist?.equipmentConfirmed ?? false,
        trainingAcknowledged: profile.readinessChecklist?.trainingAcknowledged ?? false,
        emergencyContactConfirmed: profile.readinessChecklist?.emergencyContactConfirmed ?? false,
        readinessChecklistStatus: profile.readinessChecklist?.overallStatus ?? profile.readinessStatus,
        readinessChecklistCreatedAt: toDate(profile.readinessChecklist?.createdAt),
        readinessChecklistUpdatedAt: toDate(profile.readinessChecklist?.updatedAt),
        approvedAt: new Date(profile.approvedAt),
        approvedBy: profile.approvedBy,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      },
    });
  }

  for (const historyItem of supportedHistory) {
    await tx.statusHistory.upsert({
      where: { id: historyItem.id },
      update: {
        entityType: historyItem.entityType,
        entityId: historyItem.entityId,
        eventType: historyItem.eventType,
        actorUserId: historyItem.actorUserId ?? null,
        actorLabel: historyItem.actorLabel ?? null,
        metadata: (historyItem.metadata ?? undefined) as any,
        createdAt: new Date(historyItem.createdAt),
      },
      create: {
        id: historyItem.id,
        entityType: historyItem.entityType,
        entityId: historyItem.entityId,
        eventType: historyItem.eventType,
        actorUserId: historyItem.actorUserId ?? null,
        actorLabel: historyItem.actorLabel ?? null,
        metadata: (historyItem.metadata ?? undefined) as any,
        createdAt: new Date(historyItem.createdAt),
      },
    });
  }

  for (const application of supportedEmployeeApplications) {
    await tx.employeeApplication.upsert({
      where: { id: application.id },
      update: {
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        roleInterest: application.roleInterest,
        departmentInterest: application.departmentInterest,
        employmentType: application.employmentType,
        location: application.location,
        experienceSummary: application.experienceSummary,
        managerTrackInterest: application.managerTrackInterest ?? null,
        resumeUrl: application.resumeUrl ?? null,
        notes: application.notes ?? null,
        status: application.status,
        submittedAt: new Date(application.submittedAt),
        reviewedAt: toDate(application.reviewedAt),
        reviewedByLabel: application.reviewedBy ?? null,
        linkedUserId: application.linkedUserId ?? null,
        linkedEmployeeProfileId: application.linkedEmployeeProfileId ?? null,
        updatedAt: new Date(application.updatedAt),
      },
      create: {
        id: application.id,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        roleInterest: application.roleInterest,
        departmentInterest: application.departmentInterest,
        employmentType: application.employmentType,
        location: application.location,
        experienceSummary: application.experienceSummary,
        managerTrackInterest: application.managerTrackInterest ?? null,
        resumeUrl: application.resumeUrl ?? null,
        notes: application.notes ?? null,
        status: application.status,
        submittedAt: new Date(application.submittedAt),
        reviewedAt: toDate(application.reviewedAt),
        reviewedByLabel: application.reviewedBy ?? null,
        linkedUserId: application.linkedUserId ?? null,
        linkedEmployeeProfileId: application.linkedEmployeeProfileId ?? null,
        createdAt: new Date(application.createdAt),
        updatedAt: new Date(application.updatedAt),
      },
    });
  }

  for (const profile of supportedEmployeeProfiles) {
    await tx.employeeProfile.upsert({
      where: { id: profile.id },
      update: {
        userId: profile.userId,
        employeeCode: profile.employeeCode,
        displayName: profile.displayName,
        department: profile.department,
        title: profile.title,
        employmentType: profile.employmentType,
        managerUserId: profile.managerUserId ?? null,
        startDate: new Date(`${profile.startDate}T00:00:00.000Z`),
        locationLabel: profile.locationLabel,
        payrollFrequency: profile.payrollFrequency,
        payoutMethod: profile.payoutMethod,
        payoutAccountMasked: profile.payoutAccountMasked ?? null,
        isOnboarded: profile.isOnboarded,
        onboardingCompletedAt: toDate(profile.onboardingCompletedAt),
        emergencyContactName: profile.emergencyContactName ?? null,
        emergencyContactPhone: profile.emergencyContactPhone ?? null,
        updatedAt: new Date(profile.updatedAt),
      },
      create: {
        id: profile.id,
        userId: profile.userId,
        employeeCode: profile.employeeCode,
        displayName: profile.displayName,
        department: profile.department,
        title: profile.title,
        employmentType: profile.employmentType,
        managerUserId: profile.managerUserId ?? null,
        startDate: new Date(`${profile.startDate}T00:00:00.000Z`),
        locationLabel: profile.locationLabel,
        payrollFrequency: profile.payrollFrequency,
        payoutMethod: profile.payoutMethod,
        payoutAccountMasked: profile.payoutAccountMasked ?? null,
        isOnboarded: profile.isOnboarded,
        onboardingCompletedAt: toDate(profile.onboardingCompletedAt),
        emergencyContactName: profile.emergencyContactName ?? null,
        emergencyContactPhone: profile.emergencyContactPhone ?? null,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      },
    });
  }

  for (const announcement of supportedEmployeeAnnouncements) {
    await tx.employeeAnnouncement.upsert({
      where: { id: announcement.id },
      update: {
        title: announcement.title,
        excerpt: announcement.excerpt,
        body: announcement.body,
        audience: announcement.audience,
        publishedByUserId: announcement.publishedByUserId ?? null,
        priority: announcement.priority,
        publishedAt: new Date(announcement.publishedAt),
        updatedAt: new Date(announcement.updatedAt),
      },
      create: {
        id: announcement.id,
        title: announcement.title,
        excerpt: announcement.excerpt,
        body: announcement.body,
        audience: announcement.audience,
        publishedByUserId: announcement.publishedByUserId ?? null,
        priority: announcement.priority,
        publishedAt: new Date(announcement.publishedAt),
        createdAt: new Date(announcement.createdAt),
        updatedAt: new Date(announcement.updatedAt),
      },
    });
  }

  for (const guide of supportedEmployeeGuides) {
    await tx.employeeGuide.upsert({
      where: { id: guide.id },
      update: {
        slug: guide.slug,
        title: guide.title,
        summary: guide.summary,
        category: guide.category,
        audience: guide.audience,
        contentMarkdown: guide.contentMarkdown,
        isFeatured: guide.isFeatured,
        updatedAt: new Date(guide.updatedAt),
      },
      create: {
        id: guide.id,
        slug: guide.slug,
        title: guide.title,
        summary: guide.summary,
        category: guide.category,
        audience: guide.audience,
        contentMarkdown: guide.contentMarkdown,
        isFeatured: guide.isFeatured,
        createdAt: new Date(guide.createdAt),
        updatedAt: new Date(guide.updatedAt),
      },
    });
  }

  for (const acknowledgement of supportedEmployeeGuideAcknowledgements) {
    await tx.employeeGuideAcknowledgement.upsert({
      where: { id: acknowledgement.id },
      update: {
        guideId: acknowledgement.guideId,
        employeeProfileId: acknowledgement.employeeProfileId,
        acknowledgedAt: new Date(acknowledgement.acknowledgedAt),
        createdAt: new Date(acknowledgement.createdAt),
      },
      create: {
        id: acknowledgement.id,
        guideId: acknowledgement.guideId,
        employeeProfileId: acknowledgement.employeeProfileId,
        acknowledgedAt: new Date(acknowledgement.acknowledgedAt),
        createdAt: new Date(acknowledgement.createdAt),
      },
    });
  }

  for (const payrollRecord of supportedEmployeePayrollRecords) {
    await tx.employeePayrollRecord.upsert({
      where: { id: payrollRecord.id },
      update: {
        employeeProfileId: payrollRecord.employeeProfileId,
        payPeriodStart: new Date(`${payrollRecord.payPeriodStart}T00:00:00.000Z`),
        payPeriodEnd: new Date(`${payrollRecord.payPeriodEnd}T00:00:00.000Z`),
        grossAmount: payrollRecord.grossAmount,
        deductionsAmount: payrollRecord.deductionsAmount,
        netAmount: payrollRecord.netAmount,
        status: payrollRecord.status,
        payDate: new Date(`${payrollRecord.payDate}T00:00:00.000Z`),
        updatedAt: new Date(payrollRecord.updatedAt),
      },
      create: {
        id: payrollRecord.id,
        employeeProfileId: payrollRecord.employeeProfileId,
        payPeriodStart: new Date(`${payrollRecord.payPeriodStart}T00:00:00.000Z`),
        payPeriodEnd: new Date(`${payrollRecord.payPeriodEnd}T00:00:00.000Z`),
        grossAmount: payrollRecord.grossAmount,
        deductionsAmount: payrollRecord.deductionsAmount,
        netAmount: payrollRecord.netAmount,
        status: payrollRecord.status,
        payDate: new Date(`${payrollRecord.payDate}T00:00:00.000Z`),
        createdAt: new Date(payrollRecord.createdAt),
        updatedAt: new Date(payrollRecord.updatedAt),
      },
    });
  }

  for (const payoutRecord of supportedEmployeePayoutRecords) {
    await tx.employeePayoutRecord.upsert({
      where: { id: payoutRecord.id },
      update: {
        employeeProfileId: payoutRecord.employeeProfileId,
        sourceLabel: payoutRecord.sourceLabel,
        amount: payoutRecord.amount,
        status: payoutRecord.status,
        payoutDate: new Date(`${payoutRecord.payoutDate}T00:00:00.000Z`),
        updatedAt: new Date(payoutRecord.updatedAt),
      },
      create: {
        id: payoutRecord.id,
        employeeProfileId: payoutRecord.employeeProfileId,
        sourceLabel: payoutRecord.sourceLabel,
        amount: payoutRecord.amount,
        status: payoutRecord.status,
        payoutDate: new Date(`${payoutRecord.payoutDate}T00:00:00.000Z`),
        createdAt: new Date(payoutRecord.createdAt),
        updatedAt: new Date(payoutRecord.updatedAt),
      },
    });
  }

  for (const template of supportedNotificationTemplates) {
    await tx.notificationTemplate.upsert({
      where: { id: template.id },
      update: {
        key: template.key,
        name: template.name,
        actorType: template.actorType,
        eventType: template.eventType,
        channel: template.channel,
        subject: template.subject ?? null,
        bodyTemplate: template.bodyTemplate,
        plainTextTemplate: template.plainTextTemplate ?? null,
        isActive: template.isActive,
        version: template.version,
        locale: template.locale ?? null,
        description: template.description ?? null,
        updatedAt: new Date(template.updatedAt),
      },
      create: {
        id: template.id,
        key: template.key,
        name: template.name,
        actorType: template.actorType,
        eventType: template.eventType,
        channel: template.channel,
        subject: template.subject ?? null,
        bodyTemplate: template.bodyTemplate,
        plainTextTemplate: template.plainTextTemplate ?? null,
        isActive: template.isActive,
        version: template.version,
        locale: template.locale ?? null,
        description: template.description ?? null,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      },
    });
  }

  for (const trigger of supportedNotificationTriggers) {
    await tx.notificationTriggerEvent.upsert({
      where: { id: trigger.id },
      update: {
        eventKey: trigger.eventKey,
        relatedEntityType: trigger.relatedEntityType ?? null,
        relatedEntityId: trigger.relatedEntityId ?? null,
        actorType: trigger.actorType ?? null,
        actorId: trigger.actorId ?? null,
        payload: (trigger.payload ?? undefined) as any,
        status: trigger.status,
        errorMessage: trigger.errorMessage ?? null,
        updatedAt: new Date(trigger.updatedAt),
      },
      create: {
        id: trigger.id,
        eventKey: trigger.eventKey,
        relatedEntityType: trigger.relatedEntityType ?? null,
        relatedEntityId: trigger.relatedEntityId ?? null,
        actorType: trigger.actorType ?? null,
        actorId: trigger.actorId ?? null,
        payload: (trigger.payload ?? undefined) as any,
        status: trigger.status,
        errorMessage: trigger.errorMessage ?? null,
        createdAt: new Date(trigger.createdAt),
        updatedAt: new Date(trigger.updatedAt),
      },
    });
  }

  for (const notification of supportedNotifications) {
    await tx.notificationRecord.upsert({
      where: { id: notification.id },
      update: {
        templateId: notification.templateId ?? null,
        templateKey: notification.templateKey ?? null,
        triggerEventId: notification.triggerEventId ?? null,
        triggerEventKey: notification.triggerEventKey ?? null,
        dedupeKey: notification.dedupeKey ?? null,
        actorType: notification.actorType ?? null,
        actorId: notification.actorId ?? null,
        relatedEntityType: notification.relatedEntityType ?? null,
        relatedEntityId: notification.relatedEntityId ?? null,
        userId: notification.userId ?? null,
        applicationId: notification.applicationId ?? null,
        slyderProfileId: notification.slyderProfileId ?? null,
        channel: notification.channel,
        template: notification.template,
        recipient: notification.recipient ?? null,
        recipientName: notification.recipientName ?? null,
        status: notification.status ?? null,
        providerName: notification.providerName ?? null,
        providerMessageId: notification.providerMessageId ?? null,
        subjectSnapshot: notification.subjectSnapshot ?? null,
        bodySnapshot: notification.bodySnapshot ?? null,
        variablesSnapshot: (notification.variablesSnapshot ?? undefined) as any,
        failureReason: notification.failureReason ?? null,
        resentFromId: notification.resentFromId ?? null,
        retryCount: notification.retryCount ?? null,
        lastAttemptAt: toDate(notification.lastAttemptAt),
        sentAt: toDate(notification.sentAt),
        deliveredAt: toDate(notification.deliveredAt),
        createdBySystem: notification.createdBySystem ?? null,
        triggeredByUserId: notification.triggeredByUserId ?? null,
        metadata: (notification.metadata ?? undefined) as any,
        payload: notification.payload as any,
        updatedAt: toDate(notification.updatedAt),
      },
      create: {
        id: notification.id,
        templateId: notification.templateId ?? null,
        templateKey: notification.templateKey ?? null,
        triggerEventId: notification.triggerEventId ?? null,
        triggerEventKey: notification.triggerEventKey ?? null,
        dedupeKey: notification.dedupeKey ?? null,
        actorType: notification.actorType ?? null,
        actorId: notification.actorId ?? null,
        relatedEntityType: notification.relatedEntityType ?? null,
        relatedEntityId: notification.relatedEntityId ?? null,
        userId: notification.userId ?? null,
        applicationId: notification.applicationId ?? null,
        slyderProfileId: notification.slyderProfileId ?? null,
        channel: notification.channel,
        template: notification.template,
        recipient: notification.recipient ?? null,
        recipientName: notification.recipientName ?? null,
        status: notification.status ?? null,
        providerName: notification.providerName ?? null,
        providerMessageId: notification.providerMessageId ?? null,
        subjectSnapshot: notification.subjectSnapshot ?? null,
        bodySnapshot: notification.bodySnapshot ?? null,
        variablesSnapshot: (notification.variablesSnapshot ?? undefined) as any,
        failureReason: notification.failureReason ?? null,
        resentFromId: notification.resentFromId ?? null,
        retryCount: notification.retryCount ?? null,
        lastAttemptAt: toDate(notification.lastAttemptAt),
        sentAt: toDate(notification.sentAt),
        deliveredAt: toDate(notification.deliveredAt),
        createdBySystem: notification.createdBySystem ?? null,
        triggeredByUserId: notification.triggeredByUserId ?? null,
        metadata: (notification.metadata ?? undefined) as any,
        payload: notification.payload as any,
        createdAt: new Date(notification.createdAt),
        updatedAt: toDate(notification.updatedAt),
      },
    });
  }

  for (const document of supportedLegalDocuments) {
    await tx.legalDocument.upsert({
      where: { id: document.id },
      update: {
        documentType: document.documentType,
        categoryKey: document.categoryKey,
        actorScopes: document.actorScopes,
        requiresAcceptance: document.requiresAcceptance,
        version: document.version,
        title: document.title,
        slug: document.slug,
        contentMarkdown: document.contentMarkdown,
        summary: document.summary ?? null,
        excerpt: document.excerpt ?? null,
        status: document.status,
        isActive: document.isActive,
        effectiveFrom: toDate(document.effectiveFrom),
        publishedAt: toDate(document.publishedAt),
        archivedAt: toDate(document.archivedAt),
        createdBy: document.createdBy ?? null,
        updatedBy: document.updatedBy ?? null,
        updatedAt: new Date(document.updatedAt),
      },
      create: {
        id: document.id,
        documentType: document.documentType,
        categoryKey: document.categoryKey,
        actorScopes: document.actorScopes,
        requiresAcceptance: document.requiresAcceptance,
        version: document.version,
        title: document.title,
        slug: document.slug,
        contentMarkdown: document.contentMarkdown,
        summary: document.summary ?? null,
        excerpt: document.excerpt ?? null,
        status: document.status,
        isActive: document.isActive,
        effectiveFrom: toDate(document.effectiveFrom),
        publishedAt: toDate(document.publishedAt),
        archivedAt: toDate(document.archivedAt),
        createdBy: document.createdBy ?? null,
        updatedBy: document.updatedBy ?? null,
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      },
    });
  }

  for (const acceptance of supportedLegalAcceptances) {
    await tx.legalAcceptance.upsert({
      where: { id: acceptance.id },
      update: {
        actorType: acceptance.actorType,
        actorId: acceptance.actorId,
        documentId: acceptance.documentId,
        documentType: acceptance.documentType,
        documentTitleSnapshot: acceptance.documentTitleSnapshot,
        documentVersion: acceptance.documentVersion,
        acceptedAt: new Date(acceptance.acceptedAt),
        ipAddress: acceptance.ipAddress ?? null,
        userAgent: acceptance.userAgent ?? null,
        acceptanceSource: acceptance.acceptanceSource,
        checkboxLabelSnapshot: acceptance.checkboxLabelSnapshot ?? null,
        metadata: (acceptance.metadata ?? undefined) as any,
        updatedAt: new Date(acceptance.updatedAt),
      },
      create: {
        id: acceptance.id,
        actorType: acceptance.actorType,
        actorId: acceptance.actorId,
        documentId: acceptance.documentId,
        documentType: acceptance.documentType,
        documentTitleSnapshot: acceptance.documentTitleSnapshot,
        documentVersion: acceptance.documentVersion,
        acceptedAt: new Date(acceptance.acceptedAt),
        ipAddress: acceptance.ipAddress ?? null,
        userAgent: acceptance.userAgent ?? null,
        acceptanceSource: acceptance.acceptanceSource,
        checkboxLabelSnapshot: acceptance.checkboxLabelSnapshot ?? null,
        metadata: (acceptance.metadata ?? undefined) as any,
        createdAt: new Date(acceptance.createdAt),
        updatedAt: new Date(acceptance.updatedAt),
      },
    });
  }

  for (const historyItem of supportedLegalPublishHistory) {
    await tx.legalDocumentPublishHistory.upsert({
      where: { id: historyItem.id },
      update: {
        legalDocumentId: historyItem.legalDocumentId,
        action: historyItem.action,
        note: historyItem.note ?? null,
        actedBy: historyItem.actedBy ?? null,
        createdAt: new Date(historyItem.createdAt),
      },
      create: {
        id: historyItem.id,
        legalDocumentId: historyItem.legalDocumentId,
        action: historyItem.action,
        note: historyItem.note ?? null,
        actedBy: historyItem.actedBy ?? null,
        createdAt: new Date(historyItem.createdAt),
      },
    });
  }

  for (const zone of supportedCoverageZones) {
    await tx.coverageZone.upsert({
      where: { id: zone.id },
      update: {
        name: zone.name,
        parish: zone.parish,
        requiredReadySlyders: zone.requiredReadySlyders,
        merchantAvailability: zone.merchantAvailability,
        estimatedLaunchLabel: zone.estimatedLaunchLabel,
        isLive: zone.isLive,
        isPaused: zone.isPaused,
        notes: zone.notes ?? null,
        updatedAt: new Date(zone.updatedAt),
      },
      create: {
        id: zone.id,
        name: zone.name,
        parish: zone.parish,
        requiredReadySlyders: zone.requiredReadySlyders,
        merchantAvailability: zone.merchantAvailability,
        estimatedLaunchLabel: zone.estimatedLaunchLabel,
        isLive: zone.isLive,
        isPaused: zone.isPaused,
        notes: zone.notes ?? null,
        createdAt: new Date(zone.createdAt),
        updatedAt: new Date(zone.updatedAt),
      },
    });
  }

  for (const merchant of supportedMerchantInterests) {
    await tx.merchantInterest.upsert({
      where: { id: merchant.id },
      update: {
        companyName: merchant.companyName,
        contactName: merchant.contactName,
        email: merchant.email,
        phone: merchant.phone,
        whatsappNumber: merchant.whatsappNumber ?? null,
        businessType: merchant.businessType,
        deliveryVolume: merchant.deliveryVolume,
        coverageNeeds: merchant.coverageNeeds,
        goals: merchant.goals,
        parish: merchant.parish ?? null,
        town: merchant.town ?? null,
        zoneId: merchant.zoneId ?? null,
        zoneName: merchant.zoneName ?? null,
        operationalNotes: merchant.operationalNotes ?? null,
        lifecycleStatus: merchant.lifecycleStatus,
        linkedMerchantUserId: merchant.linkedMerchantUserId ?? null,
        updatedAt: new Date(merchant.updatedAt),
      },
      create: {
        id: merchant.id,
        companyName: merchant.companyName,
        contactName: merchant.contactName,
        email: merchant.email,
        phone: merchant.phone,
        whatsappNumber: merchant.whatsappNumber ?? null,
        businessType: merchant.businessType,
        deliveryVolume: merchant.deliveryVolume,
        coverageNeeds: merchant.coverageNeeds,
        goals: merchant.goals,
        parish: merchant.parish ?? null,
        town: merchant.town ?? null,
        zoneId: merchant.zoneId ?? null,
        zoneName: merchant.zoneName ?? null,
        operationalNotes: merchant.operationalNotes ?? null,
        lifecycleStatus: merchant.lifecycleStatus,
        linkedMerchantUserId: merchant.linkedMerchantUserId ?? null,
        createdAt: new Date(merchant.createdAt),
        updatedAt: new Date(merchant.updatedAt),
      },
    });
  }
}

export class PrismaRepository implements PersistenceRepository {
  readonly driver = "prisma" as const;

  async readSnapshot(): Promise<OnboardingStore> {
    const store = await createSeedStore();
    return overlaySupportedPrismaSlices(store);
  }

  async transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
    const store = await this.readSnapshot();
    const result = await mutator(store);

    await prisma.$transaction(async (tx) => {
      await persistSupportedPrismaSlices(tx as PrismaTransactionClient, store);
    });

    return result;
  }
}

export const prismaRepository = new PrismaRepository();
