import crypto from "node:crypto";
import {
  createMerchantApplication as persistMerchantApplication,
  createMerchantIntegrationProfile,
  createMerchantOnboardingEvent,
  findMerchantApplicationById,
  findMerchantIntegrationProfileByApplicationId,
  findMerchantLeadById,
  listMerchantApplications,
  listMerchantOnboardingEventsByApplicationId,
  updateMerchantApplication,
  updateMerchantIntegrationProfile,
  updateMerchantLead,
} from "@/modules/merchant/repositories/merchant.repository";
import { findUserByEmailAndPhone, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import { determineMerchantOnboardingTrack } from "@/modules/merchant/services/merchant-routing.service";
import type {
  MerchantActivateInput,
  MerchantAssignAdminInput,
  MerchantRejectInput,
  GrabquikApplicationInput,
  SlydeMerchantApplicationInput,
} from "@/modules/merchant/schemas/merchant-application.schema";
import { sendMerchantActivationNotifications, sendMerchantApprovedNotification } from "@/server/notifications/notification.service";
import { withPersistenceTransaction } from "@/server/persistence";
import { generateOpaqueToken, hashToken } from "@/server/auth/tokens";
import { buildMerchantBusinessLicenseDefaults } from "@/modules/merchant-ops/services/merchant-business-license.service";
import type {
  MerchantApplication,
  MerchantApplicationFilters,
  MerchantIntegrationProfile,
  MerchantOnboardingEvent,
  MerchantNotificationPreference,
  MerchantTeamMember,
  StoredUser,
  UserRoleCode,
} from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function buildMerchantEvent(
  merchantApplicationId: string,
  eventType: string,
  actorType: string,
  notes?: string,
  actorId?: string,
) {
  return {
    id: crypto.randomUUID(),
    merchantApplicationId,
    eventType,
    actorType,
    actorId,
    notes,
    createdAt: nowIso(),
  };
}

async function appendMerchantEvent(
  merchantApplicationId: string,
  eventType: string,
  actorType: string,
  notes?: string,
  actorId?: string,
) {
  const event: MerchantOnboardingEvent = buildMerchantEvent(
    merchantApplicationId,
    eventType,
    actorType,
    notes,
    actorId,
  );

  return createMerchantOnboardingEvent(event);
}

async function provisionMerchantWorkspaceAccess(application: MerchantApplication, actorId?: string) {
  return withPersistenceTransaction(async (store) => {
    const lead = store.merchantLeads.find((item) => item.id === application.merchantLeadId);
    if (!lead) {
      throw new Error("Merchant lead not found for activation.");
    }

    const timestamp = nowIso();
    const existingUser =
      findUserByEmailAndPhone(store, lead.email, lead.phone) ??
      store.users.find((item) => item.email.toLowerCase() === lead.email.toLowerCase() || item.phone === lead.phone);

    if (existingUser && existingUser.userType !== "merchant" && !existingUser.roles.some((role) => role.startsWith("merchant_"))) {
      throw new Error("A non-merchant account already exists with this email or phone number.");
    }

    const isPaused = application.activationStatus === "paused";
    const needsActivationInvite = !existingUser?.passwordHash;
    const roles = Array.from(new Set<UserRoleCode>([...(existingUser?.roles ?? []), "merchant_owner"]));
    const user: StoredUser = existingUser
      ? {
          ...existingUser,
          fullName: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          roles,
          userType: "merchant",
          accountStatus: isPaused ? "suspended" : needsActivationInvite ? "activation_pending" : "active",
          isEnabled: !isPaused,
          activationIssuedAt: !isPaused && needsActivationInvite ? timestamp : existingUser.activationIssuedAt,
          updatedAt: timestamp,
        }
      : {
          id: crypto.randomUUID(),
          email: lead.email,
          phone: lead.phone,
          fullName: lead.contactName,
          roles,
          userType: "merchant",
          accountStatus: isPaused ? "suspended" : "activation_pending",
          isEnabled: !isPaused,
          activationIssuedAt: !isPaused ? timestamp : undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

    upsertUser(store, user);

    const memberIndex = store.merchantTeamMembers.findIndex(
      (item) => item.merchantId === application.id && item.userId === user.id,
    );
    const member: MerchantTeamMember = {
      id: memberIndex >= 0 ? store.merchantTeamMembers[memberIndex].id : crypto.randomUUID(),
      merchantId: application.id,
      userId: user.id,
      role: "merchant_owner",
      status: isPaused ? "disabled" : "active",
      invitedAt: memberIndex >= 0 ? store.merchantTeamMembers[memberIndex].invitedAt : timestamp,
      joinedAt: isPaused ? store.merchantTeamMembers[memberIndex]?.joinedAt : timestamp,
      createdAt: memberIndex >= 0 ? store.merchantTeamMembers[memberIndex].createdAt : timestamp,
      updatedAt: timestamp,
    };

    if (memberIndex >= 0) {
      store.merchantTeamMembers[memberIndex] = member;
    } else {
      store.merchantTeamMembers.push(member);
    }

    const preferenceIndex = store.merchantNotificationPreferences.findIndex((item) => item.merchantId === application.id);
    const preference: MerchantNotificationPreference = {
      id:
        preferenceIndex >= 0
          ? store.merchantNotificationPreferences[preferenceIndex].id
          : crypto.randomUUID(),
      merchantId: application.id,
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: true,
      notifyOnAssigned: true,
      notifyOnDelivered: true,
      notifyOnFailed: true,
      notifyOnBilling: true,
      createdAt:
        preferenceIndex >= 0
          ? store.merchantNotificationPreferences[preferenceIndex].createdAt
          : timestamp,
      updatedAt: timestamp,
    };

    if (preferenceIndex >= 0) {
      store.merchantNotificationPreferences[preferenceIndex] = preference;
    } else {
      store.merchantNotificationPreferences.push(preference);
    }

    let activationToken: string | undefined;
    if (!isPaused && needsActivationInvite) {
      for (const token of store.activationTokens.filter((item) => item.userId === user.id && !item.consumedAt)) {
        token.status = "revoked";
        token.updatedAt = timestamp;
      }

      activationToken = generateOpaqueToken(24);
      store.activationTokens.push({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash: hashToken(activationToken),
        deliveryChannel: "email",
        status: "issued",
        issuedAt: timestamp,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    store.merchantOnboardingEvents.push(
      buildMerchantEvent(
        application.id,
        isPaused ? "workspace_paused" : needsActivationInvite ? "workspace_activation_invited" : "workspace_access_provisioned",
        "admin_user",
        isPaused
          ? "Merchant workspace access was suspended."
          : needsActivationInvite
            ? `Merchant workspace activation invite prepared for ${lead.email}.`
            : `Merchant workspace owner access is active for ${lead.email}.`,
        actorId,
      ),
    );

    return { user, member, preference, activationToken };
  });
}

async function findProvisionedMerchantUser(application: MerchantApplication) {
  return withPersistenceTransaction((store) => {
    const lead = store.merchantLeads.find((item) => item.id === application.merchantLeadId);
    if (!lead) {
      throw new Error("Merchant lead not found for activation.");
    }

    const user =
      findUserByEmailAndPhone(store, lead.email, lead.phone) ??
      store.users.find(
        (item) =>
          item.userType === "merchant" &&
          item.roles.some((role) => role.startsWith("merchant_")) &&
          (item.email.toLowerCase() === lead.email.toLowerCase() || item.phone === lead.phone),
      );

    return { lead, user };
  });
}

export async function createGrabquikMerchantApplication(input: GrabquikApplicationInput) {
  const lead = await findMerchantLeadById(input.merchantLeadId);
  if (!lead) throw new Error("Merchant lead not found.");

  const existing = (await listMerchantApplications()).find((item) => item.merchantLeadId === lead.id);
  if (existing) return existing;

  const timestamp = nowIso();
  const application: MerchantApplication = {
    id: crypto.randomUUID(),
    merchantLeadId: lead.id,
    onboardingTrack: determineMerchantOnboardingTrack({ requestedTrack: input.onboardingTrack, lead }),
    storeName: input.storeName.trim(),
    logoUrl: input.logoUrl?.trim() || undefined,
    businessDescription: input.businessDescription.trim(),
    category: input.category.trim(),
    pickupAddress: input.pickupAddress.trim(),
    serviceAreas: input.serviceAreas,
    fulfillmentMode: input.fulfillmentMode.trim(),
    catalogReady: input.catalogReady,
    payoutDetails: input.payoutDetails,
    operatingHours: input.operatingHours,
    documentStatus: "not_started",
    legalStatus: input.legalAccepted ? "accepted" : "pending",
    approvalStatus: "pending",
    activationStatus: "pending",
    ...buildMerchantBusinessLicenseDefaults({ createdAt: timestamp }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const created = await persistMerchantApplication(application);
  await updateMerchantLead({
    ...lead,
    status: "reviewing",
    updatedAt: timestamp,
  });
  await appendMerchantEvent(created.id, "application_created", "merchant_user", "GrabQuik onboarding application submitted.", lead.id);
  return created;
}

export async function createSlydeMerchantApplication(input: SlydeMerchantApplicationInput) {
  const lead = await findMerchantLeadById(input.merchantLeadId);
  if (!lead) throw new Error("Merchant lead not found.");

  const existing = (await listMerchantApplications()).find((item) => item.merchantLeadId === lead.id);
  if (existing) return existing;

  const timestamp = nowIso();
  const application: MerchantApplication = {
    id: crypto.randomUUID(),
    merchantLeadId: lead.id,
    onboardingTrack: determineMerchantOnboardingTrack({ requestedTrack: input.onboardingTrack, lead }),
    category: lead.category,
    pickupAddress: input.pickupAddress.trim(),
    serviceAreas: input.serviceAreas,
    fulfillmentMode: input.fulfillmentMode?.trim() || undefined,
    documentStatus: "not_started",
    legalStatus: "pending",
    approvalStatus: "pending",
    activationStatus: "pending",
    ...buildMerchantBusinessLicenseDefaults({ createdAt: timestamp }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const integrationProfile: MerchantIntegrationProfile = {
    id: crypto.randomUUID(),
    merchantApplicationId: application.id,
    dispatchMode: input.dispatchMode,
    acceptsCOD: input.acceptsCOD,
    averageBasketSize: input.averageOrderSize?.trim() || undefined,
    packageTypes: input.packageTypes,
    operatingHours: input.operatingHours,
    orderSources: input.orderSources,
    pickupLocations: input.pickupLocations,
    deliveryRadius: input.deliveryRadius.trim(),
    sameDaySupported: input.sameDaySupported,
    scheduledSupported: input.scheduledSupported,
    integrationReadiness: "in_progress",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const created = await persistMerchantApplication(application);
  await createMerchantIntegrationProfile(integrationProfile);
  await updateMerchantLead({
    ...lead,
    status: "reviewing",
    updatedAt: timestamp,
  });
  await appendMerchantEvent(created.id, "application_created", "merchant_user", "SLYDE delivery onboarding application submitted.", lead.id);
  return created;
}

export async function listMerchantApplicationRows(filters?: MerchantApplicationFilters) {
  return listMerchantApplications(filters);
}

export async function getMerchantApplicationDetail(id: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) return null;
  const lead = await findMerchantLeadById(application.merchantLeadId);
  const integrationProfile = await findMerchantIntegrationProfileByApplicationId(application.id);
  const events = await listMerchantOnboardingEventsByApplicationId(application.id);

  return {
    application,
    lead,
    integrationProfile,
    events,
  };
}

export async function assignMerchantApplicationAdmin(id: string, input: MerchantAssignAdminInput, actorId?: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) throw new Error("Merchant application not found.");

  const updated = await updateMerchantApplication({
    ...application,
    assignedAdminId: input.assignedAdminId,
    updatedAt: nowIso(),
  });
  await appendMerchantEvent(id, "admin_assigned", "admin_user", "Merchant application assigned to admin.", actorId);
  return updated;
}

export async function approveMerchantApplication(id: string, actorId?: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) throw new Error("Merchant application not found.");

  const lead = await findMerchantLeadById(application.merchantLeadId);
  const timestamp = nowIso();
  const updated = await updateMerchantApplication({
    ...application,
    approvalStatus: "approved",
    documentStatus: application.documentStatus === "not_started" ? "pending" : application.documentStatus,
    legalStatus: application.legalStatus === "pending" ? "accepted" : application.legalStatus,
    updatedAt: timestamp,
  });

  if (lead) {
    await updateMerchantLead({
      ...lead,
      status: "qualified",
      updatedAt: timestamp,
    });
  }

  await appendMerchantEvent(id, "application_approved", "admin_user", "Merchant application approved.", actorId);
  await withPersistenceTransaction((store) => sendMerchantApprovedNotification(store, updated.id));
  return updated;
}

export async function rejectMerchantApplication(id: string, input: MerchantRejectInput, actorId?: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) throw new Error("Merchant application not found.");

  const lead = await findMerchantLeadById(application.merchantLeadId);
  const timestamp = nowIso();
  const updated = await updateMerchantApplication({
    ...application,
    approvalStatus: "rejected",
    activationStatus: "paused",
    updatedAt: timestamp,
  });

  if (lead) {
    await updateMerchantLead({
      ...lead,
      status: "rejected",
      notes: input.notes,
      updatedAt: timestamp,
    });
  }

  await appendMerchantEvent(id, "application_rejected", "admin_user", input.notes, actorId);
  return updated;
}

export async function activateMerchantApplication(id: string, input: MerchantActivateInput, actorId?: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) throw new Error("Merchant application not found.");
  if (application.approvalStatus !== "approved") {
    throw new Error("Merchant application must be approved before activation.");
  }

  const timestamp = nowIso();
  const businessLicenseDefaults = buildMerchantBusinessLicenseDefaults(application);
  const shouldResetBusinessLicenseGraceWindow =
    ["activated", "live"].includes(input.activationStatus) &&
    application.activationStatus === "pending" &&
    businessLicenseDefaults.businessLicenseStatus !== "verified" &&
    !businessLicenseDefaults.businessLicenseSubmittedAt;
  const updated = await updateMerchantApplication({
    ...application,
    activationStatus: input.activationStatus,
    ...businessLicenseDefaults,
    businessLicenseGraceEndsAt: shouldResetBusinessLicenseGraceWindow
      ? addDaysIso(timestamp, 30)
      : businessLicenseDefaults.businessLicenseGraceEndsAt,
    updatedAt: timestamp,
  });

  const integrationProfile = await findMerchantIntegrationProfileByApplicationId(id);
  if (integrationProfile) {
    await updateMerchantIntegrationProfile({
      ...integrationProfile,
      integrationReadiness: input.activationStatus === "live" ? "ready" : integrationProfile.integrationReadiness,
      updatedAt: timestamp,
    });
  }

  await appendMerchantEvent(
    id,
    `application_${input.activationStatus}`,
    "admin_user",
    input.notes || `Merchant application moved to ${input.activationStatus}.`,
    actorId,
  );
  const workspaceProvision = await provisionMerchantWorkspaceAccess(updated, actorId);

  if (input.activationStatus === "activated" || input.activationStatus === "live") {
    const notifications = await withPersistenceTransaction((store) =>
      sendMerchantActivationNotifications(store, updated.id, workspaceProvision.activationToken),
    );
    if (notifications.length) {
      await appendMerchantEvent(
        id,
        "activation_notifications_sent",
        "system_internal",
        `Merchant activation notifications were sent through ${notifications.map((item) => item.channel).join(", ")}.`,
        actorId,
      );
    }
  }

  return updated;
}

export async function resendMerchantActivation(id: string, actorId?: string) {
  const application = await findMerchantApplicationById(id);
  if (!application) throw new Error("Merchant application not found.");
  if (application.approvalStatus !== "approved") {
    throw new Error("Merchant application must be approved before activation can be resent.");
  }
  if (!["activated", "live"].includes(application.activationStatus)) {
    throw new Error("Merchant activation can only be resent after the application has been activated.");
  }

  const { user: existingUser } = await findProvisionedMerchantUser(application);
  const alreadyHasPassword = Boolean(existingUser?.passwordHash);
  if (alreadyHasPassword) {
    throw new Error("This merchant already set a password. Use merchant login or a future reset-password flow instead.");
  }

  const workspaceProvision = await provisionMerchantWorkspaceAccess(application, actorId);
  if (!workspaceProvision.activationToken) {
    throw new Error("A new merchant activation link could not be issued for this application.");
  }

  const resendMarker = nowIso();
  const notifications = await withPersistenceTransaction((store) =>
    sendMerchantActivationNotifications(store, application.id, workspaceProvision.activationToken, {
      force: true,
      dedupeSuffix: resendMarker,
    }),
  );

  if (!notifications.length) {
    throw new Error("No merchant activation notifications were sent.");
  }

  await appendMerchantEvent(
    id,
    "activation_notifications_resent",
    "admin_user",
    `Merchant activation notifications were resent through ${notifications.map((item) => item.channel).join(", ")}.`,
    actorId,
  );

  return {
    applicationId: application.id,
    notifications,
  };
}
