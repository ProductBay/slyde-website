-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('submitted', 'under_review', 'documents_pending', 'interview_pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('not_created', 'invited', 'activation_pending', 'active', 'suspended', 'disabled');

-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('inactive', 'eligible', 'waiting_for_zone', 'live_enabled', 'suspended', 'setup_incomplete', 'readiness_pending', 'training_pending', 'eligible_offline', 'eligible_online', 'blocked');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('not_started', 'pending', 'failed', 'passed');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('application_received', 'invited', 'activation_pending', 'contract_pending', 'setup_incomplete', 'readiness_pending', 'setup_completed', 'eligible_offline', 'eligible_online', 'blocked', 'ready_for_dispatch');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('uploaded', 'pending', 'approved', 'rejected', 'reupload_requested');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('national_id', 'drivers_license', 'registration', 'insurance', 'fitness', 'profile_photo', 'other');

-- CreateEnum
CREATE TYPE "CourierType" AS ENUM ('bicycle', 'motorcycle', 'car', 'van', 'walker', 'other');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'queued', 'sent', 'delivered', 'failed', 'skipped', 'confirmed', 'canceled');

-- CreateEnum
CREATE TYPE "NotificationActorType" AS ENUM ('slyder_applicant', 'slyder_user', 'employee_applicant', 'employee_user', 'merchant_interest', 'merchant_user', 'public_user', 'admin_user', 'system_internal');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('whatsapp', 'email', 'sms', 'internal');

-- CreateEnum
CREATE TYPE "NotificationTriggerStatus" AS ENUM ('received', 'processed', 'partially_processed', 'failed');

-- CreateEnum
CREATE TYPE "SupportChannel" AS ENUM ('web_chat', 'email', 'whatsapp', 'phone', 'internal_note');

-- CreateEnum
CREATE TYPE "SupportDomain" AS ENUM ('public', 'merchant', 'slyder', 'employee', 'referrer', 'admin');

-- CreateEnum
CREATE TYPE "SupportConversationStatus" AS ENUM ('open', 'waiting_on_user', 'waiting_on_agent', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "SupportSenderType" AS ENUM ('customer', 'agent', 'ai', 'system');

-- CreateEnum
CREATE TYPE "SupportEventType" AS ENUM ('conversation_created', 'message_received', 'message_sent', 'ai_response_generated', 'ai_handoff_requested', 'agent_assigned', 'status_changed', 'context_attached', 'webhook_received', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "LaunchStatus" AS ENUM ('not_ready', 'building', 'near_ready', 'ready', 'live', 'paused');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('slyder_privacy_notice', 'slyder_onboarding_terms', 'slyder_activation_terms', 'slyder_independent_contractor_terms', 'merchant_privacy_notice', 'merchant_interest_terms', 'merchant_platform_terms', 'merchant_operations_terms', 'website_privacy_policy', 'website_terms_of_use', 'cookie_notice', 'other');

-- CreateEnum
CREATE TYPE "LegalDocumentCategoryKey" AS ENUM ('slyder', 'merchant', 'global');

-- CreateEnum
CREATE TYPE "LegalActorType" AS ENUM ('slyder_applicant', 'slyder_user', 'merchant_interest', 'merchant_user', 'public_user', 'admin_user');

-- CreateEnum
CREATE TYPE "AcceptanceSource" AS ENUM ('website_form', 'onboarding_portal', 'activation_flow', 'admin_created', 'api');

-- CreateEnum
CREATE TYPE "LegalDocumentStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "LegalPublishAction" AS ENUM ('created', 'updated', 'published', 'unpublished', 'archived', 'activated', 'deactivated');

-- CreateEnum
CREATE TYPE "UserRoleCode" AS ENUM ('platform_admin', 'operations_admin', 'slyder', 'merchant_owner', 'merchant_manager', 'merchant_dispatcher', 'merchant_staff', 'merchant_viewer', 'employee_staff', 'employee_logistics', 'employee_supervisor', 'employee_manager', 'employee_hr', 'employee_payroll');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('platform', 'slyder', 'merchant', 'employee');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('application', 'user', 'slyder_profile');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('email', 'sms', 'whatsapp');

-- CreateEnum
CREATE TYPE "ActivationTokenStatus" AS ENUM ('issued', 'used', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "RelatedEntityType" AS ENUM ('slyder_application', 'merchant_interest', 'coverage_zone', 'slyder_profile', 'merchant_account', 'employee_application', 'employee_profile');

-- CreateEnum
CREATE TYPE "MerchantAvailability" AS ENUM ('closed', 'waitlist', 'open');

-- CreateEnum
CREATE TYPE "MerchantLifecycleStatus" AS ENUM ('submitted', 'waitlisted', 'reviewing', 'invited_to_onboarding', 'activated', 'declined');

-- CreateEnum
CREATE TYPE "MerchantProductIntent" AS ENUM ('grabquik', 'slyde_delivery', 'both');

-- CreateEnum
CREATE TYPE "MerchantLeadStatus" AS ENUM ('submitted', 'reviewing', 'qualified', 'rejected');

-- CreateEnum
CREATE TYPE "MerchantOnboardingTrack" AS ENUM ('grabquik', 'slyde_delivery', 'both');

-- CreateEnum
CREATE TYPE "MerchantApplicationApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "MerchantApplicationActivationStatus" AS ENUM ('pending', 'activated', 'live', 'paused');

-- CreateEnum
CREATE TYPE "MerchantBusinessLicenseStatus" AS ENUM ('missing', 'submitted', 'verified', 'overdue');

-- CreateEnum
CREATE TYPE "MerchantDocumentStatus" AS ENUM ('not_started', 'pending', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "MerchantLegalStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "MerchantDispatchMode" AS ENUM ('manual_dashboard', 'whatsapp_assisted', 'api_later');

-- CreateEnum
CREATE TYPE "MerchantIntegrationReadiness" AS ENUM ('not_started', 'in_progress', 'ready');

-- CreateEnum
CREATE TYPE "MerchantDeliveryStatus" AS ENUM ('draft', 'submitted', 'quoted', 'accepted', 'rider_assigned', 'picked_up', 'in_transit', 'arrived', 'delivered', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "MerchantPaymentType" AS ENUM ('prepaid', 'cash_on_delivery');

-- CreateEnum
CREATE TYPE "MerchantAddressType" AS ENUM ('pickup', 'customer', 'branch');

-- CreateEnum
CREATE TYPE "MerchantRequestedTiming" AS ENUM ('asap', 'scheduled');

-- CreateEnum
CREATE TYPE "MerchantTeamMemberStatus" AS ENUM ('invited', 'active', 'disabled');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('in_parish', 'out_of_parish');

-- CreateEnum
CREATE TYPE "FinalFulfillmentMethod" AS ENUM ('customer_collection', 'partner_final_delivery', 'slyde_final_mile');

-- CreateEnum
CREATE TYPE "DeliveryLegType" AS ENUM ('pickup', 'partner_transfer', 'final_mile', 'collection_ready');

-- CreateEnum
CREATE TYPE "DeliveryLegProviderType" AS ENUM ('slyde', 'partner');

-- CreateEnum
CREATE TYPE "PartnerCarrierType" AS ENUM ('branch_network', 'courier', 'express');

-- CreateEnum
CREATE TYPE "OutOfParishOverallStatus" AS ENUM ('submitted', 'pickup_scheduled', 'picked_up_by_slyde', 'dropped_at_partner', 'accepted_by_partner', 'in_interparish_transit', 'arrived_at_destination_hub', 'ready_for_collection', 'out_for_final_delivery', 'delivered', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "DeliveryLegStatus" AS ENUM ('pending', 'scheduled', 'in_progress', 'handed_off', 'accepted', 'in_transit', 'arrived', 'ready_for_collection', 'out_for_delivery', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "EmployeeDepartmentCode" AS ENUM ('logistics', 'operations', 'support', 'finance', 'hr', 'leadership');

-- CreateEnum
CREATE TYPE "EmployeeEmploymentType" AS ENUM ('full_time', 'part_time', 'contract');

-- CreateEnum
CREATE TYPE "EmployeeApplicationStatus" AS ENUM ('submitted', 'under_review', 'interview', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "EmployeePayrollFrequency" AS ENUM ('weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "EmployeePayoutMethod" AS ENUM ('bank_transfer', 'cash_pickup', 'mobile_wallet');

-- CreateEnum
CREATE TYPE "EmployeeAnnouncementPriority" AS ENUM ('normal', 'important', 'critical');

-- CreateEnum
CREATE TYPE "EmployeeGuideAudience" AS ENUM ('all_employees', 'logistics', 'operations', 'support', 'supervisors', 'managers');

-- CreateEnum
CREATE TYPE "EmployeeGuideCategory" AS ENUM ('handbook', 'operations', 'compliance', 'pay', 'announcements');

-- CreateEnum
CREATE TYPE "EmployeePayrollRecordStatus" AS ENUM ('scheduled', 'processed', 'paid');

-- CreateEnum
CREATE TYPE "EmployeePayoutRecordStatus" AS ENUM ('scheduled', 'sent', 'received');

-- CreateEnum
CREATE TYPE "ReferrerChallengeChannel" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "ReferrerInviteEmailStatus" AS ENUM ('pending', 'queued', 'sent', 'delivered', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "ResidentialIntakeStatus" AS ENUM ('submitted', 'contacted', 'handed_off', 'failed');

-- CreateEnum
CREATE TYPE "ResidentialHandoffState" AS ENUM ('queued', 'sent', 'acknowledged', 'retrying', 'dead_letter');

-- CreateEnum
CREATE TYPE "ResidentialParcelCategory" AS ENUM ('documents', 'small_package', 'medium_package', 'large_package', 'fragile', 'food', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "roles" "UserRoleCode"[],
    "userType" "UserType" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "activationIssuedAt" TIMESTAMPTZ(6),
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlyderApplication" (
    "id" UUID NOT NULL,
    "applicationCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "parish" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "trn" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "courierType" "CourierType" NOT NULL,
    "workTypePreference" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "preferredZones" TEXT[],
    "deliveryTypePreferences" TEXT[],
    "maxTravelComfort" TEXT NOT NULL,
    "peakHours" TEXT NOT NULL,
    "smartphoneType" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "gpsConfirmed" BOOLEAN NOT NULL,
    "internetConfirmed" BOOLEAN NOT NULL,
    "readinessAnswers" JSONB NOT NULL,
    "agreementsAccepted" JSONB NOT NULL,
    "applicationStatus" "ApplicationStatus" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,
    "operationalStatus" "OperationalStatus" NOT NULL,
    "readinessStatus" "ReadinessStatus" NOT NULL,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "requestedDocumentNotes" TEXT,
    "requestedDocumentTypes" "DocumentType"[],
    "submittedAt" TIMESTAMPTZ(6) NOT NULL,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedBy" UUID,
    "linkedUserId" UUID,
    "linkedSlyderProfileId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SlyderApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlyderApplicationVehicle" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" TEXT,
    "color" TEXT,
    "plateNumber" TEXT,
    "registrationExpiry" DATE,
    "insuranceExpiry" DATE,
    "fitnessExpiry" DATE,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SlyderApplicationVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlyderApplicationDocument" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL,
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMPTZ(6) NOT NULL,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedBy" UUID,

    CONSTRAINT "SlyderApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlyderProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "coverageZoneId" UUID,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "courierType" "CourierType" NOT NULL,
    "onboardingStatus" "OnboardingStatus" NOT NULL,
    "readinessStatus" "ReadinessStatus" NOT NULL,
    "operationalStatus" "OperationalStatus" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,
    "contractAccepted" BOOLEAN NOT NULL,
    "contractAcceptedAt" TIMESTAMPTZ(6),
    "vehicleVerified" BOOLEAN NOT NULL,
    "payoutSetupComplete" BOOLEAN NOT NULL,
    "profileComplete" BOOLEAN NOT NULL,
    "trainingComplete" BOOLEAN NOT NULL,
    "permissionsComplete" BOOLEAN NOT NULL,
    "requiredAgreementsAccepted" BOOLEAN NOT NULL,
    "setupCompletedAt" TIMESTAMPTZ(6),
    "trainingAcknowledgedAt" TIMESTAMPTZ(6),
    "activatedAt" TIMESTAMPTZ(6),
    "canGoOnline" BOOLEAN NOT NULL,
    "canReceiveOrders" BOOLEAN NOT NULL,
    "profileConfirmed" BOOLEAN NOT NULL,
    "vehicleConfirmed" BOOLEAN NOT NULL,
    "payoutConfigured" BOOLEAN NOT NULL,
    "legalAccepted" BOOLEAN NOT NULL,
    "locationPermissionConfirmed" BOOLEAN NOT NULL,
    "notificationPermissionConfirmed" BOOLEAN NOT NULL,
    "equipmentConfirmed" BOOLEAN NOT NULL,
    "trainingAcknowledged" BOOLEAN NOT NULL,
    "emergencyContactConfirmed" BOOLEAN NOT NULL,
    "readinessChecklistStatus" "ReadinessStatus" NOT NULL,
    "readinessChecklistCreatedAt" TIMESTAMPTZ(6),
    "readinessChecklistUpdatedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6) NOT NULL,
    "approvedBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SlyderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" UUID NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" UUID,
    "actorLabel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivationToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deliveryChannel" "DeliveryChannel" NOT NULL,
    "status" "ActivationTokenStatus" NOT NULL,
    "issuedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "ActivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roles" "UserRoleCode"[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SessionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actorType" "NotificationActorType" NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "plainTextTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "locale" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTriggerEvent" (
    "id" UUID NOT NULL,
    "eventKey" TEXT NOT NULL,
    "relatedEntityType" "RelatedEntityType",
    "relatedEntityId" UUID,
    "actorType" "NotificationActorType",
    "actorId" UUID,
    "payload" JSONB,
    "status" "NotificationTriggerStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NotificationTriggerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecord" (
    "id" UUID NOT NULL,
    "templateId" UUID,
    "templateKey" TEXT,
    "triggerEventId" UUID,
    "triggerEventKey" TEXT,
    "dedupeKey" TEXT,
    "actorType" "NotificationActorType",
    "actorId" UUID,
    "relatedEntityType" "RelatedEntityType",
    "relatedEntityId" UUID,
    "userId" UUID,
    "applicationId" UUID,
    "slyderProfileId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "recipient" TEXT,
    "recipientName" TEXT,
    "status" "NotificationStatus",
    "providerName" TEXT,
    "providerMessageId" TEXT,
    "subjectSnapshot" TEXT,
    "bodySnapshot" TEXT,
    "variablesSnapshot" JSONB,
    "failureReason" TEXT,
    "resentFromId" UUID,
    "retryCount" INTEGER,
    "lastAttemptAt" TIMESTAMPTZ(6),
    "sentAt" TIMESTAMPTZ(6),
    "deliveredAt" TIMESTAMPTZ(6),
    "createdBySystem" BOOLEAN,
    "triggeredByUserId" UUID,
    "metadata" JSONB,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "NotificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportConversation" (
    "id" UUID NOT NULL,
    "channel" "SupportChannel" NOT NULL,
    "domain" "SupportDomain" NOT NULL,
    "status" "SupportConversationStatus" NOT NULL,
    "priority" "SupportPriority" NOT NULL,
    "subject" TEXT NOT NULL,
    "externalProvider" TEXT,
    "externalConversationId" TEXT,
    "externalTicketId" TEXT,
    "userId" UUID,
    "merchantId" UUID,
    "slyderProfileId" UUID,
    "employeeProfileId" UUID,
    "referrerAccountId" TEXT,
    "assignedTeam" TEXT,
    "assignedAgentId" UUID,
    "lastMessageAt" TIMESTAMPTZ(6),
    "resolvedAt" TIMESTAMPTZ(6),
    "closedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderType" "SupportSenderType" NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "messageFormat" TEXT NOT NULL,
    "externalMessageId" TEXT,
    "aiGenerated" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportContextSnapshot" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "contextType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportContextSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportHandoff" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendedTeam" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "acceptedByAgentId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportHandoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportEvent" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "eventType" "SupportEventType" NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportKnowledgeArticle" (
    "id" UUID NOT NULL,
    "domain" "SupportDomain" NOT NULL,
    "audience" TEXT[],
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "published" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupportKnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageZone" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "requiredReadySlyders" INTEGER NOT NULL,
    "merchantAvailability" "MerchantAvailability" NOT NULL,
    "estimatedLaunchLabel" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL,
    "isPaused" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CoverageZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantInterest" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "businessType" TEXT NOT NULL,
    "deliveryVolume" TEXT NOT NULL,
    "coverageNeeds" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "parish" TEXT,
    "town" TEXT,
    "zoneId" UUID,
    "zoneName" TEXT,
    "operationalNotes" TEXT,
    "lifecycleStatus" "MerchantLifecycleStatus" NOT NULL,
    "linkedMerchantUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantLead" (
    "id" UUID NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "website" TEXT,
    "orderChannels" JSONB NOT NULL,
    "averageDailyOrders" TEXT,
    "currentDeliveryMethod" TEXT,
    "preferredStartTimeline" TEXT,
    "productIntent" "MerchantProductIntent" NOT NULL,
    "status" "MerchantLeadStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantApplication" (
    "id" UUID NOT NULL,
    "merchantLeadId" UUID NOT NULL,
    "onboardingTrack" "MerchantOnboardingTrack" NOT NULL,
    "storeName" TEXT,
    "logoUrl" TEXT,
    "heroBannerUrl" TEXT,
    "heroBannerPosition" TEXT,
    "businessDescription" TEXT,
    "category" TEXT,
    "pickupAddress" TEXT,
    "serviceAreas" JSONB NOT NULL,
    "fulfillmentMode" TEXT,
    "catalogReady" BOOLEAN,
    "payoutDetails" JSONB,
    "operatingHours" JSONB,
    "documentStatus" "MerchantDocumentStatus" NOT NULL,
    "legalStatus" "MerchantLegalStatus" NOT NULL,
    "approvalStatus" "MerchantApplicationApprovalStatus" NOT NULL,
    "activationStatus" "MerchantApplicationActivationStatus" NOT NULL,
    "businessLicenseStatus" "MerchantBusinessLicenseStatus" NOT NULL DEFAULT 'missing',
    "businessLicenseNumber" TEXT,
    "businessLicenseSubmittedAt" TIMESTAMPTZ(6),
    "businessLicenseVerifiedAt" TIMESTAMPTZ(6),
    "businessLicenseGraceEndsAt" TIMESTAMPTZ(6),
    "businessLicenseRequiredAfterDeliveries" INTEGER NOT NULL DEFAULT 10,
    "businessLicenseDisabledAt" TIMESTAMPTZ(6),
    "assignedAdminId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantIntegrationProfile" (
    "id" UUID NOT NULL,
    "merchantApplicationId" UUID NOT NULL,
    "dispatchMode" "MerchantDispatchMode" NOT NULL,
    "acceptsCOD" BOOLEAN NOT NULL,
    "averageBasketSize" TEXT,
    "packageTypes" JSONB NOT NULL,
    "operatingHours" JSONB,
    "orderSources" JSONB NOT NULL,
    "pickupLocations" JSONB NOT NULL,
    "deliveryRadius" TEXT,
    "sameDaySupported" BOOLEAN NOT NULL,
    "scheduledSupported" BOOLEAN NOT NULL,
    "integrationReadiness" "MerchantIntegrationReadiness" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantIntegrationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantOnboardingEvent" (
    "id" UUID NOT NULL,
    "merchantApplicationId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantOnboardingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantOrder" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "pickupLocationId" UUID,
    "pickupAddressSnapshot" TEXT,
    "itemDescription" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "paymentType" "MerchantPaymentType" NOT NULL,
    "codAmount" DECIMAL(10,2),
    "internalNote" TEXT,
    "riderNote" TEXT,
    "requestedTiming" "MerchantRequestedTiming" NOT NULL,
    "scheduledFor" TIMESTAMPTZ(6),
    "status" "MerchantDeliveryStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantDelivery" (
    "id" UUID NOT NULL,
    "merchantOrderId" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "dispatchMode" "MerchantDispatchMode" NOT NULL,
    "deliveryType" "DeliveryType" DEFAULT 'in_parish',
    "overallOutOfParishStatus" "OutOfParishOverallStatus",
    "riderId" UUID,
    "quoteAmount" DECIMAL(10,2),
    "localPickupFee" DECIMAL(10,2),
    "partnerTransferFee" DECIMAL(10,2),
    "finalMileFee" DECIMAL(10,2),
    "totalFee" DECIMAL(10,2),
    "assignedAt" TIMESTAMPTZ(6),
    "pickedUpAt" TIMESTAMPTZ(6),
    "deliveredAt" TIMESTAMPTZ(6),
    "failedAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "status" "MerchantDeliveryStatus" NOT NULL,
    "proofOfDeliveryUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantAddress" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "type" "MerchantAddressType" NOT NULL,
    "label" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantTeamMember" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "UserRoleCode" NOT NULL,
    "status" "MerchantTeamMemberStatus" NOT NULL,
    "invitedAt" TIMESTAMPTZ(6),
    "joinedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantNotificationPreference" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL,
    "smsEnabled" BOOLEAN NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL,
    "notifyOnAssigned" BOOLEAN NOT NULL,
    "notifyOnDelivered" BOOLEAN NOT NULL,
    "notifyOnFailed" BOOLEAN NOT NULL,
    "notifyOnBilling" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantDispatchEvent" (
    "id" UUID NOT NULL,
    "merchantDeliveryId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" UUID,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MerchantDispatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCarrier" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PartnerCarrierType" NOT NULL,
    "supportsTracking" BOOLEAN NOT NULL,
    "supportsApi" BOOLEAN NOT NULL,
    "supportsFinalDelivery" BOOLEAN NOT NULL,
    "supportsBranchCollection" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "contactConfig" JSONB,
    "trackingConfig" JSONB,
    "webhookConfig" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PartnerCarrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerHandoffLocation" (
    "id" UUID NOT NULL,
    "partnerCarrierId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "openingHours" JSONB,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PartnerHandoffLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryTransferPlan" (
    "id" UUID NOT NULL,
    "merchantDeliveryId" UUID NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "originParish" TEXT NOT NULL,
    "destinationParish" TEXT NOT NULL,
    "destinationTown" TEXT,
    "transferPartnerId" UUID NOT NULL,
    "originHandoffLocationId" UUID,
    "destinationHandoffLocationId" UUID,
    "finalFulfillmentMethod" "FinalFulfillmentMethod" NOT NULL,
    "packageValue" DECIMAL(10,2),
    "specialHandlingNotes" TEXT,
    "customerTrackingCode" TEXT NOT NULL,
    "overallStatus" "OutOfParishOverallStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeliveryTransferPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLeg" (
    "id" UUID NOT NULL,
    "merchantDeliveryId" UUID NOT NULL,
    "transferPlanId" UUID,
    "legSequence" INTEGER NOT NULL,
    "legType" "DeliveryLegType" NOT NULL,
    "providerType" "DeliveryLegProviderType" NOT NULL,
    "providerId" UUID,
    "originLabel" TEXT NOT NULL,
    "originAddress" TEXT,
    "destinationLabel" TEXT NOT NULL,
    "destinationAddress" TEXT,
    "partnerTrackingReference" TEXT,
    "status" "DeliveryLegStatus" NOT NULL,
    "eta" TIMESTAMPTZ(6),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "failedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeliveryLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerTrackingEvent" (
    "id" UUID NOT NULL,
    "deliveryLegId" UUID NOT NULL,
    "partnerCarrierId" UUID NOT NULL,
    "externalTrackingReference" TEXT,
    "rawStatus" TEXT NOT NULL,
    "normalizedStatus" TEXT NOT NULL,
    "notes" TEXT,
    "eventTimestamp" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PartnerTrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferrerAccount" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "emailVerifiedAt" TIMESTAMPTZ(6),
    "phoneVerifiedAt" TIMESTAMPTZ(6),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReferrerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferrerLoginChallenge" (
    "id" TEXT NOT NULL,
    "referrerAccountId" TEXT,
    "channel" "ReferrerChallengeChannel" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferrerLoginChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferrerSession" (
    "id" TEXT NOT NULL,
    "referrerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReferrerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSlyderReferral" (
    "id" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referrerName" TEXT NOT NULL,
    "referrerPhone" TEXT NOT NULL,
    "referrerEmail" TEXT,
    "referrerAccountId" TEXT,
    "referredName" TEXT NOT NULL,
    "referredEmail" TEXT,
    "referredPhone" TEXT NOT NULL,
    "referredParish" TEXT,
    "referredTown" TEXT,
    "referredVehicleType" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "statusReason" TEXT,
    "inviteEmailSentAt" TIMESTAMPTZ(6),
    "inviteEmailStatus" "ReferrerInviteEmailStatus",
    "applicationStartedAt" TIMESTAMPTZ(6),
    "applicationCompletedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6),
    "activatedAt" TIMESTAMPTZ(6),
    "readyAt" TIMESTAMPTZ(6),
    "firstDeliveryCompletedAt" TIMESTAMPTZ(6),
    "rewardEarnedAt" TIMESTAMPTZ(6),
    "rewardClaimedAt" TIMESTAMPTZ(6),
    "rewardGiftedAt" TIMESTAMPTZ(6),
    "rewardRedeemedAt" TIMESTAMPTZ(6),
    "linkedSlyderApplicationId" UUID,
    "linkedSlyderProfileId" UUID,
    "rewardId" TEXT,
    "duplicateOfReferralId" TEXT,
    "submittedIpHash" TEXT,
    "submittedUserAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PublicSlyderReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralEvent" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "publicReferralId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JMD',
    "status" TEXT NOT NULL,
    "isTransferable" BOOLEAN NOT NULL DEFAULT true,
    "transferCount" INTEGER NOT NULL DEFAULT 0,
    "transferredAt" TIMESTAMPTZ(6),
    "ownerCustomerAccountId" TEXT,
    "ownerPhone" TEXT,
    "giftedToCustomerAccountId" TEXT,
    "giftedToPhone" TEXT,
    "giftedByReferrerPhone" TEXT,
    "minOrderValue" INTEGER,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "redeemedAt" TIMESTAMPTZ(6),
    "redemptionOrderId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralRewardAudit" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralRewardAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeApplication" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "roleInterest" TEXT NOT NULL,
    "departmentInterest" "EmployeeDepartmentCode" NOT NULL,
    "employmentType" "EmployeeEmploymentType" NOT NULL,
    "location" TEXT NOT NULL,
    "experienceSummary" TEXT NOT NULL,
    "managerTrackInterest" BOOLEAN,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "status" "EmployeeApplicationStatus" NOT NULL,
    "submittedAt" TIMESTAMPTZ(6) NOT NULL,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedByLabel" TEXT,
    "linkedUserId" UUID,
    "linkedEmployeeProfileId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "department" "EmployeeDepartmentCode" NOT NULL,
    "title" TEXT NOT NULL,
    "employmentType" "EmployeeEmploymentType" NOT NULL,
    "managerUserId" UUID,
    "startDate" DATE NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "payrollFrequency" "EmployeePayrollFrequency" NOT NULL,
    "payoutMethod" "EmployeePayoutMethod" NOT NULL,
    "payoutAccountMasked" TEXT,
    "isOnboarded" BOOLEAN NOT NULL,
    "onboardingCompletedAt" TIMESTAMPTZ(6),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAnnouncement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "EmployeeGuideAudience"[],
    "publishedByUserId" UUID,
    "priority" "EmployeeAnnouncementPriority" NOT NULL,
    "publishedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGuide" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "EmployeeGuideCategory" NOT NULL,
    "audience" "EmployeeGuideAudience"[],
    "contentMarkdown" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGuideAcknowledgement" (
    "id" UUID NOT NULL,
    "guideId" UUID NOT NULL,
    "employeeProfileId" UUID NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeGuideAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePayrollRecord" (
    "id" UUID NOT NULL,
    "employeeProfileId" UUID NOT NULL,
    "payPeriodStart" DATE NOT NULL,
    "payPeriodEnd" DATE NOT NULL,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "deductionsAmount" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "status" "EmployeePayrollRecordStatus" NOT NULL,
    "payDate" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeePayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePayoutRecord" (
    "id" UUID NOT NULL,
    "employeeProfileId" UUID NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "EmployeePayoutRecordStatus" NOT NULL,
    "payoutDate" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeePayoutRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" UUID NOT NULL,
    "documentType" "LegalDocumentType" NOT NULL,
    "categoryKey" "LegalDocumentCategoryKey" NOT NULL,
    "actorScopes" "LegalActorType"[],
    "requiresAcceptance" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "summary" TEXT,
    "excerpt" TEXT,
    "status" "LegalDocumentStatus" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "effectiveFrom" TIMESTAMPTZ(6),
    "publishedAt" TIMESTAMPTZ(6),
    "archivedAt" TIMESTAMPTZ(6),
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" UUID NOT NULL,
    "actorType" "LegalActorType" NOT NULL,
    "actorId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "documentType" "LegalDocumentType" NOT NULL,
    "documentTitleSnapshot" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptanceSource" "AcceptanceSource" NOT NULL,
    "checkboxLabelSnapshot" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentPublishHistory" (
    "id" UUID NOT NULL,
    "legalDocumentId" UUID NOT NULL,
    "action" "LegalPublishAction" NOT NULL,
    "note" TEXT,
    "actedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LegalDocumentPublishHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialLead" (
    "id" UUID NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "parish" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "status" "ResidentialIntakeStatus" NOT NULL,
    "sourceCampaign" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialDispatchIntent" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropoffParish" TEXT NOT NULL,
    "dropoffArea" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "parcelCategory" "ResidentialParcelCategory" NOT NULL,
    "parcelNotes" TEXT,
    "urgency" TEXT NOT NULL,
    "preferredWindow" TEXT,
    "paymentPreference" TEXT NOT NULL,
    "privacyAccepted" BOOLEAN NOT NULL,
    "termsAccepted" BOOLEAN NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentedAt" TIMESTAMPTZ(6) NOT NULL,
    "estimatedFeeMin" INTEGER,
    "estimatedFeeMax" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialDispatchIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialHandoffJob" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "state" "ResidentialHandoffState" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMPTZ(6),
    "acknowledgedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialHandoffJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SlyderApplication_applicationCode_key" ON "SlyderApplication"("applicationCode");

-- CreateIndex
CREATE INDEX "SlyderApplication_applicationStatus_createdAt_idx" ON "SlyderApplication"("applicationStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SlyderApplication_linkedUserId_idx" ON "SlyderApplication"("linkedUserId");

-- CreateIndex
CREATE INDEX "SlyderApplication_linkedSlyderProfileId_idx" ON "SlyderApplication"("linkedSlyderProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SlyderApplicationVehicle_applicationId_key" ON "SlyderApplicationVehicle"("applicationId");

-- CreateIndex
CREATE INDEX "SlyderApplicationDocument_applicationId_type_idx" ON "SlyderApplicationDocument"("applicationId", "type");

-- CreateIndex
CREATE INDEX "SlyderApplicationDocument_verificationStatus_type_idx" ON "SlyderApplicationDocument"("verificationStatus", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SlyderProfile_userId_key" ON "SlyderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SlyderProfile_applicationId_key" ON "SlyderProfile"("applicationId");

-- CreateIndex
CREATE INDEX "SlyderProfile_coverageZoneId_idx" ON "SlyderProfile"("coverageZoneId");

-- CreateIndex
CREATE INDEX "SlyderProfile_operationalStatus_readinessStatus_idx" ON "SlyderProfile"("operationalStatus", "readinessStatus");

-- CreateIndex
CREATE INDEX "StatusHistory_entityType_entityId_createdAt_idx" ON "StatusHistory"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ActivationToken_tokenHash_key" ON "ActivationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ActivationToken_userId_createdAt_idx" ON "ActivationToken"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "OtpChallenge_userId_createdAt_idx" ON "OtpChallenge"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SessionRecord_userId_expiresAt_idx" ON "SessionRecord"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "NotificationTemplate_actorType_eventType_channel_isActive_idx" ON "NotificationTemplate"("actorType", "eventType", "channel", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_key_version_channel_key" ON "NotificationTemplate"("key", "version", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTriggerEvent_eventKey_key" ON "NotificationTriggerEvent"("eventKey");

-- CreateIndex
CREATE INDEX "NotificationTriggerEvent_status_createdAt_idx" ON "NotificationTriggerEvent"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationRecord_actorType_actorId_createdAt_idx" ON "NotificationRecord"("actorType", "actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "NotificationRecord_applicationId_createdAt_idx" ON "NotificationRecord"("applicationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "NotificationRecord_slyderProfileId_createdAt_idx" ON "NotificationRecord"("slyderProfileId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecord_dedupeKey_key" ON "NotificationRecord"("dedupeKey");

-- CreateIndex
CREATE INDEX "SupportConversation_domain_status_priority_createdAt_idx" ON "SupportConversation"("domain", "status", "priority", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SupportConversation_merchantId_createdAt_idx" ON "SupportConversation"("merchantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SupportConversation_userId_createdAt_idx" ON "SupportConversation"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SupportConversation_externalTicketId_idx" ON "SupportConversation"("externalTicketId");

-- CreateIndex
CREATE INDEX "SupportMessage_conversationId_createdAt_idx" ON "SupportMessage"("conversationId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "SupportContextSnapshot_conversationId_createdAt_idx" ON "SupportContextSnapshot"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SupportHandoff_conversationId_createdAt_idx" ON "SupportHandoff"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SupportHandoff_recommendedTeam_idx" ON "SupportHandoff"("recommendedTeam");

-- CreateIndex
CREATE INDEX "SupportEvent_conversationId_eventType_createdAt_idx" ON "SupportEvent"("conversationId", "eventType", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "SupportKnowledgeArticle_slug_key" ON "SupportKnowledgeArticle"("slug");

-- CreateIndex
CREATE INDEX "SupportKnowledgeArticle_domain_published_idx" ON "SupportKnowledgeArticle"("domain", "published");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageZone_name_parish_key" ON "CoverageZone"("name", "parish");

-- CreateIndex
CREATE INDEX "MerchantInterest_lifecycleStatus_createdAt_idx" ON "MerchantInterest"("lifecycleStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantLead_status_createdAt_idx" ON "MerchantLead"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantLead_productIntent_createdAt_idx" ON "MerchantLead"("productIntent", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantLead_email_createdAt_idx" ON "MerchantLead"("email", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantLead_phone_createdAt_idx" ON "MerchantLead"("phone", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantApplication_merchantLeadId_createdAt_idx" ON "MerchantApplication"("merchantLeadId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantApplication_onboardingTrack_createdAt_idx" ON "MerchantApplication"("onboardingTrack", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantApplication_approvalStatus_activationStatus_created_idx" ON "MerchantApplication"("approvalStatus", "activationStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantApplication_businessLicenseStatus_businessLicenseGr_idx" ON "MerchantApplication"("businessLicenseStatus", "businessLicenseGraceEndsAt", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantIntegrationProfile_merchantApplicationId_key" ON "MerchantIntegrationProfile"("merchantApplicationId");

-- CreateIndex
CREATE INDEX "MerchantOnboardingEvent_merchantApplicationId_createdAt_idx" ON "MerchantOnboardingEvent"("merchantApplicationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantOrder_merchantId_status_createdAt_idx" ON "MerchantOrder"("merchantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantOrder_orderNumber_idx" ON "MerchantOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "MerchantOrder_pickupLocationId_idx" ON "MerchantOrder"("pickupLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantOrder_merchantId_orderNumber_key" ON "MerchantOrder"("merchantId", "orderNumber");

-- CreateIndex
CREATE INDEX "MerchantDelivery_merchantId_status_createdAt_idx" ON "MerchantDelivery"("merchantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantDelivery_deliveryType_overallOutOfParishStatus_crea_idx" ON "MerchantDelivery"("deliveryType", "overallOutOfParishStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantDelivery_merchantOrderId_idx" ON "MerchantDelivery"("merchantOrderId");

-- CreateIndex
CREATE INDEX "MerchantDelivery_createdAt_idx" ON "MerchantDelivery"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantAddress_merchantId_type_createdAt_idx" ON "MerchantAddress"("merchantId", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantAddress_merchantId_isDefault_idx" ON "MerchantAddress"("merchantId", "isDefault");

-- CreateIndex
CREATE INDEX "MerchantTeamMember_merchantId_status_createdAt_idx" ON "MerchantTeamMember"("merchantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MerchantTeamMember_userId_idx" ON "MerchantTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantTeamMember_merchantId_userId_key" ON "MerchantTeamMember"("merchantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantNotificationPreference_merchantId_key" ON "MerchantNotificationPreference"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantNotificationPreference_merchantId_idx" ON "MerchantNotificationPreference"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantDispatchEvent_merchantDeliveryId_createdAt_idx" ON "MerchantDispatchEvent"("merchantDeliveryId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerCarrier_slug_key" ON "PartnerCarrier"("slug");

-- CreateIndex
CREATE INDEX "PartnerCarrier_active_createdAt_idx" ON "PartnerCarrier"("active", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PartnerHandoffLocation_partnerCarrierId_active_createdAt_idx" ON "PartnerHandoffLocation"("partnerCarrierId", "active", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryTransferPlan_merchantDeliveryId_key" ON "DeliveryTransferPlan"("merchantDeliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryTransferPlan_customerTrackingCode_key" ON "DeliveryTransferPlan"("customerTrackingCode");

-- CreateIndex
CREATE INDEX "DeliveryTransferPlan_merchantDeliveryId_idx" ON "DeliveryTransferPlan"("merchantDeliveryId");

-- CreateIndex
CREATE INDEX "DeliveryTransferPlan_transferPartnerId_overallStatus_create_idx" ON "DeliveryTransferPlan"("transferPartnerId", "overallStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DeliveryTransferPlan_customerTrackingCode_idx" ON "DeliveryTransferPlan"("customerTrackingCode");

-- CreateIndex
CREATE INDEX "DeliveryLeg_merchantDeliveryId_status_createdAt_idx" ON "DeliveryLeg"("merchantDeliveryId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DeliveryLeg_transferPlanId_legSequence_idx" ON "DeliveryLeg"("transferPlanId", "legSequence");

-- CreateIndex
CREATE INDEX "DeliveryLeg_partnerTrackingReference_idx" ON "DeliveryLeg"("partnerTrackingReference");

-- CreateIndex
CREATE INDEX "PartnerTrackingEvent_deliveryLegId_createdAt_idx" ON "PartnerTrackingEvent"("deliveryLegId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PartnerTrackingEvent_partnerCarrierId_eventTimestamp_idx" ON "PartnerTrackingEvent"("partnerCarrierId", "eventTimestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ReferrerAccount_email_key" ON "ReferrerAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ReferrerAccount_phone_key" ON "ReferrerAccount"("phone");

-- CreateIndex
CREATE INDEX "ReferrerAccount_createdAt_idx" ON "ReferrerAccount"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferrerLoginChallenge_referrerAccountId_createdAt_idx" ON "ReferrerLoginChallenge"("referrerAccountId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferrerLoginChallenge_email_createdAt_idx" ON "ReferrerLoginChallenge"("email", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferrerLoginChallenge_phone_createdAt_idx" ON "ReferrerLoginChallenge"("phone", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferrerLoginChallenge_channel_expiresAt_idx" ON "ReferrerLoginChallenge"("channel", "expiresAt");

-- CreateIndex
CREATE INDEX "ReferrerSession_referrerAccountId_expiresAt_idx" ON "ReferrerSession"("referrerAccountId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSlyderReferral_referralCode_key" ON "PublicSlyderReferral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSlyderReferral_rewardId_key" ON "PublicSlyderReferral"("rewardId");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_referrerAccountId_idx" ON "PublicSlyderReferral"("referrerAccountId");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_referredEmail_idx" ON "PublicSlyderReferral"("referredEmail");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_referredPhone_idx" ON "PublicSlyderReferral"("referredPhone");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_referrerPhone_idx" ON "PublicSlyderReferral"("referrerPhone");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_status_idx" ON "PublicSlyderReferral"("status");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_createdAt_idx" ON "PublicSlyderReferral"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_linkedSlyderApplicationId_idx" ON "PublicSlyderReferral"("linkedSlyderApplicationId");

-- CreateIndex
CREATE INDEX "PublicSlyderReferral_linkedSlyderProfileId_idx" ON "PublicSlyderReferral"("linkedSlyderProfileId");

-- CreateIndex
CREATE INDEX "ReferralEvent_referralId_createdAt_idx" ON "ReferralEvent"("referralId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferralEvent_eventType_createdAt_idx" ON "ReferralEvent"("eventType", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_publicReferralId_key" ON "ReferralReward"("publicReferralId");

-- CreateIndex
CREATE INDEX "ReferralReward_status_idx" ON "ReferralReward"("status");

-- CreateIndex
CREATE INDEX "ReferralReward_expiresAt_idx" ON "ReferralReward"("expiresAt");

-- CreateIndex
CREATE INDEX "ReferralReward_ownerPhone_idx" ON "ReferralReward"("ownerPhone");

-- CreateIndex
CREATE INDEX "ReferralReward_giftedToPhone_idx" ON "ReferralReward"("giftedToPhone");

-- CreateIndex
CREATE INDEX "ReferralReward_createdAt_idx" ON "ReferralReward"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReferralRewardAudit_rewardId_createdAt_idx" ON "ReferralRewardAudit"("rewardId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeApplication_linkedEmployeeProfileId_key" ON "EmployeeApplication"("linkedEmployeeProfileId");

-- CreateIndex
CREATE INDEX "EmployeeApplication_status_submittedAt_idx" ON "EmployeeApplication"("status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "EmployeeApplication_linkedUserId_idx" ON "EmployeeApplication"("linkedUserId");

-- CreateIndex
CREATE INDEX "EmployeeApplication_linkedEmployeeProfileId_idx" ON "EmployeeApplication"("linkedEmployeeProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeCode_key" ON "EmployeeProfile"("employeeCode");

-- CreateIndex
CREATE INDEX "EmployeeProfile_department_isOnboarded_idx" ON "EmployeeProfile"("department", "isOnboarded");

-- CreateIndex
CREATE INDEX "EmployeeProfile_managerUserId_idx" ON "EmployeeProfile"("managerUserId");

-- CreateIndex
CREATE INDEX "EmployeeAnnouncement_publishedAt_idx" ON "EmployeeAnnouncement"("publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGuide_slug_key" ON "EmployeeGuide"("slug");

-- CreateIndex
CREATE INDEX "EmployeeGuide_category_isFeatured_idx" ON "EmployeeGuide"("category", "isFeatured");

-- CreateIndex
CREATE INDEX "EmployeeGuideAcknowledgement_employeeProfileId_acknowledged_idx" ON "EmployeeGuideAcknowledgement"("employeeProfileId", "acknowledgedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGuideAcknowledgement_guideId_employeeProfileId_key" ON "EmployeeGuideAcknowledgement"("guideId", "employeeProfileId");

-- CreateIndex
CREATE INDEX "EmployeePayrollRecord_employeeProfileId_payDate_idx" ON "EmployeePayrollRecord"("employeeProfileId", "payDate" DESC);

-- CreateIndex
CREATE INDEX "EmployeePayoutRecord_employeeProfileId_payoutDate_idx" ON "EmployeePayoutRecord"("employeeProfileId", "payoutDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_slug_key" ON "LegalDocument"("slug");

-- CreateIndex
CREATE INDEX "LegalDocument_documentType_isActive_idx" ON "LegalDocument"("documentType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_documentType_version_key" ON "LegalDocument"("documentType", "version");

-- CreateIndex
CREATE INDEX "LegalAcceptance_actorType_actorId_acceptedAt_idx" ON "LegalAcceptance"("actorType", "actorId", "acceptedAt" DESC);

-- CreateIndex
CREATE INDEX "LegalAcceptance_documentId_acceptedAt_idx" ON "LegalAcceptance"("documentId", "acceptedAt" DESC);

-- CreateIndex
CREATE INDEX "LegalDocumentPublishHistory_legalDocumentId_createdAt_idx" ON "LegalDocumentPublishHistory"("legalDocumentId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialLead_referenceCode_key" ON "ResidentialLead"("referenceCode");

-- CreateIndex
CREATE INDEX "ResidentialLead_status_createdAt_idx" ON "ResidentialLead"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ResidentialLead_phone_idx" ON "ResidentialLead"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialDispatchIntent_leadId_key" ON "ResidentialDispatchIntent"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialHandoffJob_leadId_key" ON "ResidentialHandoffJob"("leadId");

-- CreateIndex
CREATE INDEX "ResidentialHandoffJob_state_nextRetryAt_idx" ON "ResidentialHandoffJob"("state", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "SlyderApplication" ADD CONSTRAINT "SlyderApplication_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderApplicationVehicle" ADD CONSTRAINT "SlyderApplicationVehicle_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "SlyderApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderApplicationDocument" ADD CONSTRAINT "SlyderApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "SlyderApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderProfile" ADD CONSTRAINT "SlyderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderProfile" ADD CONSTRAINT "SlyderProfile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "SlyderApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderProfile" ADD CONSTRAINT "SlyderProfile_coverageZoneId_fkey" FOREIGN KEY ("coverageZoneId") REFERENCES "CoverageZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlyderProfile" ADD CONSTRAINT "SlyderProfile_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationToken" ADD CONSTRAINT "ActivationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpChallenge" ADD CONSTRAINT "OtpChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRecord" ADD CONSTRAINT "SessionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecord" ADD CONSTRAINT "NotificationRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "NotificationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecord" ADD CONSTRAINT "NotificationRecord_triggerEventId_fkey" FOREIGN KEY ("triggerEventId") REFERENCES "NotificationTriggerEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecord" ADD CONSTRAINT "NotificationRecord_resentFromId_fkey" FOREIGN KEY ("resentFromId") REFERENCES "NotificationRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecord" ADD CONSTRAINT "NotificationRecord_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecord" ADD CONSTRAINT "NotificationRecord_slyderProfileId_fkey" FOREIGN KEY ("slyderProfileId") REFERENCES "SlyderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportContextSnapshot" ADD CONSTRAINT "SupportContextSnapshot_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportHandoff" ADD CONSTRAINT "SupportHandoff_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportEvent" ADD CONSTRAINT "SupportEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantApplication" ADD CONSTRAINT "MerchantApplication_merchantLeadId_fkey" FOREIGN KEY ("merchantLeadId") REFERENCES "MerchantLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantIntegrationProfile" ADD CONSTRAINT "MerchantIntegrationProfile_merchantApplicationId_fkey" FOREIGN KEY ("merchantApplicationId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOnboardingEvent" ADD CONSTRAINT "MerchantOnboardingEvent_merchantApplicationId_fkey" FOREIGN KEY ("merchantApplicationId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOrder" ADD CONSTRAINT "MerchantOrder_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOrder" ADD CONSTRAINT "MerchantOrder_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "MerchantAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantDelivery" ADD CONSTRAINT "MerchantDelivery_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantDelivery" ADD CONSTRAINT "MerchantDelivery_merchantOrderId_fkey" FOREIGN KEY ("merchantOrderId") REFERENCES "MerchantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantAddress" ADD CONSTRAINT "MerchantAddress_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantTeamMember" ADD CONSTRAINT "MerchantTeamMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantTeamMember" ADD CONSTRAINT "MerchantTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantNotificationPreference" ADD CONSTRAINT "MerchantNotificationPreference_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantDispatchEvent" ADD CONSTRAINT "MerchantDispatchEvent_merchantDeliveryId_fkey" FOREIGN KEY ("merchantDeliveryId") REFERENCES "MerchantDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerHandoffLocation" ADD CONSTRAINT "PartnerHandoffLocation_partnerCarrierId_fkey" FOREIGN KEY ("partnerCarrierId") REFERENCES "PartnerCarrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTransferPlan" ADD CONSTRAINT "DeliveryTransferPlan_merchantDeliveryId_fkey" FOREIGN KEY ("merchantDeliveryId") REFERENCES "MerchantDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTransferPlan" ADD CONSTRAINT "DeliveryTransferPlan_transferPartnerId_fkey" FOREIGN KEY ("transferPartnerId") REFERENCES "PartnerCarrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLeg" ADD CONSTRAINT "DeliveryLeg_merchantDeliveryId_fkey" FOREIGN KEY ("merchantDeliveryId") REFERENCES "MerchantDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLeg" ADD CONSTRAINT "DeliveryLeg_transferPlanId_fkey" FOREIGN KEY ("transferPlanId") REFERENCES "DeliveryTransferPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTrackingEvent" ADD CONSTRAINT "PartnerTrackingEvent_deliveryLegId_fkey" FOREIGN KEY ("deliveryLegId") REFERENCES "DeliveryLeg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTrackingEvent" ADD CONSTRAINT "PartnerTrackingEvent_partnerCarrierId_fkey" FOREIGN KEY ("partnerCarrierId") REFERENCES "PartnerCarrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferrerLoginChallenge" ADD CONSTRAINT "ReferrerLoginChallenge_referrerAccountId_fkey" FOREIGN KEY ("referrerAccountId") REFERENCES "ReferrerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferrerSession" ADD CONSTRAINT "ReferrerSession_referrerAccountId_fkey" FOREIGN KEY ("referrerAccountId") REFERENCES "ReferrerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSlyderReferral" ADD CONSTRAINT "PublicSlyderReferral_referrerAccountId_fkey" FOREIGN KEY ("referrerAccountId") REFERENCES "ReferrerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSlyderReferral" ADD CONSTRAINT "PublicSlyderReferral_linkedSlyderApplicationId_fkey" FOREIGN KEY ("linkedSlyderApplicationId") REFERENCES "SlyderApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSlyderReferral" ADD CONSTRAINT "PublicSlyderReferral_linkedSlyderProfileId_fkey" FOREIGN KEY ("linkedSlyderProfileId") REFERENCES "SlyderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSlyderReferral" ADD CONSTRAINT "PublicSlyderReferral_duplicateOfReferralId_fkey" FOREIGN KEY ("duplicateOfReferralId") REFERENCES "PublicSlyderReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "PublicSlyderReferral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_publicReferralId_fkey" FOREIGN KEY ("publicReferralId") REFERENCES "PublicSlyderReferral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralRewardAudit" ADD CONSTRAINT "ReferralRewardAudit_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "ReferralReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApplication" ADD CONSTRAINT "EmployeeApplication_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApplication" ADD CONSTRAINT "EmployeeApplication_linkedEmployeeProfileId_fkey" FOREIGN KEY ("linkedEmployeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAnnouncement" ADD CONSTRAINT "EmployeeAnnouncement_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGuideAcknowledgement" ADD CONSTRAINT "EmployeeGuideAcknowledgement_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "EmployeeGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGuideAcknowledgement" ADD CONSTRAINT "EmployeeGuideAcknowledgement_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayrollRecord" ADD CONSTRAINT "EmployeePayrollRecord_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayoutRecord" ADD CONSTRAINT "EmployeePayoutRecord_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocumentPublishHistory" ADD CONSTRAINT "LegalDocumentPublishHistory_legalDocumentId_fkey" FOREIGN KEY ("legalDocumentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialDispatchIntent" ADD CONSTRAINT "ResidentialDispatchIntent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ResidentialLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialHandoffJob" ADD CONSTRAINT "ResidentialHandoffJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ResidentialLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
