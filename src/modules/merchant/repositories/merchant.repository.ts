import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type {
  MerchantApplication,
  MerchantApplicationFilters,
  MerchantIntegrationProfile,
  MerchantLead,
  MerchantLeadFilters,
  MerchantOnboardingEvent,
} from "@/types/backend/onboarding";

function matchesLeadFilters(lead: MerchantLead, filters?: MerchantLeadFilters) {
  if (!filters) return true;
  if (filters.status && lead.status !== filters.status) return false;
  if (filters.parish && lead.parish.toLowerCase() !== filters.parish.trim().toLowerCase()) return false;
  if (filters.productIntent && lead.productIntent !== filters.productIntent) return false;
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    const haystack = [lead.businessName, lead.contactName, lead.email, lead.phone, lead.town, lead.parish]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function matchesApplicationFilters(
  application: MerchantApplication,
  lead: MerchantLead | undefined,
  filters?: MerchantApplicationFilters,
) {
  if (!filters) return true;
  if (filters.approvalStatus && application.approvalStatus !== filters.approvalStatus) return false;
  if (filters.activationStatus && application.activationStatus !== filters.activationStatus) return false;
  if (filters.onboardingTrack && application.onboardingTrack !== filters.onboardingTrack) return false;
  if (filters.assignedAdminId && application.assignedAdminId !== filters.assignedAdminId) return false;
  if (filters.parish && lead?.parish.toLowerCase() !== filters.parish.trim().toLowerCase()) return false;
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    const haystack = [
      application.storeName,
      application.category,
      application.pickupAddress,
      lead?.businessName,
      lead?.contactName,
      lead?.email,
      lead?.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export async function createMerchantLead(lead: MerchantLead) {
  return withPersistenceTransaction((store) => {
    store.merchantLeads.push(lead);
    return lead;
  });
}

export async function updateMerchantLead(lead: MerchantLead) {
  return withPersistenceTransaction((store) => {
    const index = store.merchantLeads.findIndex((item) => item.id === lead.id);
    if (index < 0) throw new Error("Merchant lead not found.");
    store.merchantLeads[index] = lead;
    return lead;
  });
}

export async function findMerchantLeadById(id: string) {
  const store = await readPersistenceStore();
  return store.merchantLeads.find((item) => item.id === id) ?? null;
}

export async function findMerchantLeadByEmailOrPhone(email: string, phone: string) {
  const store = await readPersistenceStore();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  return (
    store.merchantLeads.find(
      (item) => item.email.trim().toLowerCase() === normalizedEmail || item.phone.trim() === normalizedPhone,
    ) ?? null
  );
}

export async function listMerchantLeads(filters?: MerchantLeadFilters) {
  const store = await readPersistenceStore();
  return [...store.merchantLeads]
    .filter((lead) => matchesLeadFilters(lead, filters))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createMerchantApplication(application: MerchantApplication) {
  return withPersistenceTransaction((store) => {
    store.merchantApplications.push(application);
    return application;
  });
}

export async function updateMerchantApplication(application: MerchantApplication) {
  return withPersistenceTransaction((store) => {
    const index = store.merchantApplications.findIndex((item) => item.id === application.id);
    if (index < 0) throw new Error("Merchant application not found.");
    store.merchantApplications[index] = application;
    return application;
  });
}

export async function findMerchantApplicationById(id: string) {
  const store = await readPersistenceStore();
  return store.merchantApplications.find((item) => item.id === id) ?? null;
}

export async function listMerchantApplications(filters?: MerchantApplicationFilters) {
  const store = await readPersistenceStore();
  return [...store.merchantApplications]
    .filter((application) => {
      const lead = store.merchantLeads.find((item) => item.id === application.merchantLeadId);
      return matchesApplicationFilters(application, lead, filters);
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createMerchantIntegrationProfile(profile: MerchantIntegrationProfile) {
  return withPersistenceTransaction((store) => {
    store.merchantIntegrationProfiles.push(profile);
    return profile;
  });
}

export async function updateMerchantIntegrationProfile(profile: MerchantIntegrationProfile) {
  return withPersistenceTransaction((store) => {
    const index = store.merchantIntegrationProfiles.findIndex((item) => item.id === profile.id);
    if (index < 0) throw new Error("Merchant integration profile not found.");
    store.merchantIntegrationProfiles[index] = profile;
    return profile;
  });
}

export async function findMerchantIntegrationProfileByApplicationId(merchantApplicationId: string) {
  const store = await readPersistenceStore();
  return store.merchantIntegrationProfiles.find((item) => item.merchantApplicationId === merchantApplicationId) ?? null;
}

export async function createMerchantOnboardingEvent(event: MerchantOnboardingEvent) {
  return withPersistenceTransaction((store) => {
    store.merchantOnboardingEvents.push(event);
    return event;
  });
}

export async function listMerchantOnboardingEventsByApplicationId(merchantApplicationId: string) {
  const store = await readPersistenceStore();
  return store.merchantOnboardingEvents
    .filter((item) => item.merchantApplicationId === merchantApplicationId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
