import type {
  DocumentType,
  OnboardingStore,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderProfile,
  StoredUser,
} from "@/types/backend/onboarding";

export type AdminActor = {
  id: string;
  fullName: string;
  roles?: string[];
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function courierNeedsVehicle(courierType: SlyderApplication["courierType"]) {
  return ["motorcycle", "car", "van", "other"].includes(courierType);
}

export function courierNeedsDriversLicense(courierType: SlyderApplication["courierType"]) {
  return ["motorcycle", "car", "van"].includes(courierType);
}

export function requiredDocumentTypesForApplication(application: SlyderApplication): DocumentType[] {
  const required: DocumentType[] = ["national_id", "profile_photo"];
  if (courierNeedsDriversLicense(application.courierType)) {
    required.push("drivers_license");
  }
  if (courierNeedsVehicle(application.courierType)) {
    required.push("registration", "insurance", "fitness");
  }
  return required;
}

export function getApplicationDocuments(store: OnboardingStore, applicationId: string): SlyderApplicationDocument[] {
  return store.documents.filter((item) => item.applicationId === applicationId);
}

export function hasAllRequiredDocumentRecords(store: OnboardingStore, application: SlyderApplication) {
  const docs = getApplicationDocuments(store, application.id);
  const required = requiredDocumentTypesForApplication(application);
  return required.every((type) => docs.some((doc) => doc.type === type));
}

export function hasAllRequiredDocumentApprovals(store: OnboardingStore, application: SlyderApplication) {
  const docs = getApplicationDocuments(store, application.id);
  const approved = new Set(
    docs.filter((item) => item.verificationStatus === "approved").map((item) => item.type),
  );
  return requiredDocumentTypesForApplication(application).every((type) => approved.has(type));
}

export function canApproveApplication(store: OnboardingStore, application: SlyderApplication) {
  if (application.applicationStatus === "rejected") {
    return { ok: false as const, reason: "Rejected applications cannot be approved" };
  }

  if (!application.agreementsAccepted.platformTermsAcceptance || !application.agreementsAccepted.privacyConsent) {
    return { ok: false as const, reason: "Required agreements are missing" };
  }

  if (!hasAllRequiredDocumentRecords(store, application)) {
    return { ok: false as const, reason: "Application is missing required documents" };
  }

  return { ok: true as const };
}

export function buildRemainingSetupSteps(
  store: OnboardingStore,
  application: SlyderApplication,
  profile: SlyderProfile,
) {
  const remainingSteps: string[] = [];

  if (!profile.contractAccepted) remainingSteps.push("accept_final_courier_terms");
  if (!profile.profileComplete) remainingSteps.push("complete_profile");
  if (courierNeedsVehicle(application.courierType) && !profile.vehicleVerified) {
    remainingSteps.push("vehicle_verification");
  }
  if (!profile.requiredAgreementsAccepted) remainingSteps.push("accept_required_agreements");
  if (!profile.payoutSetupComplete) remainingSteps.push("payout_setup");
  if (!profile.permissionsComplete) remainingSteps.push("permissions_acknowledgement");
  if (!profile.trainingComplete) remainingSteps.push("training_acknowledgement");
  if (!profile.readinessChecklist?.locationPermissionConfirmed || !profile.readinessChecklist?.notificationPermissionConfirmed) {
    remainingSteps.push("permissions_readiness");
  }
  if (!profile.readinessChecklist?.equipmentConfirmed) {
    remainingSteps.push("equipment_readiness");
  }
  if (!profile.readinessChecklist?.emergencyContactConfirmed) {
    remainingSteps.push("emergency_contact_confirmation");
  }
  if (!application.gpsConfirmed || !application.internetConfirmed || !profile.readinessChecklist?.profileConfirmed) {
    remainingSteps.push("readiness_confirmations");
  }

  const approvedTypes = new Set(
    getApplicationDocuments(store, application.id)
      .filter((item) => item.verificationStatus === "approved")
      .map((item) => item.type),
  );

  for (const documentType of requiredDocumentTypesForApplication(application)) {
    if (!approvedTypes.has(documentType)) {
      remainingSteps.push(`document_${documentType}`);
    }
  }

  return remainingSteps;
}

export function userCanAuthenticate(user: StoredUser) {
  return user.isEnabled && !["disabled", "suspended"].includes(user.accountStatus);
}
