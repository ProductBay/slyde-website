export const applicationStatuses = [
  "submitted",
  "under_review",
  "documents_pending",
  "interview_pending",
  "approved",
  "rejected",
] as const;

export const accountStatuses = [
  "not_created",
  "invited",
  "activation_pending",
  "active",
  "suspended",
  "disabled",
] as const;

export const operationalStatuses = [
  "inactive",
  "eligible",
  "waiting_for_zone",
  "live_enabled",
  "suspended",
  "setup_incomplete",
  "readiness_pending",
  "training_pending",
  "eligible_offline",
  "eligible_online",
  "blocked",
] as const;

export const readinessStatuses = [
  "not_started",
  "pending",
  "failed",
  "passed",
] as const;

export const onboardingStatuses = [
  "application_received",
  "invited",
  "activation_pending",
  "contract_pending",
  "setup_incomplete",
  "readiness_pending",
  "setup_completed",
  "eligible_offline",
  "eligible_online",
  "blocked",
  "ready_for_dispatch",
] as const;

export const documentVerificationStatuses = [
  "uploaded",
  "pending",
  "approved",
  "rejected",
  "reupload_requested",
] as const;

export const documentTypes = [
  "national_id",
  "drivers_license",
  "registration",
  "insurance",
  "fitness",
  "profile_photo",
  "other",
] as const;

export const notificationStatuses = [
  "pending",
  "queued",
  "sent",
  "delivered",
  "failed",
  "skipped",
  "confirmed",
  "canceled",
] as const;

export const notificationActorTypes = [
  "slyder_applicant",
  "slyder_user",
  "merchant_interest",
  "merchant_user",
  "admin_user",
  "system_internal",
] as const;

export const notificationChannels = [
  "whatsapp",
  "email",
  "sms",
  "internal",
] as const;

export const notificationTriggerStatuses = [
  "received",
  "processed",
  "partially_processed",
  "failed",
] as const;

export const launchStatuses = [
  "not_ready",
  "building",
  "near_ready",
  "ready",
  "live",
  "paused",
] as const;

export const legalDocumentTypes = [
  "slyder_privacy_notice",
  "slyder_onboarding_terms",
  "slyder_activation_terms",
  "slyder_independent_contractor_terms",
  "merchant_privacy_notice",
  "merchant_interest_terms",
  "merchant_platform_terms",
  "merchant_operations_terms",
  "website_privacy_policy",
  "website_terms_of_use",
  "cookie_notice",
  "other",
] as const;

export const legalDocumentCategories = [
  "slyder",
  "merchant",
  "global",
] as const;

export const legalActorTypes = [
  "slyder_applicant",
  "slyder_user",
  "merchant_interest",
  "merchant_user",
  "public_user",
  "admin_user",
] as const;

export const acceptanceSources = [
  "website_form",
  "onboarding_portal",
  "activation_flow",
  "admin_created",
  "api",
] as const;

export const legalDocumentStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export const legalPublishActions = [
  "created",
  "updated",
  "published",
  "unpublished",
  "archived",
  "activated",
  "deactivated",
] as const;

export const courierTypes = [
  "bicycle",
  "motorcycle",
  "car",
  "van",
  "walker",
  "other",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];
export type AccountStatus = (typeof accountStatuses)[number];
export type OperationalStatus = (typeof operationalStatuses)[number];
export type ReadinessStatus = (typeof readinessStatuses)[number];
export type OnboardingStatus = (typeof onboardingStatuses)[number];
export type DocumentVerificationStatus = (typeof documentVerificationStatuses)[number];
export type DocumentType = (typeof documentTypes)[number];
export type CourierType = (typeof courierTypes)[number];
export type NotificationStatus = (typeof notificationStatuses)[number];
export type NotificationActorType = (typeof notificationActorTypes)[number];
export type NotificationChannel = (typeof notificationChannels)[number];
export type NotificationTriggerStatus = (typeof notificationTriggerStatuses)[number];
export type LaunchStatus = (typeof launchStatuses)[number];
export type LegalDocumentType = (typeof legalDocumentTypes)[number];
export type LegalDocumentCategoryKey = (typeof legalDocumentCategories)[number];
export type LegalActorType = (typeof legalActorTypes)[number];
export type AcceptanceSource = (typeof acceptanceSources)[number];
export type LegalDocumentStatus = (typeof legalDocumentStatuses)[number];
export type LegalPublishAction = (typeof legalPublishActions)[number];

export type UserRoleCode =
  | "platform_admin"
  | "operations_admin"
  | "slyder"
  | "employee_staff"
  | "employee_logistics"
  | "employee_supervisor"
  | "employee_manager"
  | "employee_hr"
  | "employee_payroll";

export type StoredUser = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash?: string;
  roles: UserRoleCode[];
  userType: "platform" | "slyder" | "employee";
  accountStatus: AccountStatus;
  isEnabled: boolean;
  activationIssuedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReferralAttribution = {
  referralCode?: string;
  inviteToken?: string;
  referralSource?: "code" | "invite_link" | "none";
  capturedAt?: string;
  landingPage?: string;
};

export type SlyderApplication = {
  id: string;
  applicationCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  parish: string;
  address: string;
  trn: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  courierType: CourierType;
  workTypePreference: string;
  availability: string;
  preferredZones: string[];
  deliveryTypePreferences: string[];
  maxTravelComfort: string;
  peakHours: string;
  smartphoneType: string;
  whatsappNumber: string;
  gpsConfirmed: boolean;
  internetConfirmed: boolean;
  readinessAnswers: Record<string, unknown>;
  agreementsAccepted: Record<string, boolean>;
  referralAttribution?: ReferralAttribution;
  applicationStatus: ApplicationStatus;
  accountStatus: AccountStatus;
  operationalStatus: OperationalStatus;
  readinessStatus: ReadinessStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  requestedDocumentNotes?: string;
  requestedDocumentTypes?: DocumentType[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  linkedUserId?: string;
  linkedSlyderProfileId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SlyderApplicationVehicle = {
  id: string;
  applicationId: string;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  plateNumber?: string;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  createdAt: string;
  updatedAt: string;
};

export type SlyderApplicationDocument = {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileUrl: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

export type SlyderProfile = {
  id: string;
  userId: string;
  applicationId: string;
  coverageZoneId?: string;
  displayName: string;
  phone: string;
  email: string;
  courierType: CourierType;
  onboardingStatus: OnboardingStatus;
  readinessStatus: ReadinessStatus;
  operationalStatus: OperationalStatus;
  accountStatus: AccountStatus;
  contractAccepted: boolean;
  contractAcceptedAt?: string;
  vehicleVerified: boolean;
  payoutSetupComplete: boolean;
  profileComplete: boolean;
  trainingComplete: boolean;
  permissionsComplete: boolean;
  requiredAgreementsAccepted: boolean;
  setupCompletedAt?: string;
  trainingAcknowledgedAt?: string;
  activatedAt?: string;
  canGoOnline: boolean;
  canReceiveOrders: boolean;
  readinessChecklist?: {
    profileConfirmed: boolean;
    vehicleConfirmed: boolean;
    payoutConfigured: boolean;
    legalAccepted: boolean;
    locationPermissionConfirmed: boolean;
    notificationPermissionConfirmed: boolean;
    equipmentConfirmed: boolean;
    trainingAcknowledged: boolean;
    emergencyContactConfirmed: boolean;
    overallStatus: "not_started" | "pending" | "passed" | "failed";
    createdAt: string;
    updatedAt: string;
  };
  approvedAt: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type SlyderStatusHistory = {
  id: string;
  entityType: "application" | "user" | "slyder_profile";
  entityId: string;
  eventType: string;
  actorUserId?: string;
  actorLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ActivationToken = {
  id: string;
  userId: string;
  tokenHash: string;
  deliveryChannel: "email" | "sms" | "whatsapp";
  status?: "issued" | "used" | "expired" | "revoked";
  issuedAt?: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type OtpChallenge = {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  roles: UserRoleCode[];
  createdAt: string;
  expiresAt: string;
};

export type NotificationTemplate = {
  id: string;
  key: string;
  name: string;
  actorType: NotificationActorType;
  eventType: string;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  plainTextTemplate?: string;
  isActive: boolean;
  version: string;
  locale?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationRecord = {
  id: string;
  templateId?: string;
  templateKey?: string;
  triggerEventId?: string;
  triggerEventKey?: string;
  dedupeKey?: string;
  actorType?: NotificationActorType;
  actorId?: string;
  relatedEntityType?: "slyder_application" | "merchant_interest" | "coverage_zone" | "slyder_profile" | "merchant_account";
  relatedEntityId?: string;
  userId?: string;
  applicationId?: string;
  slyderProfileId?: string;
  channel: NotificationChannel;
  template: string;
  recipient?: string;
  recipientName?: string;
  status?: NotificationStatus;
  providerName?: string;
  providerMessageId?: string;
  subjectSnapshot?: string;
  bodySnapshot?: string;
  variablesSnapshot?: Record<string, unknown>;
  failureReason?: string;
  resentFromId?: string;
  retryCount?: number;
  lastAttemptAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdBySystem?: boolean;
  triggeredByUserId?: string;
  metadata?: Record<string, unknown>;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationTriggerEvent = {
  id: string;
  eventKey: string;
  relatedEntityType?: "slyder_application" | "merchant_interest" | "coverage_zone" | "slyder_profile" | "merchant_account";
  relatedEntityId?: string;
  actorType?: NotificationActorType;
  actorId?: string;
  payload?: Record<string, unknown>;
  status: NotificationTriggerStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type CoverageZone = {
  id: string;
  name: string;
  parish: string;
  requiredReadySlyders: number;
  merchantAvailability: "closed" | "waitlist" | "open";
  estimatedLaunchLabel: string;
  isLive: boolean;
  isPaused: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type LegalDocument = {
  id: string;
  documentType: LegalDocumentType;
  categoryKey: LegalDocumentCategoryKey;
  actorScopes: LegalActorType[];
  requiresAcceptance: boolean;
  version: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  summary?: string;
  excerpt?: string;
  status: LegalDocumentStatus;
  isActive: boolean;
  effectiveFrom?: string;
  publishedAt?: string;
  archivedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type LegalAcceptance = {
  id: string;
  actorType: LegalActorType;
  actorId: string;
  documentId: string;
  documentType: LegalDocumentType;
  documentTitleSnapshot: string;
  documentVersion: string;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
  acceptanceSource: AcceptanceSource;
  checkboxLabelSnapshot?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type LegalDocumentPublishHistory = {
  id: string;
  legalDocumentId: string;
  action: LegalPublishAction;
  note?: string;
  actedBy?: string;
  createdAt: string;
};

export type MerchantInterestRecord = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  businessType: string;
  deliveryVolume: string;
  coverageNeeds: string;
  goals: string;
  parish?: string;
  town?: string;
  zoneId?: string;
  zoneName?: string;
  operationalNotes?: string;
  lifecycleStatus: "submitted" | "waitlisted" | "reviewing" | "invited_to_onboarding" | "activated" | "declined";
  linkedMerchantUserId?: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeDepartmentCode =
  | "logistics"
  | "operations"
  | "support"
  | "finance"
  | "hr"
  | "leadership";

export type EmployeeEmploymentType = "full_time" | "part_time" | "contract";

export type EmployeeApplicationStatus = "submitted" | "under_review" | "interview" | "approved" | "rejected";

export type EmployeeGuideAudience =
  | "all_employees"
  | "logistics"
  | "operations"
  | "support"
  | "supervisors"
  | "managers";

export type EmployeeGuideCategory = "handbook" | "operations" | "compliance" | "pay" | "announcements";

export type EmployeeApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleInterest: string;
  departmentInterest: EmployeeDepartmentCode;
  employmentType: EmployeeEmploymentType;
  location: string;
  experienceSummary: string;
  managerTrackInterest?: boolean;
  resumeUrl?: string;
  notes?: string;
  status: EmployeeApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  linkedUserId?: string;
  linkedEmployeeProfileId?: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeProfile = {
  id: string;
  userId: string;
  employeeCode: string;
  displayName: string;
  department: EmployeeDepartmentCode;
  title: string;
  employmentType: EmployeeEmploymentType;
  managerUserId?: string;
  startDate: string;
  locationLabel: string;
  payrollFrequency: "weekly" | "biweekly" | "monthly";
  payoutMethod: "bank_transfer" | "cash_pickup" | "mobile_wallet";
  payoutAccountMasked?: string;
  isOnboarded: boolean;
  onboardingCompletedAt?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeAnnouncement = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  audience: EmployeeGuideAudience[];
  publishedByUserId?: string;
  priority: "normal" | "important" | "critical";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeGuide = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: EmployeeGuideCategory;
  audience: EmployeeGuideAudience[];
  contentMarkdown: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeGuideAcknowledgement = {
  id: string;
  guideId: string;
  employeeProfileId: string;
  acknowledgedAt: string;
  createdAt: string;
};

export type EmployeePayrollRecord = {
  id: string;
  employeeProfileId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossAmount: number;
  deductionsAmount: number;
  netAmount: number;
  status: "scheduled" | "processed" | "paid";
  payDate: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeePayoutRecord = {
  id: string;
  employeeProfileId: string;
  sourceLabel: string;
  amount: number;
  status: "scheduled" | "sent" | "received";
  payoutDate: string;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingStore = {
  users: StoredUser[];
  applications: SlyderApplication[];
  vehicles: SlyderApplicationVehicle[];
  documents: SlyderApplicationDocument[];
  slyderProfiles: SlyderProfile[];
  history: SlyderStatusHistory[];
  activationTokens: ActivationToken[];
  otpChallenges: OtpChallenge[];
  sessions: SessionRecord[];
  notifications: NotificationRecord[];
  notificationTemplates: NotificationTemplate[];
  notificationTriggers: NotificationTriggerEvent[];
  coverageZones: CoverageZone[];
  merchantInterests: MerchantInterestRecord[];
  legalDocuments: LegalDocument[];
  legalAcceptances: LegalAcceptance[];
  legalPublishHistory: LegalDocumentPublishHistory[];
  employeeApplications: EmployeeApplication[];
  employeeProfiles: EmployeeProfile[];
  employeeAnnouncements: EmployeeAnnouncement[];
  employeeGuides: EmployeeGuide[];
  employeeGuideAcknowledgements: EmployeeGuideAcknowledgement[];
  employeePayrollRecords: EmployeePayrollRecord[];
  employeePayoutRecords: EmployeePayoutRecord[];
};

export type SetupStatusResponse = {
  profileComplete: boolean;
  contractAccepted: boolean;
  contractAcceptedAt?: string;
  payoutSetupComplete: boolean;
  trainingComplete: boolean;
  permissionsComplete: boolean;
  vehicleVerified: boolean;
  requiredDocumentsApproved: boolean;
  requiredAgreementsAccepted: boolean;
  accountStatus: AccountStatus;
  onboardingStatus: OnboardingStatus;
  readinessStatus: ReadinessStatus;
  operationalStatus: OperationalStatus;
  canGoOnline: boolean;
  canReceiveOrders: boolean;
  activationCompleted: boolean;
  activatedAt?: string;
  setupCompletedAt?: string;
  trainingAcknowledgedAt?: string;
  coverageZoneId?: string;
  zoneStatus?: LaunchStatus;
  zoneName?: string;
  eligibilityState: "eligible_online" | "eligible_offline" | "setup_incomplete" | "blocked";
  readinessChecklist: {
    profileConfirmed: boolean;
    vehicleConfirmed: boolean;
    payoutConfigured: boolean;
    legalAccepted: boolean;
    locationPermissionConfirmed: boolean;
    notificationPermissionConfirmed: boolean;
    equipmentConfirmed: boolean;
    trainingAcknowledged: boolean;
    emergencyContactConfirmed: boolean;
    overallStatus: "not_started" | "pending" | "passed" | "failed";
  };
  pendingLegalDocuments?: Array<{
    id: string;
    title: string;
    slug: string;
    version: string;
    documentType: LegalDocumentType;
  }>;
  remainingSteps: string[];
};
