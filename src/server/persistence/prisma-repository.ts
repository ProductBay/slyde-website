import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { PersistenceRepository } from "@/server/persistence/repository";
import { createSeedStore } from "@/server/persistence/store";
import type {
  ActivationToken,
  AdminReferralFilters,
  DeliveryLeg,
  DeliveryTransferPlan,
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
  MerchantAddress,
  MerchantApplication,
  MerchantDelivery,
  MerchantDispatchEvent,
  MerchantIntegrationProfile,
  MerchantInterestRecord,
  MerchantLead,
  MerchantNotificationPreference,
  MerchantOnboardingEvent,
  MerchantOrder,
  MerchantTeamMember,
  NotificationRecord,
  NotificationTemplate,
  NotificationTriggerEvent,
  OnboardingStore,
  OtpChallenge,
  PartnerCarrier,
  PartnerHandoffLocation,
  PartnerTrackingEvent,
  PublicSlyderReferral,
  ReferralEvent,
  SessionRecord,
  ReferrerAccount,
  ReferrerLoginChallenge,
  ReferrerSession,
  ReferralReward,
  ReferralRewardAudit,
  SupportContextSnapshot,
  SupportConversation,
  SupportEvent,
  SupportHandoff,
  SupportKnowledgeArticle,
  SupportMessage,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderApplicationVehicle,
  SlyderProfile,
  SlyderStatusHistory,
  StoredUser,
} from "@/types/backend/onboarding";
import type { ReferralRewardWithReferral } from "@/server/persistence/repository";

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

function mapMerchantLead(record: any): MerchantLead | null {
  if (!record) return null;

  return {
    id: record.id,
    businessName: record.businessName,
    contactName: record.contactName,
    phone: record.phone,
    email: record.email,
    parish: record.parish,
    town: record.town,
    category: record.category,
    instagramHandle: record.instagramHandle ?? undefined,
    website: record.website ?? undefined,
    orderChannels: Array.isArray(record.orderChannels) ? (record.orderChannels as string[]) : [],
    averageDailyOrders: record.averageDailyOrders ?? undefined,
    currentDeliveryMethod: record.currentDeliveryMethod ?? undefined,
    preferredStartTimeline: record.preferredStartTimeline ?? undefined,
    productIntent: record.productIntent,
    status: record.status,
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantApplication(record: any): MerchantApplication | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantLeadId: record.merchantLeadId,
    onboardingTrack: record.onboardingTrack,
    storeName: record.storeName ?? undefined,
    logoUrl: record.logoUrl ?? undefined,
    heroBannerUrl: record.heroBannerUrl ?? undefined,
    heroBannerPosition:
      record.heroBannerPosition === "left" || record.heroBannerPosition === "right" || record.heroBannerPosition === "center"
        ? record.heroBannerPosition
        : undefined,
    businessDescription: record.businessDescription ?? undefined,
    category: record.category ?? undefined,
    pickupAddress: record.pickupAddress ?? undefined,
    serviceAreas: Array.isArray(record.serviceAreas) ? (record.serviceAreas as string[]) : [],
    fulfillmentMode: record.fulfillmentMode ?? undefined,
    catalogReady: record.catalogReady ?? undefined,
    payoutDetails:
      record.payoutDetails && typeof record.payoutDetails === "object" && !Array.isArray(record.payoutDetails)
        ? (record.payoutDetails as Record<string, unknown>)
        : undefined,
    operatingHours:
      record.operatingHours && typeof record.operatingHours === "object" && !Array.isArray(record.operatingHours)
        ? (record.operatingHours as Record<string, unknown>)
        : undefined,
    documentStatus: record.documentStatus,
    legalStatus: record.legalStatus,
    approvalStatus: record.approvalStatus,
    activationStatus: record.activationStatus,
    businessLicenseStatus: record.businessLicenseStatus ?? "missing",
    businessLicenseNumber: record.businessLicenseNumber ?? undefined,
    businessLicenseSubmittedAt: toIso(record.businessLicenseSubmittedAt),
    businessLicenseVerifiedAt: toIso(record.businessLicenseVerifiedAt),
    businessLicenseGraceEndsAt: toIso(record.businessLicenseGraceEndsAt),
    businessLicenseRequiredAfterDeliveries: record.businessLicenseRequiredAfterDeliveries ?? 10,
    businessLicenseDisabledAt: toIso(record.businessLicenseDisabledAt),
    assignedAdminId: record.assignedAdminId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantIntegrationProfile(record: any): MerchantIntegrationProfile | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantApplicationId: record.merchantApplicationId,
    dispatchMode: record.dispatchMode,
    acceptsCOD: record.acceptsCOD,
    averageBasketSize: record.averageBasketSize ?? undefined,
    packageTypes: Array.isArray(record.packageTypes) ? (record.packageTypes as string[]) : [],
    operatingHours:
      record.operatingHours && typeof record.operatingHours === "object" && !Array.isArray(record.operatingHours)
        ? (record.operatingHours as Record<string, unknown>)
        : undefined,
    orderSources: Array.isArray(record.orderSources) ? (record.orderSources as string[]) : [],
    pickupLocations: Array.isArray(record.pickupLocations) ? (record.pickupLocations as string[]) : [],
    deliveryRadius: record.deliveryRadius ?? undefined,
    sameDaySupported: record.sameDaySupported,
    scheduledSupported: record.scheduledSupported,
    integrationReadiness: record.integrationReadiness,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantOnboardingEvent(record: any): MerchantOnboardingEvent | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantApplicationId: record.merchantApplicationId,
    eventType: record.eventType,
    actorType: record.actorType,
    actorId: record.actorId ?? undefined,
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapMerchantOrder(record: any): MerchantOrder | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantId: record.merchantId,
    orderNumber: record.orderNumber,
    customerName: record.customerName,
    customerPhone: record.customerPhone,
    deliveryAddress: record.deliveryAddress,
    pickupLocationId: record.pickupLocationId ?? undefined,
    pickupAddressSnapshot: record.pickupAddressSnapshot ?? undefined,
    itemDescription: record.itemDescription,
    packageType: record.packageType,
    paymentType: record.paymentType,
    codAmount: record.codAmount === null || record.codAmount === undefined ? undefined : Number(record.codAmount),
    internalNote: record.internalNote ?? undefined,
    riderNote: record.riderNote ?? undefined,
    requestedTiming: record.requestedTiming,
    scheduledFor: toIso(record.scheduledFor),
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantDelivery(record: any): MerchantDelivery | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantOrderId: record.merchantOrderId,
    merchantId: record.merchantId,
    dispatchMode: record.dispatchMode,
    riderId: record.riderId ?? undefined,
    quoteAmount: record.quoteAmount === null || record.quoteAmount === undefined ? undefined : Number(record.quoteAmount),
    assignedAt: toIso(record.assignedAt),
    pickedUpAt: toIso(record.pickedUpAt),
    deliveredAt: toIso(record.deliveredAt),
    failedAt: toIso(record.failedAt),
    cancelledAt: toIso(record.cancelledAt),
    status: record.status,
    proofOfDeliveryUrl: record.proofOfDeliveryUrl ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantAddress(record: any): MerchantAddress | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantId: record.merchantId,
    type: record.type,
    label: record.label,
    contactName: record.contactName,
    contactPhone: record.contactPhone,
    addressLine: record.addressLine,
    parish: record.parish,
    town: record.town,
    notes: record.notes ?? undefined,
    isDefault: record.isDefault,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantTeamMember(record: any): MerchantTeamMember | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantId: record.merchantId,
    userId: record.userId,
    role: record.role,
    status: record.status,
    invitedAt: toIso(record.invitedAt),
    joinedAt: toIso(record.joinedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantNotificationPreference(record: any): MerchantNotificationPreference | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantId: record.merchantId,
    emailEnabled: record.emailEnabled,
    smsEnabled: record.smsEnabled,
    whatsappEnabled: record.whatsappEnabled,
    notifyOnAssigned: record.notifyOnAssigned,
    notifyOnDelivered: record.notifyOnDelivered,
    notifyOnFailed: record.notifyOnFailed,
    notifyOnBilling: record.notifyOnBilling,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapMerchantDispatchEvent(record: any): MerchantDispatchEvent | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantDeliveryId: record.merchantDeliveryId,
    eventType: record.eventType,
    actorType: record.actorType,
    actorId: record.actorId ?? undefined,
    notes: record.notes ?? undefined,
    metadata:
      record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
        ? (record.metadata as Record<string, unknown>)
        : undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapPartnerCarrier(record: any): PartnerCarrier | null {
  if (!record) return null;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    type: record.type,
    supportsTracking: record.supportsTracking,
    supportsApi: record.supportsApi,
    supportsFinalDelivery: record.supportsFinalDelivery,
    supportsBranchCollection: record.supportsBranchCollection,
    active: record.active,
    contactConfig:
      record.contactConfig && typeof record.contactConfig === "object" && !Array.isArray(record.contactConfig)
        ? (record.contactConfig as Record<string, unknown>)
        : undefined,
    trackingConfig:
      record.trackingConfig && typeof record.trackingConfig === "object" && !Array.isArray(record.trackingConfig)
        ? (record.trackingConfig as Record<string, unknown>)
        : undefined,
    webhookConfig:
      record.webhookConfig && typeof record.webhookConfig === "object" && !Array.isArray(record.webhookConfig)
        ? (record.webhookConfig as Record<string, unknown>)
        : undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapPartnerHandoffLocation(record: any): PartnerHandoffLocation | null {
  if (!record) return null;

  return {
    id: record.id,
    partnerCarrierId: record.partnerCarrierId,
    name: record.name,
    parish: record.parish,
    town: record.town,
    addressLine: record.addressLine,
    openingHours:
      record.openingHours && typeof record.openingHours === "object" && !Array.isArray(record.openingHours)
        ? (record.openingHours as Record<string, unknown>)
        : undefined,
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapDeliveryTransferPlan(record: any): DeliveryTransferPlan | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantDeliveryId: record.merchantDeliveryId,
    deliveryType: record.deliveryType,
    originParish: record.originParish,
    destinationParish: record.destinationParish,
    destinationTown: record.destinationTown ?? undefined,
    transferPartnerId: record.transferPartnerId,
    originHandoffLocationId: record.originHandoffLocationId ?? undefined,
    destinationHandoffLocationId: record.destinationHandoffLocationId ?? undefined,
    finalFulfillmentMethod: record.finalFulfillmentMethod,
    packageValue: record.packageValue === null || record.packageValue === undefined ? undefined : Number(record.packageValue),
    specialHandlingNotes: record.specialHandlingNotes ?? undefined,
    customerTrackingCode: record.customerTrackingCode,
    overallStatus: record.overallStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapDeliveryLeg(record: any): DeliveryLeg | null {
  if (!record) return null;

  return {
    id: record.id,
    merchantDeliveryId: record.merchantDeliveryId,
    transferPlanId: record.transferPlanId ?? undefined,
    legSequence: record.legSequence,
    legType: record.legType,
    providerType: record.providerType,
    providerId: record.providerId ?? undefined,
    originLabel: record.originLabel,
    originAddress: record.originAddress ?? undefined,
    destinationLabel: record.destinationLabel,
    destinationAddress: record.destinationAddress ?? undefined,
    partnerTrackingReference: record.partnerTrackingReference ?? undefined,
    status: record.status,
    eta: toIso(record.eta),
    startedAt: toIso(record.startedAt),
    completedAt: toIso(record.completedAt),
    failedAt: toIso(record.failedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapPartnerTrackingEvent(record: any): PartnerTrackingEvent | null {
  if (!record) return null;

  return {
    id: record.id,
    deliveryLegId: record.deliveryLegId,
    partnerCarrierId: record.partnerCarrierId,
    externalTrackingReference: record.externalTrackingReference ?? undefined,
    rawStatus: record.rawStatus,
    normalizedStatus: record.normalizedStatus,
    notes: record.notes ?? undefined,
    eventTimestamp: record.eventTimestamp.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapReferrerAccount(
  record: Awaited<ReturnType<typeof prisma.referrerAccount.findFirst>>,
): ReferrerAccount | null {
  if (!record) return null;

  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email ?? undefined,
    phone: record.phone ?? undefined,
    emailVerifiedAt: toIso(record.emailVerifiedAt),
    phoneVerifiedAt: toIso(record.phoneVerifiedAt),
    isEnabled: record.isEnabled,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapReferrerLoginChallenge(
  record: Awaited<ReturnType<typeof prisma.referrerLoginChallenge.findFirst>>,
): ReferrerLoginChallenge | null {
  if (!record) return null;

  return {
    id: record.id,
    referrerAccountId: record.referrerAccountId ?? undefined,
    channel: record.channel,
    email: record.email ?? undefined,
    phone: record.phone ?? undefined,
    codeHash: record.codeHash,
    expiresAt: record.expiresAt.toISOString(),
    consumedAt: toIso(record.consumedAt),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapReferrerSession(
  record: Awaited<ReturnType<typeof prisma.referrerSession.findFirst>>,
): ReferrerSession | null {
  if (!record) return null;

  return {
    id: record.id,
    referrerAccountId: record.referrerAccountId,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
  };
}

function mapPublicSlyderReferral(
  record: Awaited<ReturnType<typeof prisma.publicSlyderReferral.findFirst>>,
): PublicSlyderReferral | null {
  if (!record) return null;

  return {
    id: record.id,
    referralCode: record.referralCode,
    referrerName: record.referrerName,
    referrerPhone: record.referrerPhone,
    referrerEmail: record.referrerEmail ?? undefined,
    referrerAccountId: record.referrerAccountId ?? undefined,
    referredName: record.referredName,
    referredEmail: record.referredEmail ?? undefined,
    referredPhone: record.referredPhone,
    referredParish: record.referredParish ?? undefined,
    referredTown: record.referredTown ?? undefined,
    referredVehicleType: record.referredVehicleType ?? undefined,
    notes: record.notes ?? undefined,
    status: record.status as PublicSlyderReferral["status"],
    statusReason: record.statusReason ?? undefined,
    inviteEmailSentAt: toIso(record.inviteEmailSentAt),
    inviteEmailStatus: record.inviteEmailStatus ?? undefined,
    applicationStartedAt: toIso(record.applicationStartedAt),
    applicationCompletedAt: toIso(record.applicationCompletedAt),
    approvedAt: toIso(record.approvedAt),
    activatedAt: toIso(record.activatedAt),
    readyAt: toIso(record.readyAt),
    firstDeliveryCompletedAt: toIso(record.firstDeliveryCompletedAt),
    rewardEarnedAt: toIso(record.rewardEarnedAt),
    rewardClaimedAt: toIso(record.rewardClaimedAt),
    rewardGiftedAt: toIso(record.rewardGiftedAt),
    rewardRedeemedAt: toIso(record.rewardRedeemedAt),
    linkedSlyderApplicationId: record.linkedSlyderApplicationId ?? undefined,
    linkedSlyderProfileId: record.linkedSlyderProfileId ?? undefined,
    rewardId: record.rewardId ?? undefined,
    duplicateOfReferralId: record.duplicateOfReferralId ?? undefined,
    submittedIpHash: record.submittedIpHash ?? undefined,
    submittedUserAgent: record.submittedUserAgent ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapReferralEvent(
  record: Awaited<ReturnType<typeof prisma.referralEvent.findFirst>>,
): ReferralEvent | null {
  if (!record) return null;

  return {
    id: record.id,
    referralId: record.referralId,
    eventType: record.eventType,
    title: record.title,
    description: record.description ?? undefined,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapReferralReward(
  record: Awaited<ReturnType<typeof prisma.referralReward.findFirst>>,
): ReferralReward | null {
  if (!record) return null;

  return {
    id: record.id,
    publicReferralId: record.publicReferralId,
    rewardType: record.rewardType as ReferralReward["rewardType"],
    rewardValue: record.rewardValue,
    currency: record.currency,
    status: record.status as ReferralReward["status"],
    isTransferable: record.isTransferable,
    transferCount: record.transferCount,
    transferredAt: toIso(record.transferredAt),
    ownerCustomerAccountId: record.ownerCustomerAccountId ?? undefined,
    ownerPhone: record.ownerPhone ?? undefined,
    giftedToCustomerAccountId: record.giftedToCustomerAccountId ?? undefined,
    giftedToPhone: record.giftedToPhone ?? undefined,
    giftedByReferrerPhone: record.giftedByReferrerPhone ?? undefined,
    minOrderValue: record.minOrderValue ?? undefined,
    expiresAt: record.expiresAt.toISOString(),
    redeemedAt: toIso(record.redeemedAt),
    redemptionOrderId: record.redemptionOrderId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapReferralRewardAudit(
  record: Awaited<ReturnType<typeof prisma.referralRewardAudit.findFirst>>,
): ReferralRewardAudit | null {
  if (!record) return null;

  return {
    id: record.id,
    rewardId: record.rewardId,
    action: record.action,
    actorType: record.actorType,
    actorId: record.actorId ?? undefined,
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString(),
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

function mapSupportConversation(record: any): SupportConversation | null {
  if (!record) return null;
  return {
    id: record.id,
    channel: record.channel,
    domain: record.domain,
    status: record.status,
    priority: record.priority,
    subject: record.subject,
    externalProvider: record.externalProvider ?? undefined,
    externalConversationId: record.externalConversationId ?? undefined,
    externalTicketId: record.externalTicketId ?? undefined,
    userId: record.userId ?? undefined,
    merchantId: record.merchantId ?? undefined,
    slyderProfileId: record.slyderProfileId ?? undefined,
    employeeProfileId: record.employeeProfileId ?? undefined,
    referrerAccountId: record.referrerAccountId ?? undefined,
    assignedTeam: record.assignedTeam ?? undefined,
    assignedAgentId: record.assignedAgentId ?? undefined,
    lastMessageAt: toIso(record.lastMessageAt),
    resolvedAt: toIso(record.resolvedAt),
    closedAt: toIso(record.closedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapSupportMessage(record: any): SupportMessage | null {
  if (!record) return null;
  return {
    id: record.id,
    conversationId: record.conversationId,
    senderType: record.senderType,
    senderId: record.senderId ?? undefined,
    body: record.body,
    messageFormat: record.messageFormat,
    externalMessageId: record.externalMessageId ?? undefined,
    aiGenerated: record.aiGenerated,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapSupportContextSnapshot(record: any): SupportContextSnapshot | null {
  if (!record) return null;
  return {
    id: record.id,
    conversationId: record.conversationId,
    contextType: record.contextType,
    payload: (record.payload as Record<string, unknown> | null) ?? {},
    createdAt: record.createdAt.toISOString(),
  };
}

function mapSupportHandoff(record: any): SupportHandoff | null {
  if (!record) return null;
  return {
    id: record.id,
    conversationId: record.conversationId,
    reason: record.reason,
    summary: record.summary,
    recommendedTeam: record.recommendedTeam,
    confidenceScore: record.confidenceScore ?? undefined,
    acceptedByAgentId: record.acceptedByAgentId ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapSupportEvent(record: any): SupportEvent | null {
  if (!record) return null;
  return {
    id: record.id,
    conversationId: record.conversationId,
    eventType: record.eventType,
    actorType: record.actorType,
    actorId: record.actorId ?? undefined,
    notes: record.notes ?? undefined,
    metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapSupportKnowledgeArticle(record: any): SupportKnowledgeArticle | null {
  if (!record) return null;
  return {
    id: record.id,
    domain: record.domain,
    audience: Array.isArray(record.audience) ? record.audience : [],
    title: record.title,
    slug: record.slug,
    summary: record.summary ?? undefined,
    content: record.content,
    tags: Array.isArray(record.tags) ? record.tags : [],
    published: record.published,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
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
    referrerAccounts,
    referrerLoginChallenges,
    referrerSessions,
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
    publicSlyderReferrals,
    referralEvents,
    referralRewards,
    referralRewardAudits,
    notificationTemplates,
    notificationTriggerEvents,
    notificationRecords,
    supportConversations,
    supportMessages,
    supportContextSnapshots,
    supportHandoffs,
    supportEvents,
    supportKnowledgeArticles,
    legalDocuments,
    legalAcceptances,
    legalDocumentPublishHistory,
    coverageZones,
    merchantInterests,
    merchantLeads,
    merchantApplications,
    merchantIntegrationProfiles,
    merchantOnboardingEvents,
    merchantOrders,
    merchantDeliveries,
    merchantAddresses,
    merchantTeamMembers,
    merchantNotificationPreferences,
    merchantDispatchEvents,
    partnerCarriers,
    partnerHandoffLocations,
    deliveryTransferPlans,
    deliveryLegs,
    partnerTrackingEvents,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.activationToken.findMany(),
    prisma.otpChallenge.findMany(),
    prisma.sessionRecord.findMany(),
    prisma.referrerAccount.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.referrerLoginChallenge.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.referrerSession.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
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
    prisma.publicSlyderReferral.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.referralEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.referralReward.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.referralRewardAudit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.notificationTemplate.findMany(),
    prisma.notificationTriggerEvent.findMany(),
    prisma.notificationRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).supportConversation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).supportMessage.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    (prisma as any).supportContextSnapshot.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).supportHandoff.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).supportEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).supportKnowledgeArticle.findMany({
      orderBy: {
        updatedAt: "desc",
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
    (prisma as any).merchantLead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantIntegrationProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantOnboardingEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantDelivery.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantAddress.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantTeamMember.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantNotificationPreference.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).merchantDispatchEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).partnerCarrier.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    (prisma as any).partnerHandoffLocation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).deliveryTransferPlan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).deliveryLeg.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    (prisma as any).partnerTrackingEvent.findMany({
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
    referrerAccounts: mergeById(
      store.referrerAccounts,
      referrerAccounts
        .map((item) => mapReferrerAccount(item))
        .filter((item): item is ReferrerAccount => Boolean(item)),
    ),
    referrerLoginChallenges: mergeById(
      store.referrerLoginChallenges,
      referrerLoginChallenges
        .map((item) => mapReferrerLoginChallenge(item))
        .filter((item): item is ReferrerLoginChallenge => Boolean(item)),
    ),
    referrerSessions: mergeById(
      store.referrerSessions,
      referrerSessions
        .map((item) => mapReferrerSession(item))
        .filter((item): item is ReferrerSession => Boolean(item)),
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
    publicSlyderReferrals: mergeById(
      store.publicSlyderReferrals,
      publicSlyderReferrals
        .map((item) => mapPublicSlyderReferral(item))
        .filter((item): item is PublicSlyderReferral => Boolean(item)),
    ),
    referralEvents: mergeById(
      store.referralEvents,
      referralEvents
        .map((item) => mapReferralEvent(item))
        .filter((item): item is ReferralEvent => Boolean(item)),
    ),
    referralRewards: mergeById(
      store.referralRewards,
      referralRewards
        .map((item) => mapReferralReward(item))
        .filter((item): item is ReferralReward => Boolean(item)),
    ),
    referralRewardAudits: mergeById(
      store.referralRewardAudits,
      referralRewardAudits
        .map((item) => mapReferralRewardAudit(item))
        .filter((item): item is ReferralRewardAudit => Boolean(item)),
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
    supportConversations: mergeById(
      store.supportConversations,
      supportConversations
        .map((item: any) => mapSupportConversation(item))
        .filter((item: SupportConversation | null): item is SupportConversation => Boolean(item)),
    ),
    supportMessages: mergeById(
      store.supportMessages,
      supportMessages
        .map((item: any) => mapSupportMessage(item))
        .filter((item: SupportMessage | null): item is SupportMessage => Boolean(item)),
    ),
    supportContextSnapshots: mergeById(
      store.supportContextSnapshots,
      supportContextSnapshots
        .map((item: any) => mapSupportContextSnapshot(item))
        .filter((item: SupportContextSnapshot | null): item is SupportContextSnapshot => Boolean(item)),
    ),
    supportHandoffs: mergeById(
      store.supportHandoffs,
      supportHandoffs
        .map((item: any) => mapSupportHandoff(item))
        .filter((item: SupportHandoff | null): item is SupportHandoff => Boolean(item)),
    ),
    supportEvents: mergeById(
      store.supportEvents,
      supportEvents
        .map((item: any) => mapSupportEvent(item))
        .filter((item: SupportEvent | null): item is SupportEvent => Boolean(item)),
    ),
    supportKnowledgeArticles: mergeById(
      store.supportKnowledgeArticles,
      supportKnowledgeArticles
        .map((item: any) => mapSupportKnowledgeArticle(item))
        .filter((item: SupportKnowledgeArticle | null): item is SupportKnowledgeArticle => Boolean(item)),
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
    merchantLeads: mergeById(
      store.merchantLeads,
      merchantLeads
        .map((item: any) => mapMerchantLead(item))
        .filter((item: MerchantLead | null): item is MerchantLead => Boolean(item)),
    ),
    merchantApplications: mergeById(
      store.merchantApplications,
      merchantApplications
        .map((item: any) => mapMerchantApplication(item))
        .filter((item: MerchantApplication | null): item is MerchantApplication => Boolean(item)),
    ),
    merchantIntegrationProfiles: mergeById(
      store.merchantIntegrationProfiles,
      merchantIntegrationProfiles
        .map((item: any) => mapMerchantIntegrationProfile(item))
        .filter((item: MerchantIntegrationProfile | null): item is MerchantIntegrationProfile => Boolean(item)),
    ),
    merchantOnboardingEvents: mergeById(
      store.merchantOnboardingEvents,
      merchantOnboardingEvents
        .map((item: any) => mapMerchantOnboardingEvent(item))
        .filter((item: MerchantOnboardingEvent | null): item is MerchantOnboardingEvent => Boolean(item)),
    ),
    merchantOrders: mergeById(
      store.merchantOrders,
      merchantOrders
        .map((item: any) => mapMerchantOrder(item))
        .filter((item: MerchantOrder | null): item is MerchantOrder => Boolean(item)),
    ),
    merchantDeliveries: mergeById(
      store.merchantDeliveries,
      merchantDeliveries
        .map((item: any) => mapMerchantDelivery(item))
        .filter((item: MerchantDelivery | null): item is MerchantDelivery => Boolean(item)),
    ),
    merchantAddresses: mergeById(
      store.merchantAddresses,
      merchantAddresses
        .map((item: any) => mapMerchantAddress(item))
        .filter((item: MerchantAddress | null): item is MerchantAddress => Boolean(item)),
    ),
    merchantTeamMembers: mergeById(
      store.merchantTeamMembers,
      merchantTeamMembers
        .map((item: any) => mapMerchantTeamMember(item))
        .filter((item: MerchantTeamMember | null): item is MerchantTeamMember => Boolean(item)),
    ),
    merchantNotificationPreferences: mergeById(
      store.merchantNotificationPreferences,
      merchantNotificationPreferences
        .map((item: any) => mapMerchantNotificationPreference(item))
        .filter((item: MerchantNotificationPreference | null): item is MerchantNotificationPreference => Boolean(item)),
    ),
    merchantDispatchEvents: mergeById(
      store.merchantDispatchEvents,
      merchantDispatchEvents
        .map((item: any) => mapMerchantDispatchEvent(item))
        .filter((item: MerchantDispatchEvent | null): item is MerchantDispatchEvent => Boolean(item)),
    ),
    partnerCarriers: mergeById(
      store.partnerCarriers,
      partnerCarriers
        .map((item: any) => mapPartnerCarrier(item))
        .filter((item: PartnerCarrier | null): item is PartnerCarrier => Boolean(item)),
    ),
    partnerHandoffLocations: mergeById(
      store.partnerHandoffLocations,
      partnerHandoffLocations
        .map((item: any) => mapPartnerHandoffLocation(item))
        .filter((item: PartnerHandoffLocation | null): item is PartnerHandoffLocation => Boolean(item)),
    ),
    deliveryTransferPlans: mergeById(
      store.deliveryTransferPlans,
      deliveryTransferPlans
        .map((item: any) => mapDeliveryTransferPlan(item))
        .filter((item: DeliveryTransferPlan | null): item is DeliveryTransferPlan => Boolean(item)),
    ),
    deliveryLegs: mergeById(
      store.deliveryLegs,
      deliveryLegs
        .map((item: any) => mapDeliveryLeg(item))
        .filter((item: DeliveryLeg | null): item is DeliveryLeg => Boolean(item)),
    ),
    partnerTrackingEvents: mergeById(
      store.partnerTrackingEvents,
      partnerTrackingEvents
        .map((item: any) => mapPartnerTrackingEvent(item))
        .filter((item: PartnerTrackingEvent | null): item is PartnerTrackingEvent => Boolean(item)),
    ),
  };
}

async function overlayCriticalOnboardingPrismaSlices(store: OnboardingStore): Promise<OnboardingStore> {
  const readSlice = async <T>(reader: () => Promise<T[]>) => {
    try {
      return await reader();
    } catch (error) {
      if (isMissingPrismaTableError(error)) {
        return [] as T[];
      }

      throw error;
    }
  };

  const [users, activationTokens, otpChallenges, sessions, applications, vehicles, documents, slyderProfiles, history] =
    await Promise.all([
      readSlice(() => prisma.user.findMany()),
      readSlice(() => prisma.activationToken.findMany()),
      readSlice(() => prisma.otpChallenge.findMany()),
      readSlice(() => prisma.sessionRecord.findMany()),
      readSlice(() =>
        prisma.slyderApplication.findMany({
          orderBy: {
            createdAt: "desc",
          },
        }),
      ),
      readSlice(() => prisma.slyderApplicationVehicle.findMany()),
      readSlice(() => prisma.slyderApplicationDocument.findMany()),
      readSlice(() => prisma.slyderProfile.findMany()),
      readSlice(() =>
        prisma.statusHistory.findMany({
          orderBy: {
            createdAt: "desc",
          },
        }),
      ),
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
  };
}

async function persistSupportedPrismaSlices(tx: PrismaTransactionClient, store: OnboardingStore) {
  const supportedUsers = store.users;
  const supportedUserIds = new Set(supportedUsers.map((user) => user.id));
  const supportedActivationTokens = store.activationTokens.filter((token) => supportedUserIds.has(token.userId));
  const supportedOtpChallenges = store.otpChallenges.filter((challenge) => supportedUserIds.has(challenge.userId));
  const supportedSessions = store.sessions.filter((session) => supportedUserIds.has(session.userId));
  const supportedReferrerAccounts = store.referrerAccounts;
  const supportedReferrerAccountIds = new Set(supportedReferrerAccounts.map((account) => account.id));
  const supportedReferrerLoginChallenges = store.referrerLoginChallenges.filter(
    (challenge) => !challenge.referrerAccountId || supportedReferrerAccountIds.has(challenge.referrerAccountId),
  );
  const supportedReferrerSessions = store.referrerSessions.filter((session) =>
    supportedReferrerAccountIds.has(session.referrerAccountId),
  );
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
  const supportedPublicSlyderReferrals = store.publicSlyderReferrals;
  const supportedPublicReferralIds = new Set(supportedPublicSlyderReferrals.map((referral) => referral.id));
  const supportedReferralEvents = store.referralEvents.filter((event) => supportedPublicReferralIds.has(event.referralId));
  const supportedReferralRewards = store.referralRewards;
  const supportedReferralRewardAudits = store.referralRewardAudits;
  const supportedNotificationTemplates = store.notificationTemplates;
  const supportedNotificationTriggers = store.notificationTriggers;
  const supportedNotifications = store.notifications;
  const supportedLegalDocuments = store.legalDocuments;
  const supportedLegalAcceptances = store.legalAcceptances;
  const supportedLegalPublishHistory = store.legalPublishHistory;
  const supportedCoverageZones = store.coverageZones;
  const supportedMerchantInterests = store.merchantInterests;
  const supportedMerchantLeads = store.merchantLeads;
  const supportedMerchantLeadIds = new Set(supportedMerchantLeads.map((lead) => lead.id));
  const supportedMerchantApplications = store.merchantApplications.filter((application) =>
    supportedMerchantLeadIds.has(application.merchantLeadId),
  );
  const supportedMerchantApplicationIds = new Set(supportedMerchantApplications.map((application) => application.id));
  const supportedMerchantIntegrationProfiles = store.merchantIntegrationProfiles.filter((profile) =>
    supportedMerchantApplicationIds.has(profile.merchantApplicationId),
  );
  const supportedMerchantOnboardingEvents = store.merchantOnboardingEvents.filter((event) =>
    supportedMerchantApplicationIds.has(event.merchantApplicationId),
  );
  const supportedMerchantOrders = store.merchantOrders.filter((order) =>
    supportedMerchantApplicationIds.has(order.merchantId),
  );
  const supportedMerchantOrderIds = new Set(supportedMerchantOrders.map((order) => order.id));
  const supportedMerchantAddresses = store.merchantAddresses.filter((address) =>
    supportedMerchantApplicationIds.has(address.merchantId),
  );
  const supportedMerchantAddressIds = new Set(supportedMerchantAddresses.map((address) => address.id));
  const supportedMerchantDeliveries = store.merchantDeliveries.filter(
    (delivery) =>
      supportedMerchantApplicationIds.has(delivery.merchantId) &&
      supportedMerchantOrderIds.has(delivery.merchantOrderId),
  );
  const supportedMerchantDeliveryIds = new Set(supportedMerchantDeliveries.map((delivery) => delivery.id));
  const supportedMerchantTeamMembers = store.merchantTeamMembers.filter(
    (member) => supportedMerchantApplicationIds.has(member.merchantId) && supportedUserIds.has(member.userId),
  );
  const supportedMerchantNotificationPreferences = store.merchantNotificationPreferences.filter((preference) =>
    supportedMerchantApplicationIds.has(preference.merchantId),
  );
  const supportedMerchantDispatchEvents = store.merchantDispatchEvents.filter((event) =>
    supportedMerchantDeliveryIds.has(event.merchantDeliveryId),
  );
  const supportedPartnerCarriers = store.partnerCarriers;
  const supportedPartnerCarrierIds = new Set(supportedPartnerCarriers.map((carrier) => carrier.id));
  const supportedPartnerHandoffLocations = store.partnerHandoffLocations.filter((location) =>
    supportedPartnerCarrierIds.has(location.partnerCarrierId),
  );
  const supportedPartnerHandoffLocationIds = new Set(supportedPartnerHandoffLocations.map((location) => location.id));
  const supportedDeliveryTransferPlans = store.deliveryTransferPlans.filter(
    (plan) =>
      supportedMerchantDeliveryIds.has(plan.merchantDeliveryId) &&
      supportedPartnerCarrierIds.has(plan.transferPartnerId),
  );
  const supportedDeliveryTransferPlanIds = new Set(supportedDeliveryTransferPlans.map((plan) => plan.id));
  const supportedDeliveryLegs = store.deliveryLegs.filter(
    (leg) =>
      supportedMerchantDeliveryIds.has(leg.merchantDeliveryId) &&
      (!leg.transferPlanId || supportedDeliveryTransferPlanIds.has(leg.transferPlanId)),
  );
  const supportedDeliveryLegIds = new Set(supportedDeliveryLegs.map((leg) => leg.id));
  const supportedPartnerTrackingEvents = store.partnerTrackingEvents.filter(
    (event) =>
      supportedDeliveryLegIds.has(event.deliveryLegId) &&
      supportedPartnerCarrierIds.has(event.partnerCarrierId),
  );
  const supportedSlyderProfileIds = new Set(supportedSlyderProfiles.map((profile) => profile.id));
  const supportedEmployeeProfileIds = new Set(supportedEmployeeProfiles.map((profile) => profile.id));
  const supportedSupportConversations = store.supportConversations.filter(
    (conversation) =>
      (!conversation.userId || supportedUserIds.has(conversation.userId)) &&
      (!conversation.merchantId || supportedMerchantApplicationIds.has(conversation.merchantId)) &&
      (!conversation.slyderProfileId || supportedSlyderProfileIds.has(conversation.slyderProfileId)) &&
      (!conversation.employeeProfileId || supportedEmployeeProfileIds.has(conversation.employeeProfileId)) &&
      (!conversation.referrerAccountId || supportedReferrerAccountIds.has(conversation.referrerAccountId)),
  );
  const supportedSupportConversationIds = new Set(supportedSupportConversations.map((conversation) => conversation.id));
  const supportedSupportMessages = store.supportMessages.filter((message) =>
    supportedSupportConversationIds.has(message.conversationId),
  );
  const supportedSupportContextSnapshots = store.supportContextSnapshots.filter((snapshot) =>
    supportedSupportConversationIds.has(snapshot.conversationId),
  );
  const supportedSupportHandoffs = store.supportHandoffs.filter((handoff) =>
    supportedSupportConversationIds.has(handoff.conversationId),
  );
  const supportedSupportEvents = store.supportEvents.filter((event) =>
    supportedSupportConversationIds.has(event.conversationId),
  );
  const supportedSupportKnowledgeArticles = store.supportKnowledgeArticles;

  for (const user of supportedUsers) {
    await tx.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        passwordHash: user.passwordHash ?? null,
        roles: user.roles as any,
        userType: user.userType as any,
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
        roles: user.roles as any,
        userType: user.userType as any,
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

  for (const account of supportedReferrerAccounts) {
    await tx.referrerAccount.upsert({
      where: { id: account.id },
      update: {
        fullName: account.fullName,
        email: account.email ?? null,
        phone: account.phone ?? null,
        emailVerifiedAt: toDate(account.emailVerifiedAt),
        phoneVerifiedAt: toDate(account.phoneVerifiedAt),
        isEnabled: account.isEnabled,
        updatedAt: new Date(account.updatedAt),
      },
      create: {
        id: account.id,
        fullName: account.fullName,
        email: account.email ?? null,
        phone: account.phone ?? null,
        emailVerifiedAt: toDate(account.emailVerifiedAt),
        phoneVerifiedAt: toDate(account.phoneVerifiedAt),
        isEnabled: account.isEnabled,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      },
    });
  }

  for (const challenge of supportedReferrerLoginChallenges) {
    await tx.referrerLoginChallenge.upsert({
      where: { id: challenge.id },
      update: {
        referrerAccountId: challenge.referrerAccountId ?? null,
        channel: challenge.channel,
        email: challenge.email ?? null,
        phone: challenge.phone ?? null,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
        createdAt: new Date(challenge.createdAt),
      },
      create: {
        id: challenge.id,
        referrerAccountId: challenge.referrerAccountId ?? null,
        channel: challenge.channel,
        email: challenge.email ?? null,
        phone: challenge.phone ?? null,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
        createdAt: new Date(challenge.createdAt),
      },
    });
  }

  for (const session of supportedReferrerSessions) {
    await tx.referrerSession.upsert({
      where: { id: session.id },
      update: {
        referrerAccountId: session.referrerAccountId,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      },
      create: {
        id: session.id,
        referrerAccountId: session.referrerAccountId,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
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
        roles: session.roles as any,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      },
      create: {
        id: session.id,
        userId: session.userId,
        roles: session.roles as any,
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

    for (const conversation of supportedSupportConversations) {
      await (tx as any).supportConversation.upsert({
        where: { id: conversation.id },
        update: {
          channel: conversation.channel,
          domain: conversation.domain,
          status: conversation.status,
          priority: conversation.priority,
          subject: conversation.subject,
          externalProvider: conversation.externalProvider ?? null,
          externalConversationId: conversation.externalConversationId ?? null,
          externalTicketId: conversation.externalTicketId ?? null,
          userId: conversation.userId ?? null,
          merchantId: conversation.merchantId ?? null,
          slyderProfileId: conversation.slyderProfileId ?? null,
          employeeProfileId: conversation.employeeProfileId ?? null,
          referrerAccountId: conversation.referrerAccountId ?? null,
          assignedTeam: conversation.assignedTeam ?? null,
          assignedAgentId: conversation.assignedAgentId ?? null,
          lastMessageAt: toDate(conversation.lastMessageAt),
          resolvedAt: toDate(conversation.resolvedAt),
          closedAt: toDate(conversation.closedAt),
          updatedAt: new Date(conversation.updatedAt),
        },
        create: {
          id: conversation.id,
          channel: conversation.channel,
          domain: conversation.domain,
          status: conversation.status,
          priority: conversation.priority,
          subject: conversation.subject,
          externalProvider: conversation.externalProvider ?? null,
          externalConversationId: conversation.externalConversationId ?? null,
          externalTicketId: conversation.externalTicketId ?? null,
          userId: conversation.userId ?? null,
          merchantId: conversation.merchantId ?? null,
          slyderProfileId: conversation.slyderProfileId ?? null,
          employeeProfileId: conversation.employeeProfileId ?? null,
          referrerAccountId: conversation.referrerAccountId ?? null,
          assignedTeam: conversation.assignedTeam ?? null,
          assignedAgentId: conversation.assignedAgentId ?? null,
          lastMessageAt: toDate(conversation.lastMessageAt),
          resolvedAt: toDate(conversation.resolvedAt),
          closedAt: toDate(conversation.closedAt),
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(conversation.updatedAt),
        },
      });
    }

    for (const message of supportedSupportMessages) {
      await (tx as any).supportMessage.upsert({
        where: { id: message.id },
        update: {
          conversationId: message.conversationId,
          senderType: message.senderType,
          senderId: message.senderId ?? null,
          body: message.body,
          messageFormat: message.messageFormat,
          externalMessageId: message.externalMessageId ?? null,
          aiGenerated: message.aiGenerated,
          metadata: (message.metadata ?? undefined) as any,
          createdAt: new Date(message.createdAt),
        },
        create: {
          id: message.id,
          conversationId: message.conversationId,
          senderType: message.senderType,
          senderId: message.senderId ?? null,
          body: message.body,
          messageFormat: message.messageFormat,
          externalMessageId: message.externalMessageId ?? null,
          aiGenerated: message.aiGenerated,
          metadata: (message.metadata ?? undefined) as any,
          createdAt: new Date(message.createdAt),
        },
      });
    }

    for (const snapshot of supportedSupportContextSnapshots) {
      await (tx as any).supportContextSnapshot.upsert({
        where: { id: snapshot.id },
        update: {
          conversationId: snapshot.conversationId,
          contextType: snapshot.contextType,
          payload: snapshot.payload as any,
          createdAt: new Date(snapshot.createdAt),
        },
        create: {
          id: snapshot.id,
          conversationId: snapshot.conversationId,
          contextType: snapshot.contextType,
          payload: snapshot.payload as any,
          createdAt: new Date(snapshot.createdAt),
        },
      });
    }

    for (const handoff of supportedSupportHandoffs) {
      await (tx as any).supportHandoff.upsert({
        where: { id: handoff.id },
        update: {
          conversationId: handoff.conversationId,
          reason: handoff.reason,
          summary: handoff.summary,
          recommendedTeam: handoff.recommendedTeam,
          confidenceScore: handoff.confidenceScore ?? null,
          acceptedByAgentId: handoff.acceptedByAgentId ?? null,
          createdAt: new Date(handoff.createdAt),
        },
        create: {
          id: handoff.id,
          conversationId: handoff.conversationId,
          reason: handoff.reason,
          summary: handoff.summary,
          recommendedTeam: handoff.recommendedTeam,
          confidenceScore: handoff.confidenceScore ?? null,
          acceptedByAgentId: handoff.acceptedByAgentId ?? null,
          createdAt: new Date(handoff.createdAt),
        },
      });
    }

    for (const event of supportedSupportEvents) {
      await (tx as any).supportEvent.upsert({
        where: { id: event.id },
        update: {
          conversationId: event.conversationId,
          eventType: event.eventType,
          actorType: event.actorType,
          actorId: event.actorId ?? null,
          notes: event.notes ?? null,
          metadata: (event.metadata ?? undefined) as any,
          createdAt: new Date(event.createdAt),
        },
        create: {
          id: event.id,
          conversationId: event.conversationId,
          eventType: event.eventType,
          actorType: event.actorType,
          actorId: event.actorId ?? null,
          notes: event.notes ?? null,
          metadata: (event.metadata ?? undefined) as any,
          createdAt: new Date(event.createdAt),
        },
      });
    }

    for (const article of supportedSupportKnowledgeArticles) {
      await (tx as any).supportKnowledgeArticle.upsert({
        where: { id: article.id },
        update: {
          domain: article.domain,
          audience: article.audience,
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? null,
          content: article.content,
          tags: article.tags,
          published: article.published,
          updatedAt: new Date(article.updatedAt),
        },
        create: {
          id: article.id,
          domain: article.domain,
          audience: article.audience,
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? null,
          content: article.content,
          tags: article.tags,
          published: article.published,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt),
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

  for (const lead of supportedMerchantLeads) {
    await (tx as any).merchantLead.upsert({
      where: { id: lead.id },
      update: {
        businessName: lead.businessName,
        contactName: lead.contactName,
        phone: lead.phone,
        email: lead.email,
        parish: lead.parish,
        town: lead.town,
        category: lead.category,
        instagramHandle: lead.instagramHandle ?? null,
        website: lead.website ?? null,
        orderChannels: lead.orderChannels,
        averageDailyOrders: lead.averageDailyOrders ?? null,
        currentDeliveryMethod: lead.currentDeliveryMethod ?? null,
        preferredStartTimeline: lead.preferredStartTimeline ?? null,
        productIntent: lead.productIntent,
        status: lead.status,
        notes: lead.notes ?? null,
        updatedAt: new Date(lead.updatedAt),
      },
      create: {
        id: lead.id,
        businessName: lead.businessName,
        contactName: lead.contactName,
        phone: lead.phone,
        email: lead.email,
        parish: lead.parish,
        town: lead.town,
        category: lead.category,
        instagramHandle: lead.instagramHandle ?? null,
        website: lead.website ?? null,
        orderChannels: lead.orderChannels,
        averageDailyOrders: lead.averageDailyOrders ?? null,
        currentDeliveryMethod: lead.currentDeliveryMethod ?? null,
        preferredStartTimeline: lead.preferredStartTimeline ?? null,
        productIntent: lead.productIntent,
        status: lead.status,
        notes: lead.notes ?? null,
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
      },
    });
  }

  for (const application of supportedMerchantApplications) {
    await (tx as any).merchantApplication.upsert({
      where: { id: application.id },
      update: {
        merchantLeadId: application.merchantLeadId,
        onboardingTrack: application.onboardingTrack,
        storeName: application.storeName ?? null,
        logoUrl: application.logoUrl ?? null,
        heroBannerUrl: application.heroBannerUrl ?? null,
        heroBannerPosition: application.heroBannerPosition ?? null,
        businessDescription: application.businessDescription ?? null,
        category: application.category ?? null,
        pickupAddress: application.pickupAddress ?? null,
        serviceAreas: application.serviceAreas,
        fulfillmentMode: application.fulfillmentMode ?? null,
        catalogReady: application.catalogReady ?? null,
        payoutDetails: application.payoutDetails ?? Prisma.JsonNull,
        operatingHours: application.operatingHours ?? Prisma.JsonNull,
        documentStatus: application.documentStatus,
        legalStatus: application.legalStatus,
        approvalStatus: application.approvalStatus,
        activationStatus: application.activationStatus,
        businessLicenseStatus: application.businessLicenseStatus,
        businessLicenseNumber: application.businessLicenseNumber ?? null,
        businessLicenseSubmittedAt: toDate(application.businessLicenseSubmittedAt),
        businessLicenseVerifiedAt: toDate(application.businessLicenseVerifiedAt),
        businessLicenseGraceEndsAt: toDate(application.businessLicenseGraceEndsAt),
        businessLicenseRequiredAfterDeliveries: application.businessLicenseRequiredAfterDeliveries,
        businessLicenseDisabledAt: toDate(application.businessLicenseDisabledAt),
        assignedAdminId: application.assignedAdminId ?? null,
        updatedAt: new Date(application.updatedAt),
      },
      create: {
        id: application.id,
        merchantLeadId: application.merchantLeadId,
        onboardingTrack: application.onboardingTrack,
        storeName: application.storeName ?? null,
        logoUrl: application.logoUrl ?? null,
        heroBannerUrl: application.heroBannerUrl ?? null,
        heroBannerPosition: application.heroBannerPosition ?? null,
        businessDescription: application.businessDescription ?? null,
        category: application.category ?? null,
        pickupAddress: application.pickupAddress ?? null,
        serviceAreas: application.serviceAreas,
        fulfillmentMode: application.fulfillmentMode ?? null,
        catalogReady: application.catalogReady ?? null,
        payoutDetails: application.payoutDetails ?? Prisma.JsonNull,
        operatingHours: application.operatingHours ?? Prisma.JsonNull,
        documentStatus: application.documentStatus,
        legalStatus: application.legalStatus,
        approvalStatus: application.approvalStatus,
        activationStatus: application.activationStatus,
        businessLicenseStatus: application.businessLicenseStatus,
        businessLicenseNumber: application.businessLicenseNumber ?? null,
        businessLicenseSubmittedAt: toDate(application.businessLicenseSubmittedAt),
        businessLicenseVerifiedAt: toDate(application.businessLicenseVerifiedAt),
        businessLicenseGraceEndsAt: toDate(application.businessLicenseGraceEndsAt),
        businessLicenseRequiredAfterDeliveries: application.businessLicenseRequiredAfterDeliveries,
        businessLicenseDisabledAt: toDate(application.businessLicenseDisabledAt),
        assignedAdminId: application.assignedAdminId ?? null,
        createdAt: new Date(application.createdAt),
        updatedAt: new Date(application.updatedAt),
      },
    });
  }

  for (const profile of supportedMerchantIntegrationProfiles) {
    await (tx as any).merchantIntegrationProfile.upsert({
      where: { merchantApplicationId: profile.merchantApplicationId },
      update: {
        dispatchMode: profile.dispatchMode,
        acceptsCOD: profile.acceptsCOD,
        averageBasketSize: profile.averageBasketSize ?? null,
        packageTypes: profile.packageTypes,
        operatingHours: profile.operatingHours ?? Prisma.JsonNull,
        orderSources: profile.orderSources,
        pickupLocations: profile.pickupLocations,
        deliveryRadius: profile.deliveryRadius ?? null,
        sameDaySupported: profile.sameDaySupported,
        scheduledSupported: profile.scheduledSupported,
        integrationReadiness: profile.integrationReadiness,
        updatedAt: new Date(profile.updatedAt),
      },
      create: {
        id: profile.id,
        merchantApplicationId: profile.merchantApplicationId,
        dispatchMode: profile.dispatchMode,
        acceptsCOD: profile.acceptsCOD,
        averageBasketSize: profile.averageBasketSize ?? null,
        packageTypes: profile.packageTypes,
        operatingHours: profile.operatingHours ?? Prisma.JsonNull,
        orderSources: profile.orderSources,
        pickupLocations: profile.pickupLocations,
        deliveryRadius: profile.deliveryRadius ?? null,
        sameDaySupported: profile.sameDaySupported,
        scheduledSupported: profile.scheduledSupported,
        integrationReadiness: profile.integrationReadiness,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      },
    });
  }

  for (const event of supportedMerchantOnboardingEvents) {
    await (tx as any).merchantOnboardingEvent.upsert({
      where: { id: event.id },
      update: {
        merchantApplicationId: event.merchantApplicationId,
        eventType: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId ?? null,
        notes: event.notes ?? null,
        createdAt: new Date(event.createdAt),
      },
      create: {
        id: event.id,
        merchantApplicationId: event.merchantApplicationId,
        eventType: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId ?? null,
        notes: event.notes ?? null,
        createdAt: new Date(event.createdAt),
      },
    });
  }

  for (const address of supportedMerchantAddresses) {
    await (tx as any).merchantAddress.upsert({
      where: { id: address.id },
      update: {
        merchantId: address.merchantId,
        type: address.type,
        label: address.label,
        contactName: address.contactName,
        contactPhone: address.contactPhone,
        addressLine: address.addressLine,
        parish: address.parish,
        town: address.town,
        notes: address.notes ?? null,
        isDefault: address.isDefault,
        updatedAt: new Date(address.updatedAt),
      },
      create: {
        id: address.id,
        merchantId: address.merchantId,
        type: address.type,
        label: address.label,
        contactName: address.contactName,
        contactPhone: address.contactPhone,
        addressLine: address.addressLine,
        parish: address.parish,
        town: address.town,
        notes: address.notes ?? null,
        isDefault: address.isDefault,
        createdAt: new Date(address.createdAt),
        updatedAt: new Date(address.updatedAt),
      },
    });
  }

  for (const order of supportedMerchantOrders) {
    await (tx as any).merchantOrder.upsert({
      where: { id: order.id },
      update: {
        merchantId: order.merchantId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        pickupLocationId:
          order.pickupLocationId && supportedMerchantAddressIds.has(order.pickupLocationId) ? order.pickupLocationId : null,
        pickupAddressSnapshot: order.pickupAddressSnapshot ?? null,
        itemDescription: order.itemDescription,
        packageType: order.packageType,
        paymentType: order.paymentType,
        codAmount: order.codAmount ?? null,
        internalNote: order.internalNote ?? null,
        riderNote: order.riderNote ?? null,
        requestedTiming: order.requestedTiming,
        scheduledFor: toDate(order.scheduledFor),
        status: order.status,
        updatedAt: new Date(order.updatedAt),
      },
      create: {
        id: order.id,
        merchantId: order.merchantId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        pickupLocationId:
          order.pickupLocationId && supportedMerchantAddressIds.has(order.pickupLocationId) ? order.pickupLocationId : null,
        pickupAddressSnapshot: order.pickupAddressSnapshot ?? null,
        itemDescription: order.itemDescription,
        packageType: order.packageType,
        paymentType: order.paymentType,
        codAmount: order.codAmount ?? null,
        internalNote: order.internalNote ?? null,
        riderNote: order.riderNote ?? null,
        requestedTiming: order.requestedTiming,
        scheduledFor: toDate(order.scheduledFor),
        status: order.status,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      },
    });
  }

  for (const delivery of supportedMerchantDeliveries) {
    await (tx as any).merchantDelivery.upsert({
      where: { id: delivery.id },
      update: {
        merchantOrderId: delivery.merchantOrderId,
        merchantId: delivery.merchantId,
        dispatchMode: delivery.dispatchMode,
        riderId: delivery.riderId ?? null,
        quoteAmount: delivery.quoteAmount ?? null,
        assignedAt: toDate(delivery.assignedAt),
        pickedUpAt: toDate(delivery.pickedUpAt),
        deliveredAt: toDate(delivery.deliveredAt),
        failedAt: toDate(delivery.failedAt),
        cancelledAt: toDate(delivery.cancelledAt),
        status: delivery.status,
        proofOfDeliveryUrl: delivery.proofOfDeliveryUrl ?? null,
        updatedAt: new Date(delivery.updatedAt),
      },
      create: {
        id: delivery.id,
        merchantOrderId: delivery.merchantOrderId,
        merchantId: delivery.merchantId,
        dispatchMode: delivery.dispatchMode,
        riderId: delivery.riderId ?? null,
        quoteAmount: delivery.quoteAmount ?? null,
        assignedAt: toDate(delivery.assignedAt),
        pickedUpAt: toDate(delivery.pickedUpAt),
        deliveredAt: toDate(delivery.deliveredAt),
        failedAt: toDate(delivery.failedAt),
        cancelledAt: toDate(delivery.cancelledAt),
        status: delivery.status,
        proofOfDeliveryUrl: delivery.proofOfDeliveryUrl ?? null,
        createdAt: new Date(delivery.createdAt),
        updatedAt: new Date(delivery.updatedAt),
      },
    });
  }

  for (const member of supportedMerchantTeamMembers) {
    await (tx as any).merchantTeamMember.upsert({
      where: { id: member.id },
      update: {
        merchantId: member.merchantId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedAt: toDate(member.invitedAt),
        joinedAt: toDate(member.joinedAt),
        updatedAt: new Date(member.updatedAt),
      },
      create: {
        id: member.id,
        merchantId: member.merchantId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedAt: toDate(member.invitedAt),
        joinedAt: toDate(member.joinedAt),
        createdAt: new Date(member.createdAt),
        updatedAt: new Date(member.updatedAt),
      },
    });
  }

  for (const preference of supportedMerchantNotificationPreferences) {
    await (tx as any).merchantNotificationPreference.upsert({
      where: { merchantId: preference.merchantId },
      update: {
        emailEnabled: preference.emailEnabled,
        smsEnabled: preference.smsEnabled,
        whatsappEnabled: preference.whatsappEnabled,
        notifyOnAssigned: preference.notifyOnAssigned,
        notifyOnDelivered: preference.notifyOnDelivered,
        notifyOnFailed: preference.notifyOnFailed,
        notifyOnBilling: preference.notifyOnBilling,
        updatedAt: new Date(preference.updatedAt),
      },
      create: {
        id: preference.id,
        merchantId: preference.merchantId,
        emailEnabled: preference.emailEnabled,
        smsEnabled: preference.smsEnabled,
        whatsappEnabled: preference.whatsappEnabled,
        notifyOnAssigned: preference.notifyOnAssigned,
        notifyOnDelivered: preference.notifyOnDelivered,
        notifyOnFailed: preference.notifyOnFailed,
        notifyOnBilling: preference.notifyOnBilling,
        createdAt: new Date(preference.createdAt),
        updatedAt: new Date(preference.updatedAt),
      },
    });
  }

    for (const event of supportedMerchantDispatchEvents) {
      await (tx as any).merchantDispatchEvent.upsert({
        where: { id: event.id },
        update: {
          merchantDeliveryId: event.merchantDeliveryId,
          eventType: event.eventType,
          actorType: event.actorType,
          actorId: event.actorId ?? null,
          notes: event.notes ?? null,
          metadata: event.metadata ?? undefined,
          createdAt: new Date(event.createdAt),
        },
        create: {
          id: event.id,
          merchantDeliveryId: event.merchantDeliveryId,
          eventType: event.eventType,
          actorType: event.actorType,
          actorId: event.actorId ?? null,
          notes: event.notes ?? null,
          metadata: event.metadata ?? undefined,
          createdAt: new Date(event.createdAt),
        },
      });
    }

  for (const carrier of supportedPartnerCarriers) {
    await (tx as any).partnerCarrier.upsert({
      where: { id: carrier.id },
      update: {
        name: carrier.name,
        slug: carrier.slug,
        type: carrier.type,
        supportsTracking: carrier.supportsTracking,
        supportsApi: carrier.supportsApi,
        supportsFinalDelivery: carrier.supportsFinalDelivery,
        supportsBranchCollection: carrier.supportsBranchCollection,
        active: carrier.active,
        contactConfig: (carrier.contactConfig ?? undefined) as any,
        trackingConfig: (carrier.trackingConfig ?? undefined) as any,
        webhookConfig: (carrier.webhookConfig ?? undefined) as any,
        updatedAt: new Date(carrier.updatedAt),
      },
      create: {
        id: carrier.id,
        name: carrier.name,
        slug: carrier.slug,
        type: carrier.type,
        supportsTracking: carrier.supportsTracking,
        supportsApi: carrier.supportsApi,
        supportsFinalDelivery: carrier.supportsFinalDelivery,
        supportsBranchCollection: carrier.supportsBranchCollection,
        active: carrier.active,
        contactConfig: (carrier.contactConfig ?? undefined) as any,
        trackingConfig: (carrier.trackingConfig ?? undefined) as any,
        webhookConfig: (carrier.webhookConfig ?? undefined) as any,
        createdAt: new Date(carrier.createdAt),
        updatedAt: new Date(carrier.updatedAt),
      },
    });
  }

  for (const location of supportedPartnerHandoffLocations) {
    await (tx as any).partnerHandoffLocation.upsert({
      where: { id: location.id },
      update: {
        partnerCarrierId: location.partnerCarrierId,
        name: location.name,
        parish: location.parish,
        town: location.town,
        addressLine: location.addressLine,
        openingHours: (location.openingHours ?? undefined) as any,
        active: location.active,
        updatedAt: new Date(location.updatedAt),
      },
      create: {
        id: location.id,
        partnerCarrierId: location.partnerCarrierId,
        name: location.name,
        parish: location.parish,
        town: location.town,
        addressLine: location.addressLine,
        openingHours: (location.openingHours ?? undefined) as any,
        active: location.active,
        createdAt: new Date(location.createdAt),
        updatedAt: new Date(location.updatedAt),
      },
    });
  }

  for (const plan of supportedDeliveryTransferPlans) {
    await (tx as any).deliveryTransferPlan.upsert({
      where: { id: plan.id },
      update: {
        merchantDeliveryId: plan.merchantDeliveryId,
        deliveryType: plan.deliveryType,
        originParish: plan.originParish,
        destinationParish: plan.destinationParish,
        destinationTown: plan.destinationTown ?? null,
        transferPartnerId: plan.transferPartnerId,
        originHandoffLocationId:
          plan.originHandoffLocationId && supportedPartnerHandoffLocationIds.has(plan.originHandoffLocationId)
            ? plan.originHandoffLocationId
            : null,
        destinationHandoffLocationId:
          plan.destinationHandoffLocationId && supportedPartnerHandoffLocationIds.has(plan.destinationHandoffLocationId)
            ? plan.destinationHandoffLocationId
            : null,
        finalFulfillmentMethod: plan.finalFulfillmentMethod,
        packageValue: plan.packageValue ?? null,
        specialHandlingNotes: plan.specialHandlingNotes ?? null,
        customerTrackingCode: plan.customerTrackingCode,
        overallStatus: plan.overallStatus,
        updatedAt: new Date(plan.updatedAt),
      },
      create: {
        id: plan.id,
        merchantDeliveryId: plan.merchantDeliveryId,
        deliveryType: plan.deliveryType,
        originParish: plan.originParish,
        destinationParish: plan.destinationParish,
        destinationTown: plan.destinationTown ?? null,
        transferPartnerId: plan.transferPartnerId,
        originHandoffLocationId:
          plan.originHandoffLocationId && supportedPartnerHandoffLocationIds.has(plan.originHandoffLocationId)
            ? plan.originHandoffLocationId
            : null,
        destinationHandoffLocationId:
          plan.destinationHandoffLocationId && supportedPartnerHandoffLocationIds.has(plan.destinationHandoffLocationId)
            ? plan.destinationHandoffLocationId
            : null,
        finalFulfillmentMethod: plan.finalFulfillmentMethod,
        packageValue: plan.packageValue ?? null,
        specialHandlingNotes: plan.specialHandlingNotes ?? null,
        customerTrackingCode: plan.customerTrackingCode,
        overallStatus: plan.overallStatus,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      },
    });
  }

  for (const leg of supportedDeliveryLegs) {
    await (tx as any).deliveryLeg.upsert({
      where: { id: leg.id },
      update: {
        merchantDeliveryId: leg.merchantDeliveryId,
        transferPlanId: leg.transferPlanId ?? null,
        legSequence: leg.legSequence,
        legType: leg.legType,
        providerType: leg.providerType,
        providerId: leg.providerId ?? null,
        originLabel: leg.originLabel,
        originAddress: leg.originAddress ?? null,
        destinationLabel: leg.destinationLabel,
        destinationAddress: leg.destinationAddress ?? null,
        partnerTrackingReference: leg.partnerTrackingReference ?? null,
        status: leg.status,
        eta: toDate(leg.eta),
        startedAt: toDate(leg.startedAt),
        completedAt: toDate(leg.completedAt),
        failedAt: toDate(leg.failedAt),
        updatedAt: new Date(leg.updatedAt),
      },
      create: {
        id: leg.id,
        merchantDeliveryId: leg.merchantDeliveryId,
        transferPlanId: leg.transferPlanId ?? null,
        legSequence: leg.legSequence,
        legType: leg.legType,
        providerType: leg.providerType,
        providerId: leg.providerId ?? null,
        originLabel: leg.originLabel,
        originAddress: leg.originAddress ?? null,
        destinationLabel: leg.destinationLabel,
        destinationAddress: leg.destinationAddress ?? null,
        partnerTrackingReference: leg.partnerTrackingReference ?? null,
        status: leg.status,
        eta: toDate(leg.eta),
        startedAt: toDate(leg.startedAt),
        completedAt: toDate(leg.completedAt),
        failedAt: toDate(leg.failedAt),
        createdAt: new Date(leg.createdAt),
        updatedAt: new Date(leg.updatedAt),
      },
    });
  }

  for (const event of supportedPartnerTrackingEvents) {
    await (tx as any).partnerTrackingEvent.upsert({
      where: { id: event.id },
      update: {
        deliveryLegId: event.deliveryLegId,
        partnerCarrierId: event.partnerCarrierId,
        externalTrackingReference: event.externalTrackingReference ?? null,
        rawStatus: event.rawStatus,
        normalizedStatus: event.normalizedStatus,
        notes: event.notes ?? null,
        eventTimestamp: new Date(event.eventTimestamp),
        createdAt: new Date(event.createdAt),
      },
      create: {
        id: event.id,
        deliveryLegId: event.deliveryLegId,
        partnerCarrierId: event.partnerCarrierId,
        externalTrackingReference: event.externalTrackingReference ?? null,
        rawStatus: event.rawStatus,
        normalizedStatus: event.normalizedStatus,
        notes: event.notes ?? null,
        eventTimestamp: new Date(event.eventTimestamp),
        createdAt: new Date(event.createdAt),
      },
    });
  }

  for (const referral of supportedPublicSlyderReferrals) {
    await tx.publicSlyderReferral.upsert({
      where: { id: referral.id },
      update: {
        referralCode: referral.referralCode,
        referrerName: referral.referrerName,
        referrerPhone: referral.referrerPhone,
        referrerEmail: referral.referrerEmail ?? null,
        referrerAccountId: referral.referrerAccountId ?? null,
        referredName: referral.referredName,
        referredEmail: referral.referredEmail ?? null,
        referredPhone: referral.referredPhone,
        referredParish: referral.referredParish ?? null,
        referredTown: referral.referredTown ?? null,
        referredVehicleType: referral.referredVehicleType ?? null,
        notes: referral.notes ?? null,
        status: referral.status,
        statusReason: referral.statusReason ?? null,
        inviteEmailSentAt: toDate(referral.inviteEmailSentAt),
        inviteEmailStatus: referral.inviteEmailStatus ?? null,
        applicationStartedAt: toDate(referral.applicationStartedAt),
        applicationCompletedAt: toDate(referral.applicationCompletedAt),
        approvedAt: toDate(referral.approvedAt),
        activatedAt: toDate(referral.activatedAt),
        readyAt: toDate(referral.readyAt),
        firstDeliveryCompletedAt: toDate(referral.firstDeliveryCompletedAt),
        rewardEarnedAt: toDate(referral.rewardEarnedAt),
        rewardClaimedAt: toDate(referral.rewardClaimedAt),
        rewardGiftedAt: toDate(referral.rewardGiftedAt),
        rewardRedeemedAt: toDate(referral.rewardRedeemedAt),
        linkedSlyderApplicationId: referral.linkedSlyderApplicationId ?? null,
        linkedSlyderProfileId: referral.linkedSlyderProfileId ?? null,
        rewardId: referral.rewardId ?? null,
        duplicateOfReferralId: referral.duplicateOfReferralId ?? null,
        submittedIpHash: referral.submittedIpHash ?? null,
        submittedUserAgent: referral.submittedUserAgent ?? null,
        updatedAt: new Date(referral.updatedAt),
      },
      create: {
        id: referral.id,
        referralCode: referral.referralCode,
        referrerName: referral.referrerName,
        referrerPhone: referral.referrerPhone,
        referrerEmail: referral.referrerEmail ?? null,
        referrerAccountId: referral.referrerAccountId ?? null,
        referredName: referral.referredName,
        referredEmail: referral.referredEmail ?? null,
        referredPhone: referral.referredPhone,
        referredParish: referral.referredParish ?? null,
        referredTown: referral.referredTown ?? null,
        referredVehicleType: referral.referredVehicleType ?? null,
        notes: referral.notes ?? null,
        status: referral.status,
        statusReason: referral.statusReason ?? null,
        inviteEmailSentAt: toDate(referral.inviteEmailSentAt),
        inviteEmailStatus: referral.inviteEmailStatus ?? null,
        applicationStartedAt: toDate(referral.applicationStartedAt),
        applicationCompletedAt: toDate(referral.applicationCompletedAt),
        approvedAt: toDate(referral.approvedAt),
        activatedAt: toDate(referral.activatedAt),
        readyAt: toDate(referral.readyAt),
        firstDeliveryCompletedAt: toDate(referral.firstDeliveryCompletedAt),
        rewardEarnedAt: toDate(referral.rewardEarnedAt),
        rewardClaimedAt: toDate(referral.rewardClaimedAt),
        rewardGiftedAt: toDate(referral.rewardGiftedAt),
        rewardRedeemedAt: toDate(referral.rewardRedeemedAt),
        linkedSlyderApplicationId: referral.linkedSlyderApplicationId ?? null,
        linkedSlyderProfileId: referral.linkedSlyderProfileId ?? null,
        rewardId: referral.rewardId ?? null,
        duplicateOfReferralId: referral.duplicateOfReferralId ?? null,
        submittedIpHash: referral.submittedIpHash ?? null,
        submittedUserAgent: referral.submittedUserAgent ?? null,
        createdAt: new Date(referral.createdAt),
        updatedAt: new Date(referral.updatedAt),
      },
    });
  }

  for (const event of supportedReferralEvents) {
    await tx.referralEvent.upsert({
      where: { id: event.id },
      update: {
        referralId: event.referralId,
        eventType: event.eventType,
        title: event.title,
        description: event.description ?? null,
        metadata: (event.metadata ?? undefined) as any,
        createdAt: new Date(event.createdAt),
      },
      create: {
        id: event.id,
        referralId: event.referralId,
        eventType: event.eventType,
        title: event.title,
        description: event.description ?? null,
        metadata: (event.metadata ?? undefined) as any,
        createdAt: new Date(event.createdAt),
      },
    });
  }

  for (const reward of supportedReferralRewards) {
    await tx.referralReward.upsert({
      where: { id: reward.id },
      update: {
        publicReferralId: reward.publicReferralId,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        currency: reward.currency,
        status: reward.status,
        isTransferable: reward.isTransferable,
        transferCount: reward.transferCount,
        transferredAt: toDate(reward.transferredAt),
        ownerCustomerAccountId: reward.ownerCustomerAccountId ?? null,
        ownerPhone: reward.ownerPhone ?? null,
        giftedToCustomerAccountId: reward.giftedToCustomerAccountId ?? null,
        giftedToPhone: reward.giftedToPhone ?? null,
        giftedByReferrerPhone: reward.giftedByReferrerPhone ?? null,
        minOrderValue: reward.minOrderValue ?? null,
        expiresAt: new Date(reward.expiresAt),
        redeemedAt: toDate(reward.redeemedAt),
        redemptionOrderId: reward.redemptionOrderId ?? null,
        updatedAt: new Date(reward.updatedAt),
      },
      create: {
        id: reward.id,
        publicReferralId: reward.publicReferralId,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        currency: reward.currency,
        status: reward.status,
        isTransferable: reward.isTransferable,
        transferCount: reward.transferCount,
        transferredAt: toDate(reward.transferredAt),
        ownerCustomerAccountId: reward.ownerCustomerAccountId ?? null,
        ownerPhone: reward.ownerPhone ?? null,
        giftedToCustomerAccountId: reward.giftedToCustomerAccountId ?? null,
        giftedToPhone: reward.giftedToPhone ?? null,
        giftedByReferrerPhone: reward.giftedByReferrerPhone ?? null,
        minOrderValue: reward.minOrderValue ?? null,
        expiresAt: new Date(reward.expiresAt),
        redeemedAt: toDate(reward.redeemedAt),
        redemptionOrderId: reward.redemptionOrderId ?? null,
        createdAt: new Date(reward.createdAt),
        updatedAt: new Date(reward.updatedAt),
      },
    });
  }

  for (const audit of supportedReferralRewardAudits) {
    await tx.referralRewardAudit.upsert({
      where: { id: audit.id },
      update: {
        rewardId: audit.rewardId,
        action: audit.action,
        actorType: audit.actorType,
        actorId: audit.actorId ?? null,
        notes: audit.notes ?? null,
        createdAt: new Date(audit.createdAt),
      },
      create: {
        id: audit.id,
        rewardId: audit.rewardId,
        action: audit.action,
        actorType: audit.actorType,
        actorId: audit.actorId ?? null,
        notes: audit.notes ?? null,
        createdAt: new Date(audit.createdAt),
      },
    });
  }
}

async function persistCriticalOnboardingPrismaSlices(tx: PrismaTransactionClient, store: OnboardingStore) {
  const persistSlice = async (writer: () => Promise<void>) => {
    try {
      await writer();
    } catch (error) {
      if (isMissingPrismaTableError(error)) {
        return;
      }

      throw error;
    }
  };

  await persistSlice(async () => {
    for (const application of store.applications) {
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
  });

  await persistSlice(async () => {
    for (const vehicle of store.vehicles) {
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
  });

  await persistSlice(async () => {
    for (const document of store.documents) {
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
  });

  await persistSlice(async () => {
    for (const historyItem of store.history.filter(
      (item) => item.entityType === "application" || item.entityType === "user" || item.entityType === "slyder_profile",
    )) {
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
  });

  await persistSlice(async () => {
    for (const acceptance of store.legalAcceptances) {
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
  });
}

function isMissingPrismaTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (error as { code?: unknown }).code === "P2021";
}

function shouldFallbackToCriticalOnboardingPersist(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    meta?: { modelName?: unknown; cause?: unknown; driverAdapterError?: { cause?: { message?: unknown } } };
  };

  if (candidate.code === "P2021") {
    return true;
  }

  if (candidate.code === "P2007" && candidate.meta?.modelName === "NotificationTemplate") {
    return true;
  }

  const adapterMessage = candidate.meta?.driverAdapterError?.cause?.message;
  if (typeof adapterMessage === "string" && adapterMessage.includes('enum "NotificationActorType"')) {
    return true;
  }

  return false;
}

export class PrismaRepository implements PersistenceRepository {
  readonly driver = "prisma" as const;

  async readSnapshot(): Promise<OnboardingStore> {
    const store = await createSeedStore();
    try {
      return await overlaySupportedPrismaSlices(store);
    } catch (error) {
      if (isMissingPrismaTableError(error)) {
        return overlayCriticalOnboardingPrismaSlices(store);
      }

      throw error;
    }
  }

  async transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
    const store = await this.readSnapshot();
    const result = await mutator(store);

    try {
      await prisma.$transaction(async (tx) => {
        await persistSupportedPrismaSlices(tx as PrismaTransactionClient, store);
      });
    } catch (error) {
      if (!shouldFallbackToCriticalOnboardingPersist(error)) {
        throw error;
      }

      await prisma.$transaction(async (tx) => {
        await persistCriticalOnboardingPrismaSlices(tx as PrismaTransactionClient, store);
      });
    }

    return result;
  }

  async createReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount> {
    const record = await prisma.referrerAccount.create({
      data: {
        id: account.id,
        fullName: account.fullName,
        email: account.email ?? null,
        phone: account.phone ?? null,
        emailVerifiedAt: toDate(account.emailVerifiedAt),
        phoneVerifiedAt: toDate(account.phoneVerifiedAt),
        isEnabled: account.isEnabled,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      },
    });
    return mapReferrerAccount(record)!;
  }

  async updateReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount> {
    const record = await prisma.referrerAccount.update({
      where: { id: account.id },
      data: {
        fullName: account.fullName,
        email: account.email ?? null,
        phone: account.phone ?? null,
        emailVerifiedAt: toDate(account.emailVerifiedAt),
        phoneVerifiedAt: toDate(account.phoneVerifiedAt),
        isEnabled: account.isEnabled,
        updatedAt: new Date(account.updatedAt),
      },
    });
    return mapReferrerAccount(record)!;
  }

  async findReferrerAccountById(id: string): Promise<ReferrerAccount | null> {
    return mapReferrerAccount(await prisma.referrerAccount.findUnique({ where: { id } }));
  }

  async findReferrerAccountByEmail(email: string): Promise<ReferrerAccount | null> {
    return mapReferrerAccount(await prisma.referrerAccount.findUnique({ where: { email } }));
  }

  async findReferrerAccountByPhone(phone: string): Promise<ReferrerAccount | null> {
    return mapReferrerAccount(await prisma.referrerAccount.findUnique({ where: { phone } }));
  }

  async createReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge> {
    const record = await prisma.referrerLoginChallenge.create({
      data: {
        id: challenge.id,
        referrerAccountId: challenge.referrerAccountId ?? null,
        channel: challenge.channel,
        email: challenge.email ?? null,
        phone: challenge.phone ?? null,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
        createdAt: new Date(challenge.createdAt),
      },
    });
    return mapReferrerLoginChallenge(record)!;
  }

  async updateReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge> {
    const record = await prisma.referrerLoginChallenge.update({
      where: { id: challenge.id },
      data: {
        referrerAccountId: challenge.referrerAccountId ?? null,
        channel: challenge.channel,
        email: challenge.email ?? null,
        phone: challenge.phone ?? null,
        codeHash: challenge.codeHash,
        expiresAt: new Date(challenge.expiresAt),
        consumedAt: toDate(challenge.consumedAt),
      },
    });
    return mapReferrerLoginChallenge(record)!;
  }

  async findReferrerLoginChallengeById(id: string): Promise<ReferrerLoginChallenge | null> {
    return mapReferrerLoginChallenge(await prisma.referrerLoginChallenge.findUnique({ where: { id } }));
  }

  async createReferrerSession(session: ReferrerSession): Promise<ReferrerSession> {
    const record = await prisma.referrerSession.create({
      data: {
        id: session.id,
        referrerAccountId: session.referrerAccountId,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      },
    });
    return mapReferrerSession(record)!;
  }

  async findReferrerSessionById(id: string): Promise<ReferrerSession | null> {
    return mapReferrerSession(await prisma.referrerSession.findUnique({ where: { id } }));
  }

  async deleteReferrerSession(id: string): Promise<void> {
    await prisma.referrerSession.deleteMany({ where: { id } });
  }

  async createReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral> {
    const record = await prisma.publicSlyderReferral.create({
      data: {
        id: referral.id,
        referralCode: referral.referralCode,
        referrerName: referral.referrerName,
        referrerPhone: referral.referrerPhone,
        referrerEmail: referral.referrerEmail ?? null,
        referrerAccountId: referral.referrerAccountId ?? null,
        referredName: referral.referredName,
        referredEmail: referral.referredEmail ?? null,
        referredPhone: referral.referredPhone,
        referredParish: referral.referredParish ?? null,
        referredTown: referral.referredTown ?? null,
        referredVehicleType: referral.referredVehicleType ?? null,
        notes: referral.notes ?? null,
        status: referral.status,
        statusReason: referral.statusReason ?? null,
        inviteEmailSentAt: toDate(referral.inviteEmailSentAt),
        inviteEmailStatus: referral.inviteEmailStatus ?? null,
        applicationStartedAt: toDate(referral.applicationStartedAt),
        applicationCompletedAt: toDate(referral.applicationCompletedAt),
        approvedAt: toDate(referral.approvedAt),
        activatedAt: toDate(referral.activatedAt),
        readyAt: toDate(referral.readyAt),
        firstDeliveryCompletedAt: toDate(referral.firstDeliveryCompletedAt),
        rewardEarnedAt: toDate(referral.rewardEarnedAt),
        rewardClaimedAt: toDate(referral.rewardClaimedAt),
        rewardGiftedAt: toDate(referral.rewardGiftedAt),
        rewardRedeemedAt: toDate(referral.rewardRedeemedAt),
        linkedSlyderApplicationId: referral.linkedSlyderApplicationId ?? null,
        linkedSlyderProfileId: referral.linkedSlyderProfileId ?? null,
        rewardId: referral.rewardId ?? null,
        duplicateOfReferralId: referral.duplicateOfReferralId ?? null,
        submittedIpHash: referral.submittedIpHash ?? null,
        submittedUserAgent: referral.submittedUserAgent ?? null,
        createdAt: new Date(referral.createdAt),
        updatedAt: new Date(referral.updatedAt),
      },
    });
    return mapPublicSlyderReferral(record)!;
  }

  async findReferralById(id: string): Promise<PublicSlyderReferral | null> {
    return mapPublicSlyderReferral(await prisma.publicSlyderReferral.findUnique({ where: { id } }));
  }

  async findReferralByIdForReferrerAccount(
    id: string,
    referrerAccountId: string,
  ): Promise<PublicSlyderReferral | null> {
    return mapPublicSlyderReferral(
      await prisma.publicSlyderReferral.findFirst({
        where: { id, referrerAccountId },
      }),
    );
  }

  async findReferralByCode(referralCode: string): Promise<PublicSlyderReferral | null> {
    return mapPublicSlyderReferral(await prisma.publicSlyderReferral.findUnique({ where: { referralCode } }));
  }

  async findReferralByReferredPhone(referredPhone: string): Promise<PublicSlyderReferral | null> {
    return mapPublicSlyderReferral(
      await prisma.publicSlyderReferral.findFirst({
        where: { referredPhone },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  async listReferralsByReferrerAccountId(referrerAccountId: string): Promise<ReferralRewardWithReferral[]> {
    const records = await prisma.publicSlyderReferral.findMany({
      where: { referrerAccountId },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      referral: mapPublicSlyderReferral(record)!,
      reward: mapReferralReward(record.reward) ?? undefined,
    }));
  }

  async listReferrals(filters?: AdminReferralFilters): Promise<ReferralRewardWithReferral[]> {
    const where: Prisma.PublicSlyderReferralWhereInput = {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.parish ? { referredParish: { equals: filters.parish, mode: "insensitive" } } : {}),
      ...(filters?.duplicateFlagged !== undefined
        ? filters.duplicateFlagged
          ? { OR: [{ status: "duplicate_flagged" }, { duplicateOfReferralId: { not: null } }] }
          : { duplicateOfReferralId: null }
        : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { referralCode: { contains: filters.search, mode: "insensitive" } },
              { referrerName: { contains: filters.search, mode: "insensitive" } },
              { referrerPhone: { contains: filters.search, mode: "insensitive" } },
              { referrerEmail: { contains: filters.search, mode: "insensitive" } },
              { referredName: { contains: filters.search, mode: "insensitive" } },
              { referredPhone: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const records = await prisma.publicSlyderReferral.findMany({
      where: filters?.rewardStatus ? { ...where, reward: { is: { status: filters.rewardStatus } } } : where,
      include: { reward: true },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      referral: mapPublicSlyderReferral(record)!,
      reward: mapReferralReward(record.reward) ?? undefined,
    }));
  }

  async updateReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral> {
    const record = await prisma.publicSlyderReferral.update({
      where: { id: referral.id },
      data: {
        referralCode: referral.referralCode,
        referrerName: referral.referrerName,
        referrerPhone: referral.referrerPhone,
        referrerEmail: referral.referrerEmail ?? null,
        referrerAccountId: referral.referrerAccountId ?? null,
        referredName: referral.referredName,
        referredEmail: referral.referredEmail ?? null,
        referredPhone: referral.referredPhone,
        referredParish: referral.referredParish ?? null,
        referredTown: referral.referredTown ?? null,
        referredVehicleType: referral.referredVehicleType ?? null,
        notes: referral.notes ?? null,
        status: referral.status,
        statusReason: referral.statusReason ?? null,
        inviteEmailSentAt: toDate(referral.inviteEmailSentAt),
        inviteEmailStatus: referral.inviteEmailStatus ?? null,
        applicationStartedAt: toDate(referral.applicationStartedAt),
        applicationCompletedAt: toDate(referral.applicationCompletedAt),
        approvedAt: toDate(referral.approvedAt),
        activatedAt: toDate(referral.activatedAt),
        readyAt: toDate(referral.readyAt),
        firstDeliveryCompletedAt: toDate(referral.firstDeliveryCompletedAt),
        rewardEarnedAt: toDate(referral.rewardEarnedAt),
        rewardClaimedAt: toDate(referral.rewardClaimedAt),
        rewardGiftedAt: toDate(referral.rewardGiftedAt),
        rewardRedeemedAt: toDate(referral.rewardRedeemedAt),
        linkedSlyderApplicationId: referral.linkedSlyderApplicationId ?? null,
        linkedSlyderProfileId: referral.linkedSlyderProfileId ?? null,
        rewardId: referral.rewardId ?? null,
        duplicateOfReferralId: referral.duplicateOfReferralId ?? null,
        submittedIpHash: referral.submittedIpHash ?? null,
        submittedUserAgent: referral.submittedUserAgent ?? null,
        updatedAt: new Date(referral.updatedAt),
      },
    });
    return mapPublicSlyderReferral(record)!;
  }

  async createReferralEvent(event: ReferralEvent): Promise<ReferralEvent> {
    const record = await prisma.referralEvent.create({
      data: {
        id: event.id,
        referralId: event.referralId,
        eventType: event.eventType,
        title: event.title,
        description: event.description ?? null,
        metadata: (event.metadata ?? undefined) as any,
        createdAt: new Date(event.createdAt),
      },
    });
    return mapReferralEvent(record)!;
  }

  async listReferralEventsByReferralId(referralId: string): Promise<ReferralEvent[]> {
    const records = await prisma.referralEvent.findMany({
      where: { referralId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => mapReferralEvent(record)!);
  }

  async createReward(reward: ReferralReward): Promise<ReferralReward> {
    const record = await prisma.referralReward.create({
      data: {
        id: reward.id,
        publicReferralId: reward.publicReferralId,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        currency: reward.currency,
        status: reward.status,
        isTransferable: reward.isTransferable,
        transferCount: reward.transferCount,
        transferredAt: toDate(reward.transferredAt),
        ownerCustomerAccountId: reward.ownerCustomerAccountId ?? null,
        ownerPhone: reward.ownerPhone ?? null,
        giftedToCustomerAccountId: reward.giftedToCustomerAccountId ?? null,
        giftedToPhone: reward.giftedToPhone ?? null,
        giftedByReferrerPhone: reward.giftedByReferrerPhone ?? null,
        minOrderValue: reward.minOrderValue ?? null,
        expiresAt: new Date(reward.expiresAt),
        redeemedAt: toDate(reward.redeemedAt),
        redemptionOrderId: reward.redemptionOrderId ?? null,
        createdAt: new Date(reward.createdAt),
        updatedAt: new Date(reward.updatedAt),
      },
    });
    return mapReferralReward(record)!;
  }

  async findRewardById(id: string): Promise<ReferralReward | null> {
    return mapReferralReward(await prisma.referralReward.findUnique({ where: { id } }));
  }

  async findRewardByReferralId(publicReferralId: string): Promise<ReferralReward | null> {
    return mapReferralReward(await prisma.referralReward.findUnique({ where: { publicReferralId } }));
  }

  async updateReward(reward: ReferralReward): Promise<ReferralReward> {
    const record = await prisma.referralReward.update({
      where: { id: reward.id },
      data: {
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        currency: reward.currency,
        status: reward.status,
        isTransferable: reward.isTransferable,
        transferCount: reward.transferCount,
        transferredAt: toDate(reward.transferredAt),
        ownerCustomerAccountId: reward.ownerCustomerAccountId ?? null,
        ownerPhone: reward.ownerPhone ?? null,
        giftedToCustomerAccountId: reward.giftedToCustomerAccountId ?? null,
        giftedToPhone: reward.giftedToPhone ?? null,
        giftedByReferrerPhone: reward.giftedByReferrerPhone ?? null,
        minOrderValue: reward.minOrderValue ?? null,
        expiresAt: new Date(reward.expiresAt),
        redeemedAt: toDate(reward.redeemedAt),
        redemptionOrderId: reward.redemptionOrderId ?? null,
        updatedAt: new Date(reward.updatedAt),
      },
    });
    return mapReferralReward(record)!;
  }

  async createRewardAudit(audit: ReferralRewardAudit): Promise<ReferralRewardAudit> {
    const record = await prisma.referralRewardAudit.create({
      data: {
        id: audit.id,
        rewardId: audit.rewardId,
        action: audit.action,
        actorType: audit.actorType,
        actorId: audit.actorId ?? null,
        notes: audit.notes ?? null,
        createdAt: new Date(audit.createdAt),
      },
    });
    return mapReferralRewardAudit(record)!;
  }

  async listRewardAuditsByRewardId(rewardId: string): Promise<ReferralRewardAudit[]> {
    const records = await prisma.referralRewardAudit.findMany({
      where: { rewardId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record) => mapReferralRewardAudit(record)!);
  }

  async createMerchantOrder(order: MerchantOrder): Promise<MerchantOrder> {
    const record = await (prisma as any).merchantOrder.create({
      data: {
        id: order.id,
        merchantId: order.merchantId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        pickupLocationId: order.pickupLocationId ?? null,
        pickupAddressSnapshot: order.pickupAddressSnapshot ?? null,
        itemDescription: order.itemDescription,
        packageType: order.packageType,
        paymentType: order.paymentType,
        codAmount: order.codAmount ?? null,
        internalNote: order.internalNote ?? null,
        riderNote: order.riderNote ?? null,
        requestedTiming: order.requestedTiming,
        scheduledFor: toDate(order.scheduledFor),
        status: order.status,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      },
    });
    return mapMerchantOrder(record)!;
  }

  async updateMerchantOrder(order: MerchantOrder): Promise<MerchantOrder> {
    const record = await (prisma as any).merchantOrder.update({
      where: { id: order.id },
      data: {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        pickupLocationId: order.pickupLocationId ?? null,
        pickupAddressSnapshot: order.pickupAddressSnapshot ?? null,
        itemDescription: order.itemDescription,
        packageType: order.packageType,
        paymentType: order.paymentType,
        codAmount: order.codAmount ?? null,
        internalNote: order.internalNote ?? null,
        riderNote: order.riderNote ?? null,
        requestedTiming: order.requestedTiming,
        scheduledFor: toDate(order.scheduledFor),
        status: order.status,
        updatedAt: new Date(order.updatedAt),
      },
    });
    return mapMerchantOrder(record)!;
  }

  async findMerchantOrderById(id: string): Promise<MerchantOrder | null> {
    return mapMerchantOrder(await (prisma as any).merchantOrder.findUnique({ where: { id } }));
  }

  async listMerchantOrdersByMerchantId(merchantId: string): Promise<MerchantOrder[]> {
    const records = await (prisma as any).merchantOrder.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record: any) => mapMerchantOrder(record)!);
  }

  async createMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery> {
    const record = await (prisma as any).merchantDelivery.create({
      data: {
        id: delivery.id,
        merchantOrderId: delivery.merchantOrderId,
        merchantId: delivery.merchantId,
        dispatchMode: delivery.dispatchMode,
        riderId: delivery.riderId ?? null,
        quoteAmount: delivery.quoteAmount ?? null,
        assignedAt: toDate(delivery.assignedAt),
        pickedUpAt: toDate(delivery.pickedUpAt),
        deliveredAt: toDate(delivery.deliveredAt),
        failedAt: toDate(delivery.failedAt),
        cancelledAt: toDate(delivery.cancelledAt),
        status: delivery.status,
        proofOfDeliveryUrl: delivery.proofOfDeliveryUrl ?? null,
        createdAt: new Date(delivery.createdAt),
        updatedAt: new Date(delivery.updatedAt),
      },
    });
    return mapMerchantDelivery(record)!;
  }

  async updateMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery> {
    const record = await (prisma as any).merchantDelivery.update({
      where: { id: delivery.id },
      data: {
        dispatchMode: delivery.dispatchMode,
        riderId: delivery.riderId ?? null,
        quoteAmount: delivery.quoteAmount ?? null,
        assignedAt: toDate(delivery.assignedAt),
        pickedUpAt: toDate(delivery.pickedUpAt),
        deliveredAt: toDate(delivery.deliveredAt),
        failedAt: toDate(delivery.failedAt),
        cancelledAt: toDate(delivery.cancelledAt),
        status: delivery.status,
        proofOfDeliveryUrl: delivery.proofOfDeliveryUrl ?? null,
        updatedAt: new Date(delivery.updatedAt),
      },
    });
    return mapMerchantDelivery(record)!;
  }

  async findMerchantDeliveryById(id: string): Promise<MerchantDelivery | null> {
    return mapMerchantDelivery(await (prisma as any).merchantDelivery.findUnique({ where: { id } }));
  }

  async listMerchantDeliveriesByMerchantId(merchantId: string): Promise<MerchantDelivery[]> {
    const records = await (prisma as any).merchantDelivery.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record: any) => mapMerchantDelivery(record)!);
  }

  async createMerchantAddress(address: MerchantAddress): Promise<MerchantAddress> {
    const record = await (prisma as any).merchantAddress.create({
      data: {
        id: address.id,
        merchantId: address.merchantId,
        type: address.type,
        label: address.label,
        contactName: address.contactName,
        contactPhone: address.contactPhone,
        addressLine: address.addressLine,
        parish: address.parish,
        town: address.town,
        notes: address.notes ?? null,
        isDefault: address.isDefault,
        createdAt: new Date(address.createdAt),
        updatedAt: new Date(address.updatedAt),
      },
    });
    return mapMerchantAddress(record)!;
  }

  async updateMerchantAddress(address: MerchantAddress): Promise<MerchantAddress> {
    const record = await (prisma as any).merchantAddress.update({
      where: { id: address.id },
      data: {
        type: address.type,
        label: address.label,
        contactName: address.contactName,
        contactPhone: address.contactPhone,
        addressLine: address.addressLine,
        parish: address.parish,
        town: address.town,
        notes: address.notes ?? null,
        isDefault: address.isDefault,
        updatedAt: new Date(address.updatedAt),
      },
    });
    return mapMerchantAddress(record)!;
  }

  async deleteMerchantAddress(id: string): Promise<void> {
    await (prisma as any).merchantAddress.deleteMany({ where: { id } });
  }

  async findMerchantAddressById(id: string): Promise<MerchantAddress | null> {
    return mapMerchantAddress(await (prisma as any).merchantAddress.findUnique({ where: { id } }));
  }

  async listMerchantAddressesByMerchantId(merchantId: string): Promise<MerchantAddress[]> {
    const records = await (prisma as any).merchantAddress.findMany({
      where: { merchantId },
      orderBy: [{ isDefault: "desc" }, { label: "asc" }],
    });
    return records.map((record: any) => mapMerchantAddress(record)!);
  }

  async createMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember> {
    const record = await (prisma as any).merchantTeamMember.create({
      data: {
        id: member.id,
        merchantId: member.merchantId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedAt: toDate(member.invitedAt),
        joinedAt: toDate(member.joinedAt),
        createdAt: new Date(member.createdAt),
        updatedAt: new Date(member.updatedAt),
      },
    });
    return mapMerchantTeamMember(record)!;
  }

  async updateMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember> {
    const record = await (prisma as any).merchantTeamMember.update({
      where: { id: member.id },
      data: {
        role: member.role,
        status: member.status,
        invitedAt: toDate(member.invitedAt),
        joinedAt: toDate(member.joinedAt),
        updatedAt: new Date(member.updatedAt),
      },
    });
    return mapMerchantTeamMember(record)!;
  }

  async findMerchantTeamMemberByUserId(userId: string): Promise<MerchantTeamMember | null> {
    return mapMerchantTeamMember(
      await (prisma as any).merchantTeamMember.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  async listMerchantTeamMembersByMerchantId(merchantId: string): Promise<MerchantTeamMember[]> {
    const records = await (prisma as any).merchantTeamMember.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record: any) => mapMerchantTeamMember(record)!);
  }

  async upsertMerchantNotificationPreference(
    preference: MerchantNotificationPreference,
  ): Promise<MerchantNotificationPreference> {
    const record = await (prisma as any).merchantNotificationPreference.upsert({
      where: { merchantId: preference.merchantId },
      update: {
        emailEnabled: preference.emailEnabled,
        smsEnabled: preference.smsEnabled,
        whatsappEnabled: preference.whatsappEnabled,
        notifyOnAssigned: preference.notifyOnAssigned,
        notifyOnDelivered: preference.notifyOnDelivered,
        notifyOnFailed: preference.notifyOnFailed,
        notifyOnBilling: preference.notifyOnBilling,
        updatedAt: new Date(preference.updatedAt),
      },
      create: {
        id: preference.id,
        merchantId: preference.merchantId,
        emailEnabled: preference.emailEnabled,
        smsEnabled: preference.smsEnabled,
        whatsappEnabled: preference.whatsappEnabled,
        notifyOnAssigned: preference.notifyOnAssigned,
        notifyOnDelivered: preference.notifyOnDelivered,
        notifyOnFailed: preference.notifyOnFailed,
        notifyOnBilling: preference.notifyOnBilling,
        createdAt: new Date(preference.createdAt),
        updatedAt: new Date(preference.updatedAt),
      },
    });
    return mapMerchantNotificationPreference(record)!;
  }

  async findMerchantNotificationPreferenceByMerchantId(
    merchantId: string,
  ): Promise<MerchantNotificationPreference | null> {
    return mapMerchantNotificationPreference(
      await (prisma as any).merchantNotificationPreference.findUnique({ where: { merchantId } }),
    );
  }

  async createMerchantDispatchEvent(event: MerchantDispatchEvent): Promise<MerchantDispatchEvent> {
    const record = await (prisma as any).merchantDispatchEvent.create({
      data: {
        id: event.id,
        merchantDeliveryId: event.merchantDeliveryId,
        eventType: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId ?? null,
        notes: event.notes ?? null,
        metadata: event.metadata ?? undefined,
        createdAt: new Date(event.createdAt),
      },
    });
    return mapMerchantDispatchEvent(record)!;
  }

  async listMerchantDispatchEventsByDeliveryId(merchantDeliveryId: string): Promise<MerchantDispatchEvent[]> {
    const records = await (prisma as any).merchantDispatchEvent.findMany({
      where: { merchantDeliveryId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record: any) => mapMerchantDispatchEvent(record)!);
  }

  async createPartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier> {
    const record = await (prisma as any).partnerCarrier.create({
      data: {
        id: carrier.id,
        name: carrier.name,
        slug: carrier.slug,
        type: carrier.type,
        supportsTracking: carrier.supportsTracking,
        supportsApi: carrier.supportsApi,
        supportsFinalDelivery: carrier.supportsFinalDelivery,
        supportsBranchCollection: carrier.supportsBranchCollection,
        active: carrier.active,
        contactConfig: (carrier.contactConfig ?? undefined) as any,
        trackingConfig: (carrier.trackingConfig ?? undefined) as any,
        webhookConfig: (carrier.webhookConfig ?? undefined) as any,
        createdAt: new Date(carrier.createdAt),
        updatedAt: new Date(carrier.updatedAt),
      },
    });
    return mapPartnerCarrier(record)!;
  }

  async updatePartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier> {
    const record = await (prisma as any).partnerCarrier.update({
      where: { id: carrier.id },
      data: {
        name: carrier.name,
        slug: carrier.slug,
        type: carrier.type,
        supportsTracking: carrier.supportsTracking,
        supportsApi: carrier.supportsApi,
        supportsFinalDelivery: carrier.supportsFinalDelivery,
        supportsBranchCollection: carrier.supportsBranchCollection,
        active: carrier.active,
        contactConfig: (carrier.contactConfig ?? undefined) as any,
        trackingConfig: (carrier.trackingConfig ?? undefined) as any,
        webhookConfig: (carrier.webhookConfig ?? undefined) as any,
        updatedAt: new Date(carrier.updatedAt),
      },
    });
    return mapPartnerCarrier(record)!;
  }

  async findPartnerCarrierById(id: string): Promise<PartnerCarrier | null> {
    return mapPartnerCarrier(await (prisma as any).partnerCarrier.findUnique({ where: { id } }));
  }

  async listPartnerCarriers(): Promise<PartnerCarrier[]> {
    const records = await (prisma as any).partnerCarrier.findMany({ orderBy: { name: "asc" } });
    return records.map((record: any) => mapPartnerCarrier(record)!);
  }

  async createPartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation> {
    const record = await (prisma as any).partnerHandoffLocation.create({
      data: {
        id: location.id,
        partnerCarrierId: location.partnerCarrierId,
        name: location.name,
        parish: location.parish,
        town: location.town,
        addressLine: location.addressLine,
        openingHours: (location.openingHours ?? undefined) as any,
        active: location.active,
        createdAt: new Date(location.createdAt),
        updatedAt: new Date(location.updatedAt),
      },
    });
    return mapPartnerHandoffLocation(record)!;
  }

  async updatePartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation> {
    const record = await (prisma as any).partnerHandoffLocation.update({
      where: { id: location.id },
      data: {
        name: location.name,
        parish: location.parish,
        town: location.town,
        addressLine: location.addressLine,
        openingHours: (location.openingHours ?? undefined) as any,
        active: location.active,
        updatedAt: new Date(location.updatedAt),
      },
    });
    return mapPartnerHandoffLocation(record)!;
  }

  async listPartnerHandoffLocationsByCarrierId(partnerCarrierId: string): Promise<PartnerHandoffLocation[]> {
    const records = await (prisma as any).partnerHandoffLocation.findMany({
      where: { partnerCarrierId },
      orderBy: { name: "asc" },
    });
    return records.map((record: any) => mapPartnerHandoffLocation(record)!);
  }

  async findPartnerHandoffLocationById(id: string): Promise<PartnerHandoffLocation | null> {
    return mapPartnerHandoffLocation(await (prisma as any).partnerHandoffLocation.findUnique({ where: { id } }));
  }

  async createDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan> {
    const record = await (prisma as any).deliveryTransferPlan.create({
      data: {
        id: plan.id,
        merchantDeliveryId: plan.merchantDeliveryId,
        deliveryType: plan.deliveryType,
        originParish: plan.originParish,
        destinationParish: plan.destinationParish,
        destinationTown: plan.destinationTown ?? null,
        transferPartnerId: plan.transferPartnerId,
        originHandoffLocationId: plan.originHandoffLocationId ?? null,
        destinationHandoffLocationId: plan.destinationHandoffLocationId ?? null,
        finalFulfillmentMethod: plan.finalFulfillmentMethod,
        packageValue: plan.packageValue ?? null,
        specialHandlingNotes: plan.specialHandlingNotes ?? null,
        customerTrackingCode: plan.customerTrackingCode,
        overallStatus: plan.overallStatus,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      },
    });
    return mapDeliveryTransferPlan(record)!;
  }

  async updateDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan> {
    const record = await (prisma as any).deliveryTransferPlan.update({
      where: { id: plan.id },
      data: {
        destinationParish: plan.destinationParish,
        destinationTown: plan.destinationTown ?? null,
        transferPartnerId: plan.transferPartnerId,
        originHandoffLocationId: plan.originHandoffLocationId ?? null,
        destinationHandoffLocationId: plan.destinationHandoffLocationId ?? null,
        finalFulfillmentMethod: plan.finalFulfillmentMethod,
        packageValue: plan.packageValue ?? null,
        specialHandlingNotes: plan.specialHandlingNotes ?? null,
        overallStatus: plan.overallStatus,
        updatedAt: new Date(plan.updatedAt),
      },
    });
    return mapDeliveryTransferPlan(record)!;
  }

  async findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryTransferPlan | null> {
    return mapDeliveryTransferPlan(
      await (prisma as any).deliveryTransferPlan.findUnique({ where: { merchantDeliveryId } }),
    );
  }

  async createDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg> {
    const record = await (prisma as any).deliveryLeg.create({
      data: {
        id: leg.id,
        merchantDeliveryId: leg.merchantDeliveryId,
        transferPlanId: leg.transferPlanId ?? null,
        legSequence: leg.legSequence,
        legType: leg.legType,
        providerType: leg.providerType,
        providerId: leg.providerId ?? null,
        originLabel: leg.originLabel,
        originAddress: leg.originAddress ?? null,
        destinationLabel: leg.destinationLabel,
        destinationAddress: leg.destinationAddress ?? null,
        partnerTrackingReference: leg.partnerTrackingReference ?? null,
        status: leg.status,
        eta: toDate(leg.eta),
        startedAt: toDate(leg.startedAt),
        completedAt: toDate(leg.completedAt),
        failedAt: toDate(leg.failedAt),
        createdAt: new Date(leg.createdAt),
        updatedAt: new Date(leg.updatedAt),
      },
    });
    return mapDeliveryLeg(record)!;
  }

  async updateDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg> {
    const record = await (prisma as any).deliveryLeg.update({
      where: { id: leg.id },
      data: {
        providerId: leg.providerId ?? null,
        partnerTrackingReference: leg.partnerTrackingReference ?? null,
        status: leg.status,
        eta: toDate(leg.eta),
        startedAt: toDate(leg.startedAt),
        completedAt: toDate(leg.completedAt),
        failedAt: toDate(leg.failedAt),
        updatedAt: new Date(leg.updatedAt),
      },
    });
    return mapDeliveryLeg(record)!;
  }

  async findDeliveryLegById(id: string): Promise<DeliveryLeg | null> {
    return mapDeliveryLeg(await (prisma as any).deliveryLeg.findUnique({ where: { id } }));
  }

  async listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryLeg[]> {
    const records = await (prisma as any).deliveryLeg.findMany({
      where: { merchantDeliveryId },
      orderBy: [{ legSequence: "asc" }, { createdAt: "asc" }],
    });
    return records.map((record: any) => mapDeliveryLeg(record)!);
  }

  async createPartnerTrackingEvent(event: PartnerTrackingEvent): Promise<PartnerTrackingEvent> {
    const record = await (prisma as any).partnerTrackingEvent.create({
      data: {
        id: event.id,
        deliveryLegId: event.deliveryLegId,
        partnerCarrierId: event.partnerCarrierId,
        externalTrackingReference: event.externalTrackingReference ?? null,
        rawStatus: event.rawStatus,
        normalizedStatus: event.normalizedStatus,
        notes: event.notes ?? null,
        eventTimestamp: new Date(event.eventTimestamp),
        createdAt: new Date(event.createdAt),
      },
    });
    return mapPartnerTrackingEvent(record)!;
  }

  async listPartnerTrackingEventsByDeliveryLegId(deliveryLegId: string): Promise<PartnerTrackingEvent[]> {
    const records = await (prisma as any).partnerTrackingEvent.findMany({
      where: { deliveryLegId },
      orderBy: { eventTimestamp: "asc" },
    });
    return records.map((record: any) => mapPartnerTrackingEvent(record)!);
  }

  async createSupportConversation(conversation: SupportConversation): Promise<SupportConversation> {
    const record = await (prisma as any).supportConversation.create({
      data: {
        id: conversation.id,
        channel: conversation.channel,
        domain: conversation.domain,
        status: conversation.status,
        priority: conversation.priority,
        subject: conversation.subject,
        externalProvider: conversation.externalProvider ?? null,
        externalConversationId: conversation.externalConversationId ?? null,
        externalTicketId: conversation.externalTicketId ?? null,
        userId: conversation.userId ?? null,
        merchantId: conversation.merchantId ?? null,
        slyderProfileId: conversation.slyderProfileId ?? null,
        employeeProfileId: conversation.employeeProfileId ?? null,
        referrerAccountId: conversation.referrerAccountId ?? null,
        assignedTeam: conversation.assignedTeam ?? null,
        assignedAgentId: conversation.assignedAgentId ?? null,
        lastMessageAt: toDate(conversation.lastMessageAt),
        resolvedAt: toDate(conversation.resolvedAt),
        closedAt: toDate(conversation.closedAt),
        createdAt: new Date(conversation.createdAt),
        updatedAt: new Date(conversation.updatedAt),
      },
    });
    return mapSupportConversation(record)!;
  }

  async updateSupportConversation(conversation: SupportConversation): Promise<SupportConversation> {
    const record = await (prisma as any).supportConversation.update({
      where: { id: conversation.id },
      data: {
        channel: conversation.channel,
        domain: conversation.domain,
        status: conversation.status,
        priority: conversation.priority,
        subject: conversation.subject,
        externalProvider: conversation.externalProvider ?? null,
        externalConversationId: conversation.externalConversationId ?? null,
        externalTicketId: conversation.externalTicketId ?? null,
        userId: conversation.userId ?? null,
        merchantId: conversation.merchantId ?? null,
        slyderProfileId: conversation.slyderProfileId ?? null,
        employeeProfileId: conversation.employeeProfileId ?? null,
        referrerAccountId: conversation.referrerAccountId ?? null,
        assignedTeam: conversation.assignedTeam ?? null,
        assignedAgentId: conversation.assignedAgentId ?? null,
        lastMessageAt: toDate(conversation.lastMessageAt),
        resolvedAt: toDate(conversation.resolvedAt),
        closedAt: toDate(conversation.closedAt),
        updatedAt: new Date(conversation.updatedAt),
      },
    });
    return mapSupportConversation(record)!;
  }

  async findSupportConversationById(id: string): Promise<SupportConversation | null> {
    return mapSupportConversation(await (prisma as any).supportConversation.findUnique({ where: { id } }));
  }

  async listSupportConversations(): Promise<SupportConversation[]> {
    const records = await (prisma as any).supportConversation.findMany({ orderBy: { createdAt: "desc" } });
    return records.map((record: any) => mapSupportConversation(record)!);
  }

  async createSupportMessage(message: SupportMessage): Promise<SupportMessage> {
    const record = await (prisma as any).supportMessage.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderType: message.senderType,
        senderId: message.senderId ?? null,
        body: message.body,
        messageFormat: message.messageFormat,
        externalMessageId: message.externalMessageId ?? null,
        aiGenerated: message.aiGenerated,
        metadata: (message.metadata ?? undefined) as any,
        createdAt: new Date(message.createdAt),
      },
    });
    return mapSupportMessage(record)!;
  }

  async listSupportMessagesByConversationId(conversationId: string): Promise<SupportMessage[]> {
    const records = await (prisma as any).supportMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record: any) => mapSupportMessage(record)!);
  }

  async createSupportContextSnapshot(snapshot: SupportContextSnapshot): Promise<SupportContextSnapshot> {
    const record = await (prisma as any).supportContextSnapshot.create({
      data: {
        id: snapshot.id,
        conversationId: snapshot.conversationId,
        contextType: snapshot.contextType,
        payload: snapshot.payload as any,
        createdAt: new Date(snapshot.createdAt),
      },
    });
    return mapSupportContextSnapshot(record)!;
  }

  async listSupportContextSnapshotsByConversationId(conversationId: string): Promise<SupportContextSnapshot[]> {
    const records = await (prisma as any).supportContextSnapshot.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record: any) => mapSupportContextSnapshot(record)!);
  }

  async createSupportHandoff(handoff: SupportHandoff): Promise<SupportHandoff> {
    const record = await (prisma as any).supportHandoff.create({
      data: {
        id: handoff.id,
        conversationId: handoff.conversationId,
        reason: handoff.reason,
        summary: handoff.summary,
        recommendedTeam: handoff.recommendedTeam,
        confidenceScore: handoff.confidenceScore ?? null,
        acceptedByAgentId: handoff.acceptedByAgentId ?? null,
        createdAt: new Date(handoff.createdAt),
      },
    });
    return mapSupportHandoff(record)!;
  }

  async listSupportHandoffsByConversationId(conversationId: string): Promise<SupportHandoff[]> {
    const records = await (prisma as any).supportHandoff.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record: any) => mapSupportHandoff(record)!);
  }

  async createSupportEvent(event: SupportEvent): Promise<SupportEvent> {
    const record = await (prisma as any).supportEvent.create({
      data: {
        id: event.id,
        conversationId: event.conversationId,
        eventType: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId ?? null,
        notes: event.notes ?? null,
        metadata: (event.metadata ?? undefined) as any,
        createdAt: new Date(event.createdAt),
      },
    });
    return mapSupportEvent(record)!;
  }

  async listSupportEventsByConversationId(conversationId: string): Promise<SupportEvent[]> {
    const records = await (prisma as any).supportEvent.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record: any) => mapSupportEvent(record)!);
  }

  async createSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle> {
    const record = await (prisma as any).supportKnowledgeArticle.create({
      data: {
        id: article.id,
        domain: article.domain,
        audience: article.audience,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? null,
        content: article.content,
        tags: article.tags,
        published: article.published,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
      },
    });
    return mapSupportKnowledgeArticle(record)!;
  }

  async updateSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle> {
    const record = await (prisma as any).supportKnowledgeArticle.update({
      where: { id: article.id },
      data: {
        domain: article.domain,
        audience: article.audience,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? null,
        content: article.content,
        tags: article.tags,
        published: article.published,
        updatedAt: new Date(article.updatedAt),
      },
    });
    return mapSupportKnowledgeArticle(record)!;
  }

  async findSupportKnowledgeArticleById(id: string): Promise<SupportKnowledgeArticle | null> {
    return mapSupportKnowledgeArticle(await (prisma as any).supportKnowledgeArticle.findUnique({ where: { id } }));
  }

  async findSupportKnowledgeArticleBySlug(slug: string): Promise<SupportKnowledgeArticle | null> {
    return mapSupportKnowledgeArticle(await (prisma as any).supportKnowledgeArticle.findUnique({ where: { slug } }));
  }

  async listSupportKnowledgeArticles(): Promise<SupportKnowledgeArticle[]> {
    const records = await (prisma as any).supportKnowledgeArticle.findMany({ orderBy: { updatedAt: "desc" } });
    return records.map((record: any) => mapSupportKnowledgeArticle(record)!);
  }
}

export const prismaRepository = new PrismaRepository();
