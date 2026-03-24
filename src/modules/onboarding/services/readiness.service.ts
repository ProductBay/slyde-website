import type { CoverageZone, LaunchStatus, OnboardingStore, SetupStatusResponse, SlyderProfile } from "@/types/backend/onboarding";
import { findApplication } from "@/modules/onboarding/repositories/onboarding.repository";
import {
  buildRemainingSetupSteps,
  courierNeedsVehicle,
  hasAllRequiredDocumentApprovals,
} from "@/modules/onboarding/services/onboarding-rules.service";

function nowIso() {
  return new Date().toISOString();
}

function getZoneLaunchStatus(store: OnboardingStore, zone?: CoverageZone): LaunchStatus | undefined {
  if (!zone) return undefined;
  if (zone.isPaused) return "paused";
  if (zone.isLive) return "live";

  const readyProfiles = store.slyderProfiles.filter(
    (profile) => profile.coverageZoneId === zone.id && profile.readinessStatus === "passed",
  ).length;
  const percentage = Math.round((readyProfiles / Math.max(zone.requiredReadySlyders, 1)) * 100);

  if (percentage >= 100) return "ready";
  if (percentage >= 75) return "near_ready";
  if (percentage >= 35) return "building";
  return "not_ready";
}

function ensureChecklist(profile: SlyderProfile) {
  const timestamp = nowIso();
  const checklist = profile.readinessChecklist ?? {
    profileConfirmed: profile.profileComplete,
    vehicleConfirmed: profile.vehicleVerified,
    payoutConfigured: profile.payoutSetupComplete,
    legalAccepted: profile.contractAccepted,
    locationPermissionConfirmed: false,
    notificationPermissionConfirmed: false,
    equipmentConfirmed: false,
    trainingAcknowledged: profile.trainingComplete,
    emergencyContactConfirmed: false,
    overallStatus: "not_started" as const,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  checklist.profileConfirmed = checklist.profileConfirmed || profile.profileComplete;
  checklist.vehicleConfirmed = checklist.vehicleConfirmed || profile.vehicleVerified;
  checklist.payoutConfigured = checklist.payoutConfigured || profile.payoutSetupComplete;
  checklist.legalAccepted = checklist.legalAccepted || profile.contractAccepted;
  checklist.trainingAcknowledged = checklist.trainingAcknowledged || profile.trainingComplete;
  checklist.updatedAt = timestamp;
  profile.readinessChecklist = checklist;
  return checklist;
}

function buildResponse(
  store: OnboardingStore,
  profile: SlyderProfile,
  zone: CoverageZone | undefined,
  pendingLegalDocuments: SetupStatusResponse["pendingLegalDocuments"],
  remainingSteps: string[],
  requiredDocumentsApproved: boolean,
): SetupStatusResponse {
  const checklist = ensureChecklist(profile);

  return {
    profileComplete: profile.profileComplete,
    contractAccepted: profile.contractAccepted,
    contractAcceptedAt: profile.contractAcceptedAt,
    payoutSetupComplete: profile.payoutSetupComplete,
    trainingComplete: profile.trainingComplete,
    permissionsComplete: profile.permissionsComplete,
    vehicleVerified: profile.vehicleVerified,
    requiredDocumentsApproved,
    requiredAgreementsAccepted: profile.requiredAgreementsAccepted,
    accountStatus: profile.accountStatus,
    onboardingStatus: profile.onboardingStatus,
    readinessStatus: profile.readinessStatus,
    operationalStatus: profile.operationalStatus,
    canGoOnline: profile.canGoOnline,
    canReceiveOrders: profile.canReceiveOrders,
    activationCompleted: Boolean(profile.activatedAt && profile.accountStatus === "active"),
    activatedAt: profile.activatedAt,
    setupCompletedAt: profile.setupCompletedAt,
    trainingAcknowledgedAt: profile.trainingAcknowledgedAt,
    coverageZoneId: profile.coverageZoneId,
    zoneStatus: getZoneLaunchStatus(store, zone),
    zoneName: zone?.name,
    eligibilityState:
      profile.operationalStatus === "live_enabled" || profile.operationalStatus === "eligible_online"
        ? "eligible_online"
        : profile.operationalStatus === "eligible_offline" || profile.operationalStatus === "waiting_for_zone"
          ? "eligible_offline"
          : profile.operationalStatus === "blocked" || profile.operationalStatus === "suspended"
            ? "blocked"
            : "setup_incomplete",
    readinessChecklist: {
      profileConfirmed: checklist.profileConfirmed,
      vehicleConfirmed: checklist.vehicleConfirmed,
      payoutConfigured: checklist.payoutConfigured,
      legalAccepted: checklist.legalAccepted,
      locationPermissionConfirmed: checklist.locationPermissionConfirmed,
      notificationPermissionConfirmed: checklist.notificationPermissionConfirmed,
      equipmentConfirmed: checklist.equipmentConfirmed,
      trainingAcknowledged: checklist.trainingAcknowledged,
      emergencyContactConfirmed: checklist.emergencyContactConfirmed,
      overallStatus: checklist.overallStatus,
    },
    pendingLegalDocuments,
    remainingSteps,
  };
}

export function evaluateSlyderOperationalEligibility(
  store: OnboardingStore,
  profileId: string,
  pendingLegalDocuments: SetupStatusResponse["pendingLegalDocuments"] = [],
): SetupStatusResponse {
  const profile = store.slyderProfiles.find((item) => item.id === profileId);
  if (!profile) {
    throw new Error("Slyder profile not found");
  }

  const application = findApplication(store, profile.applicationId);
  if (!application) {
    throw new Error("Linked application not found");
  }

  const zone =
    (profile.coverageZoneId ? store.coverageZones.find((item) => item.id === profile.coverageZoneId) : undefined) ??
    store.coverageZones.find((item) => item.id === profile.coverageZoneId || item.name === application.preferredZones[0] || item.name === application.parish);

  if (!profile.coverageZoneId && zone) {
    profile.coverageZoneId = zone.id;
  }

  const checklist = ensureChecklist(profile);
  const requiredDocumentsApproved = hasAllRequiredDocumentApprovals(store, application);

  checklist.profileConfirmed = profile.profileComplete;
  checklist.vehicleConfirmed = !courierNeedsVehicle(application.courierType) || profile.vehicleVerified;
  checklist.payoutConfigured = profile.payoutSetupComplete;
  checklist.legalAccepted = profile.contractAccepted;
  checklist.trainingAcknowledged = profile.trainingComplete;
  checklist.overallStatus =
    checklist.profileConfirmed &&
    checklist.vehicleConfirmed &&
    checklist.payoutConfigured &&
    checklist.legalAccepted &&
    checklist.locationPermissionConfirmed &&
    checklist.notificationPermissionConfirmed &&
    checklist.equipmentConfirmed &&
    checklist.trainingAcknowledged &&
    checklist.emergencyContactConfirmed
      ? "passed"
      : checklist.profileConfirmed || checklist.legalAccepted || checklist.equipmentConfirmed
        ? "pending"
        : "not_started";
  checklist.updatedAt = nowIso();

  const remainingSteps = buildRemainingSetupSteps(store, application, profile);
  const accountActive = profile.accountStatus === "active";
  const zoneStatus = getZoneLaunchStatus(store, zone);
  const activationCompleted = Boolean(profile.activatedAt && accountActive);
  const setupComplete =
    profile.profileComplete &&
    profile.permissionsComplete &&
    profile.requiredAgreementsAccepted &&
    profile.payoutSetupComplete &&
    (!courierNeedsVehicle(application.courierType) || profile.vehicleVerified);

  const readinessPassed =
    checklist.overallStatus === "passed" &&
    profile.trainingComplete &&
    requiredDocumentsApproved;

  if (["disabled", "suspended"].includes(profile.accountStatus)) {
    profile.readinessStatus = "failed";
    profile.onboardingStatus = "blocked";
    profile.operationalStatus = profile.accountStatus === "suspended" ? "suspended" : "blocked";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (!activationCompleted) {
    profile.readinessStatus = "not_started";
    profile.onboardingStatus = "activation_pending";
    profile.operationalStatus = "inactive";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (!profile.contractAccepted || pendingLegalDocuments.length > 0) {
    profile.readinessStatus = "not_started";
    profile.onboardingStatus = "contract_pending";
    profile.operationalStatus = "inactive";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (!setupComplete) {
    profile.readinessStatus = checklist.overallStatus === "not_started" ? "not_started" : "pending";
    profile.onboardingStatus = "setup_incomplete";
    profile.operationalStatus = "setup_incomplete";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (!readinessPassed) {
    profile.readinessStatus = profile.readinessStatus === "failed" ? "failed" : "pending";
    profile.onboardingStatus = "readiness_pending";
    profile.operationalStatus = profile.trainingComplete ? "readiness_pending" : "training_pending";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (zoneStatus === "paused") {
    profile.readinessStatus = "passed";
    profile.onboardingStatus = "blocked";
    profile.operationalStatus = "blocked";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  } else if (zoneStatus === "live") {
    profile.readinessStatus = "passed";
    profile.onboardingStatus = "eligible_online";
    profile.operationalStatus = "live_enabled";
    profile.canGoOnline = true;
    profile.canReceiveOrders = true;
  } else {
    profile.readinessStatus = "passed";
    profile.onboardingStatus = "eligible_offline";
    profile.operationalStatus = "waiting_for_zone";
    profile.canGoOnline = false;
    profile.canReceiveOrders = false;
  }

  if (setupComplete && !profile.setupCompletedAt) {
    profile.setupCompletedAt = nowIso();
  }

  profile.updatedAt = nowIso();
  application.readinessStatus = profile.readinessStatus;
  application.operationalStatus =
    profile.operationalStatus === "inactive" || profile.operationalStatus === "waiting_for_zone" || profile.operationalStatus === "live_enabled"
      ? profile.operationalStatus === "live_enabled"
        ? "eligible_online"
        : "eligible_offline"
      : profile.operationalStatus;
  application.accountStatus = profile.accountStatus;
  application.updatedAt = nowIso();

  return buildResponse(store, profile, zone, pendingLegalDocuments, remainingSteps, requiredDocumentsApproved);
}

export function evaluateReadinessForProfile(
  store: OnboardingStore,
  profileId: string,
  pendingLegalDocuments: SetupStatusResponse["pendingLegalDocuments"] = [],
) {
  return evaluateSlyderOperationalEligibility(store, profileId, pendingLegalDocuments);
}

export function getSetupStatus(store: OnboardingStore, profile: SlyderProfile, pendingLegalDocuments: SetupStatusResponse["pendingLegalDocuments"] = []) {
  return evaluateSlyderOperationalEligibility(store, profile.id, pendingLegalDocuments);
}
