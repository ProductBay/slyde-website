import crypto from "node:crypto";
import type { SlyderApplication, SlyderProfile } from "@/types/backend/onboarding";
import { createReferralEvent, findReferralByReferredPhone, updateReferral } from "@/modules/referrals/repositories/referral.repository";

function nowIso() {
  return new Date().toISOString();
}

export async function syncReferralForApplicationCreated(application: SlyderApplication) {
  const referral = await findReferralByReferredPhone(application.phone);
  if (!referral || referral.linkedSlyderApplicationId) return null;

  const updated = await updateReferral({
    ...referral,
    linkedSlyderApplicationId: application.id,
    status: "application_completed",
    applicationStartedAt: referral.applicationStartedAt || application.submittedAt,
    applicationCompletedAt: referral.applicationCompletedAt || application.submittedAt,
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "application_completed",
    title: "Application completed",
    description: "Referred driver completed an application.",
    metadata: { applicationId: application.id },
    createdAt: nowIso(),
  });

  return updated;
}

export async function syncReferralForApplicationApproved(application: SlyderApplication) {
  const referral = await findReferralByReferredPhone(application.phone);
  if (!referral) return null;

  const updated = await updateReferral({
    ...referral,
    linkedSlyderApplicationId: referral.linkedSlyderApplicationId || application.id,
    linkedSlyderProfileId: referral.linkedSlyderProfileId || application.linkedSlyderProfileId,
    status: "approved",
    approvedAt: referral.approvedAt || nowIso(),
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "approved",
    title: "Application approved",
    description: "Referred driver application was approved.",
    metadata: {
      applicationId: application.id,
      profileId: application.linkedSlyderProfileId,
    },
    createdAt: nowIso(),
  });

  return updated;
}

export async function syncReferralForActivation(profile: SlyderProfile) {
  const referral = await findReferralByReferredPhone(profile.phone);
  if (!referral) return null;

  const updated = await updateReferral({
    ...referral,
    linkedSlyderProfileId: referral.linkedSlyderProfileId || profile.id,
    status: "activated",
    activatedAt: referral.activatedAt || profile.activatedAt || nowIso(),
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "activated",
    title: "Driver activated",
    description: "Referred driver account was activated.",
    metadata: { profileId: profile.id },
    createdAt: nowIso(),
  });

  return updated;
}

export async function syncReferralForReadiness(profile: SlyderProfile) {
  const referral = await findReferralByReferredPhone(profile.phone);
  if (!referral) return null;

  const updated = await updateReferral({
    ...referral,
    linkedSlyderProfileId: referral.linkedSlyderProfileId || profile.id,
    status: "ready",
    readyAt: referral.readyAt || nowIso(),
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "ready",
    title: "Driver ready",
    description: "Referred driver reached readiness.",
    metadata: { profileId: profile.id },
    createdAt: nowIso(),
  });

  return updated;
}
