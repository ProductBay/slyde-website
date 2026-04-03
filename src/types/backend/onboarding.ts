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
  "employee_applicant",
  "employee_user",
  "merchant_interest",
  "merchant_user",
  "public_user",
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

export const supportChannels = ["web_chat", "email", "whatsapp", "phone", "internal_note"] as const;
export const supportDomains = ["public", "merchant", "slyder", "employee", "referrer", "admin"] as const;
export const supportConversationStatuses = ["open", "waiting_on_user", "waiting_on_agent", "resolved", "closed"] as const;
export const supportPriorities = ["low", "normal", "high", "urgent"] as const;
export const supportSenderTypes = ["customer", "agent", "ai", "system"] as const;
export const supportEventTypes = [
  "conversation_created",
  "message_received",
  "message_sent",
  "ai_response_generated",
  "ai_handoff_requested",
  "agent_assigned",
  "status_changed",
  "context_attached",
  "webhook_received",
  "resolved",
  "closed",
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
export type SupportChannel = (typeof supportChannels)[number];
export type SupportDomain = (typeof supportDomains)[number];
export type SupportConversationStatus = (typeof supportConversationStatuses)[number];
export type SupportPriority = (typeof supportPriorities)[number];
export type SupportSenderType = (typeof supportSenderTypes)[number];
export type SupportEventType = (typeof supportEventTypes)[number];
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
  | "merchant_owner"
  | "merchant_manager"
  | "merchant_dispatcher"
  | "merchant_staff"
  | "merchant_viewer"
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
  userType: "platform" | "slyder" | "merchant" | "employee";
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

export const publicSlyderReferralStatuses = [
  "submitted",
  "duplicate_flagged",
  "contact_pending",
  "application_started",
  "application_completed",
  "approved",
  "activated",
  "ready",
  "first_delivery_completed",
  "reward_earned",
  "reward_claimed",
  "reward_gifted",
  "reward_redeemed",
  "expired",
  "disqualified",
] as const;

export const referralRewardStatuses = [
  "earned",
  "claim_pending",
  "claimed_by_referrer",
  "gift_pending",
  "gifted",
  "redeemed",
  "expired",
  "cancelled",
] as const;

export const referralRewardTypes = [
  "DELIVERY_CREDIT_FIXED",
  "DELIVERY_PERCENT_DISCOUNT",
] as const;

export const referrerChallengeChannels = [
  "email",
  "sms",
] as const;

export const referrerInviteEmailStatuses = [
  "pending",
  "queued",
  "sent",
  "delivered",
  "failed",
  "skipped",
] as const;

export type PublicSlyderReferralStatus = (typeof publicSlyderReferralStatuses)[number];
export type ReferralRewardStatus = (typeof referralRewardStatuses)[number];
export type ReferralRewardType = (typeof referralRewardTypes)[number];
export type ReferrerChallengeChannel = (typeof referrerChallengeChannels)[number];
export type ReferrerInviteEmailStatus = (typeof referrerInviteEmailStatuses)[number];

export type ReferrerAccount = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReferrerLoginChallenge = {
  id: string;
  referrerAccountId?: string;
  channel: ReferrerChallengeChannel;
  email?: string;
  phone?: string;
  codeHash: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
};

export type ReferrerSession = {
  id: string;
  referrerAccountId: string;
  createdAt: string;
  expiresAt: string;
};

export type ReferralEvent = {
  id: string;
  referralId: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type PublicSlyderReferral = {
  id: string;
  referralCode: string;
  referrerName: string;
  referrerPhone: string;
  referrerEmail?: string;
  referrerAccountId?: string;
  referredName: string;
  referredEmail?: string;
  referredPhone: string;
  referredParish?: string;
  referredTown?: string;
  referredVehicleType?: string;
  notes?: string;
  status: PublicSlyderReferralStatus;
  statusReason?: string;
  inviteEmailSentAt?: string;
  inviteEmailStatus?: ReferrerInviteEmailStatus;
  applicationStartedAt?: string;
  applicationCompletedAt?: string;
  approvedAt?: string;
  activatedAt?: string;
  readyAt?: string;
  firstDeliveryCompletedAt?: string;
  rewardEarnedAt?: string;
  rewardClaimedAt?: string;
  rewardGiftedAt?: string;
  rewardRedeemedAt?: string;
  linkedSlyderApplicationId?: string;
  linkedSlyderProfileId?: string;
  rewardId?: string;
  duplicateOfReferralId?: string;
  submittedIpHash?: string;
  submittedUserAgent?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReferralReward = {
  id: string;
  publicReferralId: string;
  rewardType: ReferralRewardType;
  rewardValue: number;
  currency: string;
  status: ReferralRewardStatus;
  isTransferable: boolean;
  transferCount: number;
  transferredAt?: string;
  ownerCustomerAccountId?: string;
  ownerPhone?: string;
  giftedToCustomerAccountId?: string;
  giftedToPhone?: string;
  giftedByReferrerPhone?: string;
  minOrderValue?: number;
  expiresAt: string;
  redeemedAt?: string;
  redemptionOrderId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReferralRewardAudit = {
  id: string;
  rewardId: string;
  action: string;
  actorType: string;
  actorId?: string;
  notes?: string;
  createdAt: string;
};

export type PublicReferralSubmissionInput = {
  referrerName: string;
  referrerPhone: string;
  referrerEmail?: string;
  referredName: string;
  referredEmail?: string;
  referredPhone: string;
  referredParish?: string;
  referredTown?: string;
  referredVehicleType?: string;
  notes?: string;
};

export type RewardClaimInput = {
  referralId?: string;
  referralCode?: string;
  customerAccountId: string;
  phone: string;
};

export type RewardGiftInput = {
  referralId?: string;
  referralCode?: string;
  recipientCustomerAccountId: string;
  recipientPhone: string;
};

export type AdminReferralFilters = {
  status?: PublicSlyderReferralStatus;
  parish?: string;
  rewardStatus?: ReferralRewardStatus;
  duplicateFlagged?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type AdminReferralStatusUpdateInput = {
  status: PublicSlyderReferralStatus;
  reason?: string;
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
  relatedEntityType?:
    | "slyder_application"
    | "merchant_interest"
    | "coverage_zone"
    | "slyder_profile"
    | "merchant_account"
    | "employee_application"
    | "employee_profile";
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
  relatedEntityType?:
    | "slyder_application"
    | "merchant_interest"
    | "coverage_zone"
    | "slyder_profile"
    | "merchant_account"
    | "employee_application"
    | "employee_profile";
  relatedEntityId?: string;
  actorType?: NotificationActorType;
  actorId?: string;
  payload?: Record<string, unknown>;
  status: NotificationTriggerStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportConversation = {
  id: string;
  channel: SupportChannel;
  domain: SupportDomain;
  status: SupportConversationStatus;
  priority: SupportPriority;
  subject: string;
  externalProvider?: string;
  externalConversationId?: string;
  externalTicketId?: string;
  userId?: string;
  merchantId?: string;
  slyderProfileId?: string;
  employeeProfileId?: string;
  referrerAccountId?: string;
  assignedTeam?: string;
  assignedAgentId?: string;
  lastMessageAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  conversationId: string;
  senderType: SupportSenderType;
  senderId?: string;
  body: string;
  messageFormat: string;
  externalMessageId?: string;
  aiGenerated: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type SupportContextSnapshot = {
  id: string;
  conversationId: string;
  contextType: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SupportHandoff = {
  id: string;
  conversationId: string;
  reason: string;
  summary: string;
  recommendedTeam: string;
  confidenceScore?: number;
  acceptedByAgentId?: string;
  createdAt: string;
};

export type SupportEvent = {
  id: string;
  conversationId: string;
  eventType: SupportEventType | string;
  actorType: string;
  actorId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type SupportKnowledgeArticle = {
  id: string;
  domain: SupportDomain;
  audience: string[];
  title: string;
  slug: string;
  summary?: string;
  content: string;
  tags: string[];
  published: boolean;
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

export type MerchantProductIntent = "grabquik" | "slyde_delivery" | "both";

export type MerchantLeadStatus = "submitted" | "reviewing" | "qualified" | "rejected";

export type MerchantOnboardingTrack = MerchantProductIntent;

export type MerchantApplicationApprovalStatus = "pending" | "approved" | "rejected";

export type MerchantApplicationActivationStatus = "pending" | "activated" | "live" | "paused";

export type MerchantBusinessLicenseStatus = "missing" | "submitted" | "verified" | "overdue";

export type MerchantDocumentStatus = "not_started" | "pending" | "submitted" | "approved" | "rejected";

export type MerchantLegalStatus = "pending" | "accepted" | "rejected";

export type MerchantDispatchMode = "manual_dashboard" | "whatsapp_assisted" | "api_later";

export type MerchantIntegrationReadiness = "not_started" | "in_progress" | "ready";

export type MerchantTeamRole =
  | "merchant_owner"
  | "merchant_manager"
  | "merchant_dispatcher"
  | "merchant_staff"
  | "merchant_viewer";

export type MerchantTeamMemberStatus = "invited" | "active" | "disabled";

export type MerchantDeliveryStatus =
  | "draft"
  | "submitted"
  | "quoted"
  | "accepted"
  | "rider_assigned"
  | "picked_up"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "failed"
  | "cancelled";

export type MerchantPaymentType = "prepaid" | "cash_on_delivery";

export type MerchantAddressType = "pickup" | "customer" | "branch";

export type MerchantRequestedTiming = "asap" | "scheduled";

export type DeliveryType = "in_parish" | "out_of_parish";

export type FinalFulfillmentMethod =
  | "customer_collection"
  | "partner_final_delivery"
  | "slyde_final_mile";

export type DeliveryLegType = "pickup" | "partner_transfer" | "final_mile" | "collection_ready";

export type DeliveryLegProviderType = "slyde" | "partner";

export type PartnerCarrierType = "branch_network" | "courier" | "express";

export type OutOfParishOverallStatus =
  | "submitted"
  | "pickup_scheduled"
  | "picked_up_by_slyde"
  | "dropped_at_partner"
  | "accepted_by_partner"
  | "in_interparish_transit"
  | "arrived_at_destination_hub"
  | "ready_for_collection"
  | "out_for_final_delivery"
  | "delivered"
  | "failed"
  | "cancelled";

export type DeliveryLegStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "handed_off"
  | "accepted"
  | "in_transit"
  | "arrived"
  | "ready_for_collection"
  | "out_for_delivery"
  | "completed"
  | "failed"
  | "cancelled";

export type MerchantLead = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  parish: string;
  town: string;
  category: string;
  instagramHandle?: string;
  website?: string;
  orderChannels: string[];
  averageDailyOrders?: string;
  currentDeliveryMethod?: string;
  preferredStartTimeline?: string;
  productIntent: MerchantProductIntent;
  status: MerchantLeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantApplication = {
  id: string;
  merchantLeadId: string;
  onboardingTrack: MerchantOnboardingTrack;
  storeName?: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroBannerPosition?: "left" | "center" | "right";
  businessDescription?: string;
  category?: string;
  pickupAddress?: string;
  serviceAreas: string[];
  fulfillmentMode?: string;
  catalogReady?: boolean;
  payoutDetails?: Record<string, unknown>;
  operatingHours?: Record<string, unknown>;
  documentStatus: MerchantDocumentStatus;
  legalStatus: MerchantLegalStatus;
  approvalStatus: MerchantApplicationApprovalStatus;
  activationStatus: MerchantApplicationActivationStatus;
  businessLicenseStatus: MerchantBusinessLicenseStatus;
  businessLicenseNumber?: string;
  businessLicenseSubmittedAt?: string;
  businessLicenseVerifiedAt?: string;
  businessLicenseGraceEndsAt?: string;
  businessLicenseRequiredAfterDeliveries: number;
  businessLicenseDisabledAt?: string;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantIntegrationProfile = {
  id: string;
  merchantApplicationId: string;
  dispatchMode: MerchantDispatchMode;
  acceptsCOD: boolean;
  averageBasketSize?: string;
  packageTypes: string[];
  operatingHours?: Record<string, unknown>;
  orderSources: string[];
  pickupLocations: string[];
  deliveryRadius?: string;
  sameDaySupported: boolean;
  scheduledSupported: boolean;
  integrationReadiness: MerchantIntegrationReadiness;
  createdAt: string;
  updatedAt: string;
};

export type MerchantOnboardingEvent = {
  id: string;
  merchantApplicationId: string;
  eventType: string;
  actorType: string;
  actorId?: string;
  notes?: string;
  createdAt: string;
};

export type MerchantLeadFilters = {
  status?: MerchantLeadStatus;
  parish?: string;
  productIntent?: MerchantProductIntent;
  search?: string;
};

export type MerchantApplicationFilters = {
  approvalStatus?: MerchantApplicationApprovalStatus;
  activationStatus?: MerchantApplicationActivationStatus;
  onboardingTrack?: MerchantOnboardingTrack;
  parish?: string;
  assignedAdminId?: string;
  search?: string;
};

export type MerchantOrder = {
  id: string;
  merchantId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  pickupLocationId?: string;
  pickupAddressSnapshot?: string;
  itemDescription: string;
  packageType: string;
  paymentType: MerchantPaymentType;
  codAmount?: number;
  internalNote?: string;
  riderNote?: string;
  requestedTiming: MerchantRequestedTiming;
  scheduledFor?: string;
  status: MerchantDeliveryStatus;
  createdAt: string;
  updatedAt: string;
};

export type MerchantDelivery = {
  id: string;
  merchantOrderId: string;
  merchantId: string;
  dispatchMode: MerchantDispatchMode;
  deliveryType?: DeliveryType;
  overallOutOfParishStatus?: OutOfParishOverallStatus;
  riderId?: string;
  quoteAmount?: number;
  localPickupFee?: number;
  partnerTransferFee?: number;
  finalMileFee?: number;
  totalFee?: number;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  status: MerchantDeliveryStatus;
  proofOfDeliveryUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantAddress = {
  id: string;
  merchantId: string;
  type: MerchantAddressType;
  label: string;
  contactName: string;
  contactPhone: string;
  addressLine: string;
  parish: string;
  town: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MerchantTeamMember = {
  id: string;
  merchantId: string;
  userId: string;
  role: MerchantTeamRole;
  status: MerchantTeamMemberStatus;
  invitedAt?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantNotificationPreference = {
  id: string;
  merchantId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  notifyOnAssigned: boolean;
  notifyOnDelivered: boolean;
  notifyOnFailed: boolean;
  notifyOnBilling: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MerchantDispatchEvent = {
  id: string;
  merchantDeliveryId: string;
  eventType: string;
  actorType: string;
  actorId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type PartnerCarrier = {
  id: string;
  name: string;
  slug: string;
  type: PartnerCarrierType;
  supportsTracking: boolean;
  supportsApi: boolean;
  supportsFinalDelivery: boolean;
  supportsBranchCollection: boolean;
  active: boolean;
  contactConfig?: Record<string, unknown>;
  trackingConfig?: Record<string, unknown>;
  webhookConfig?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PartnerHandoffLocation = {
  id: string;
  partnerCarrierId: string;
  name: string;
  parish: string;
  town: string;
  addressLine: string;
  openingHours?: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryTransferPlan = {
  id: string;
  merchantDeliveryId: string;
  deliveryType: DeliveryType;
  originParish: string;
  destinationParish: string;
  destinationTown?: string;
  transferPartnerId: string;
  originHandoffLocationId?: string;
  destinationHandoffLocationId?: string;
  finalFulfillmentMethod: FinalFulfillmentMethod;
  packageValue?: number;
  specialHandlingNotes?: string;
  customerTrackingCode: string;
  overallStatus: OutOfParishOverallStatus;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryLeg = {
  id: string;
  merchantDeliveryId: string;
  transferPlanId?: string;
  legSequence: number;
  legType: DeliveryLegType;
  providerType: DeliveryLegProviderType;
  providerId?: string;
  originLabel: string;
  originAddress?: string;
  destinationLabel: string;
  destinationAddress?: string;
  partnerTrackingReference?: string;
  status: DeliveryLegStatus;
  eta?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PartnerTrackingEvent = {
  id: string;
  deliveryLegId: string;
  partnerCarrierId: string;
  externalTrackingReference?: string;
  rawStatus: string;
  normalizedStatus: DeliveryLegStatus | OutOfParishOverallStatus;
  notes?: string;
  eventTimestamp: string;
  createdAt: string;
};

export type MerchantQuickDispatchInput = {
  deliveryType?: DeliveryType;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  pickupLocationId?: string;
  pickupAddress?: string;
  itemDescription: string;
  packageType: string;
  paymentType: MerchantPaymentType;
  codAmount?: number;
  deliveryTiming: MerchantRequestedTiming;
  scheduledFor?: string;
  destinationParish?: string;
  destinationTown?: string;
  transferPartnerId?: string;
  partnerHandoffLocationId?: string;
  finalFulfillmentMethod?: FinalFulfillmentMethod;
  packageValue?: number;
  specialHandlingNotes?: string;
  riderNote?: string;
  internalNote?: string;
};

export type MerchantStructuredDispatchInput = {
  orderNumber?: string;
  savedCustomerAddressId?: string;
  savedPickupLocationId?: string;
  packageCategory: string;
  declaredValue?: number;
  codAmount?: number;
  internalNote?: string;
  riderNote?: string;
  deliveryTiming: MerchantRequestedTiming;
  scheduledFor?: string;
};

export type MerchantOrderListFilters = {
  status?: MerchantDeliveryStatus;
  paymentType?: MerchantPaymentType;
  pickupLocationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type MerchantDeliveriesListFilters = {
  range?: "today" | "last_7_days" | "last_30_days";
  status?: MerchantDeliveryStatus;
  pickupLocationId?: string;
  paymentType?: MerchantPaymentType;
  search?: string;
};

export type MerchantAddressUpsertInput = {
  type: MerchantAddressType;
  label: string;
  contactName: string;
  contactPhone: string;
  addressLine: string;
  parish: string;
  town: string;
  notes?: string;
  isDefault?: boolean;
};

export type MerchantSettingsUpdateInput = {
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  parish?: string;
  town?: string;
  category?: string;
  instagramHandle?: string;
  website?: string;
  orderChannels?: string[];
  averageDailyOrders?: string;
  currentDeliveryMethod?: string;
  preferredStartTimeline?: string;
  storeName?: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroBannerPosition?: "left" | "center" | "right";
  businessDescription?: string;
  pickupAddress?: string;
  serviceAreas?: string[];
  fulfillmentMode?: string;
  operatingHours?: {
    days?: string[];
    openTime?: string;
    closeTime?: string;
    summary?: string;
  };
  businessLicenseNumber?: string;
  defaultPickupLocationId?: string;
  dispatchMode?: MerchantDispatchMode;
  acceptsCOD?: boolean;
  averageBasketSize?: string;
  packageTypes?: string[];
  orderSources?: string[];
  pickupLocations?: string[];
  deliveryRadius?: string;
  sameDaySupported?: boolean;
  scheduledSupported?: boolean;
  defaultDeliveryInstruction?: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  notifyOnAssigned?: boolean;
  notifyOnDelivered?: boolean;
  notifyOnFailed?: boolean;
  notifyOnBilling?: boolean;
};

export type MerchantSupportRequestInput = {
  topic: string;
  priority: "normal" | "urgent";
  message: string;
  relatedOrderId?: string;
  relatedDeliveryId?: string;
};

export type SupportConversationCreateInput = {
  channel: SupportChannel;
  domain: SupportDomain;
  priority?: SupportPriority;
  subject: string;
  externalProvider?: string;
  externalConversationId?: string;
  externalTicketId?: string;
  userId?: string;
  merchantId?: string;
  slyderProfileId?: string;
  employeeProfileId?: string;
  referrerAccountId?: string;
  assignedTeam?: string;
  assignedAgentId?: string;
};

export type SupportReplyInput = {
  conversationId: string;
  senderType: SupportSenderType;
  senderId?: string;
  body: string;
  messageFormat?: string;
  externalMessageId?: string;
  aiGenerated?: boolean;
  metadata?: Record<string, unknown>;
};

export type SupportHandoffInput = {
  conversationId: string;
  reason: string;
  summary: string;
  recommendedTeam: string;
  confidenceScore?: number;
};

export type SupportContextInput = {
  conversationId: string;
  contextType: string;
  payload: Record<string, unknown>;
};

export type SupportWebhookPayload = {
  provider: string;
  eventType: string;
  externalConversationId?: string;
  externalTicketId?: string;
  externalMessageId?: string;
  status?: string;
  priority?: string;
  senderType?: SupportSenderType;
  messageBody?: string;
  occurredAt: string;
  raw: Record<string, unknown>;
};

export type SupportAiRequestInput = {
  conversationId: string;
  domain: SupportDomain;
  userMessage: string;
  userProfile?: {
    userId?: string;
    role?: string;
    fullName?: string;
    email?: string;
  };
  linkedEntities?: {
    merchantId?: string;
    merchantApplicationId?: string;
    deliveryId?: string;
    orderId?: string;
    referralId?: string;
    slyderProfileId?: string;
    employeeProfileId?: string;
  };
  contextSnapshots: Array<{
    type: string;
    payload: Record<string, unknown>;
  }>;
  knowledgeMatches: Array<{
    title: string;
    snippet: string;
    sourceId: string;
  }>;
};

export type SupportAiResponse = {
  action: "answer" | "handoff" | "collect_info";
  answer: string;
  confidence: number;
  missingFields?: string[];
  handoffReason?: string;
  recommendedTeam?: string;
  agentSummary?: string;
};

export type PartnerCarrierInput = {
  name: string;
  slug: string;
  type: PartnerCarrierType;
  supportsTracking?: boolean;
  supportsApi?: boolean;
  supportsFinalDelivery?: boolean;
  supportsBranchCollection?: boolean;
  active?: boolean;
  contactConfig?: Record<string, unknown>;
  trackingConfig?: Record<string, unknown>;
  webhookConfig?: Record<string, unknown>;
};

export type PartnerHandoffLocationInput = {
  partnerCarrierId: string;
  name: string;
  parish: string;
  town: string;
  addressLine: string;
  openingHours?: Record<string, unknown>;
  active?: boolean;
};

export type ManualPartnerTrackingInput = {
  deliveryLegId: string;
  partnerCarrierId: string;
  externalTrackingReference?: string;
  rawStatus: string;
  normalizedStatus: DeliveryLegStatus | OutOfParishOverallStatus;
  notes?: string;
  eventTimestamp?: string;
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
  referrerAccounts: ReferrerAccount[];
  referrerLoginChallenges: ReferrerLoginChallenge[];
  referrerSessions: ReferrerSession[];
  publicSlyderReferrals: PublicSlyderReferral[];
  referralEvents: ReferralEvent[];
  referralRewards: ReferralReward[];
  referralRewardAudits: ReferralRewardAudit[];
  slyderProfiles: SlyderProfile[];
  history: SlyderStatusHistory[];
  activationTokens: ActivationToken[];
  otpChallenges: OtpChallenge[];
  sessions: SessionRecord[];
  notifications: NotificationRecord[];
  notificationTemplates: NotificationTemplate[];
  notificationTriggers: NotificationTriggerEvent[];
  supportConversations: SupportConversation[];
  supportMessages: SupportMessage[];
  supportContextSnapshots: SupportContextSnapshot[];
  supportHandoffs: SupportHandoff[];
  supportEvents: SupportEvent[];
  supportKnowledgeArticles: SupportKnowledgeArticle[];
  coverageZones: CoverageZone[];
  merchantInterests: MerchantInterestRecord[];
  merchantLeads: MerchantLead[];
  merchantApplications: MerchantApplication[];
  merchantIntegrationProfiles: MerchantIntegrationProfile[];
  merchantOnboardingEvents: MerchantOnboardingEvent[];
  merchantOrders: MerchantOrder[];
  merchantDeliveries: MerchantDelivery[];
  merchantAddresses: MerchantAddress[];
  merchantTeamMembers: MerchantTeamMember[];
  merchantNotificationPreferences: MerchantNotificationPreference[];
  merchantDispatchEvents: MerchantDispatchEvent[];
  partnerCarriers: PartnerCarrier[];
  partnerHandoffLocations: PartnerHandoffLocation[];
  deliveryTransferPlans: DeliveryTransferPlan[];
  deliveryLegs: DeliveryLeg[];
  partnerTrackingEvents: PartnerTrackingEvent[];
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
