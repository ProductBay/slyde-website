import type {
  EmployeeProfile,
  OnboardingStore,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderApplicationVehicle,
  SlyderProfile,
  StoredUser,
} from "@/types/backend/onboarding";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";

export function findApplication(store: OnboardingStore, applicationId: string) {
  return store.applications.find((item) => item.id === applicationId);
}

export function findApplicationByCode(store: OnboardingStore, applicationCode: string) {
  return store.applications.find((item) => item.applicationCode === applicationCode);
}

export function findUserByEmailOrPhone(store: OnboardingStore, identifier: string) {
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedPhone = normalizePhone(identifier);
  return store.users.find(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail || normalizePhone(user.phone) === normalizedPhone,
  );
}

export function findUserByEmailAndPhone(store: OnboardingStore, email: string, phone: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  return store.users.find(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail ||
      normalizePhone(user.phone) === normalizedPhone,
  );
}

export function findUserById(store: OnboardingStore, userId: string) {
  return store.users.find((item) => item.id === userId);
}

export function findProfileByApplicationId(store: OnboardingStore, applicationId: string) {
  return store.slyderProfiles.find((item) => item.applicationId === applicationId);
}

export function findProfileByUserId(store: OnboardingStore, userId: string) {
  return store.slyderProfiles.find((item) => item.userId === userId);
}

export function findEmployeeProfileByUserId(store: OnboardingStore, userId: string) {
  return store.employeeProfiles.find((item) => item.userId === userId);
}

export function upsertEmployeeProfile(store: OnboardingStore, profile: EmployeeProfile) {
  const existingIndex = store.employeeProfiles.findIndex((item) => item.id === profile.id);
  if (existingIndex >= 0) {
    store.employeeProfiles[existingIndex] = profile;
    return;
  }
  store.employeeProfiles.push(profile);
}

export function listApplicationDocuments(store: OnboardingStore, applicationId: string): SlyderApplicationDocument[] {
  return store.documents.filter((item) => item.applicationId === applicationId);
}

export function getApplicationVehicle(store: OnboardingStore, applicationId: string): SlyderApplicationVehicle | undefined {
  return store.vehicles.find((item) => item.applicationId === applicationId);
}

export function attachApplication(
  store: OnboardingStore,
  application: SlyderApplication,
  vehicle: SlyderApplicationVehicle | undefined,
  documents: SlyderApplicationDocument[],
) {
  store.applications.push(application);
  if (vehicle) {
    store.vehicles.push(vehicle);
  }
  store.documents.push(...documents);
}

export function upsertUser(store: OnboardingStore, user: StoredUser) {
  const existingIndex = store.users.findIndex((item) => item.id === user.id);
  if (existingIndex >= 0) {
    store.users[existingIndex] = user;
    return;
  }
  store.users.push(user);
}

export function upsertSlyderProfile(store: OnboardingStore, profile: SlyderProfile) {
  const existingIndex = store.slyderProfiles.findIndex((item) => item.id === profile.id);
  if (existingIndex >= 0) {
    store.slyderProfiles[existingIndex] = profile;
    return;
  }
  store.slyderProfiles.push(profile);
}

export function findLatestActivationTokenForUser(store: OnboardingStore, userId: string) {
  return [...store.activationTokens]
    .filter((item) => item.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}
