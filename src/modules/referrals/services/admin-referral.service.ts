import crypto from "node:crypto";
import { readPersistenceStore } from "@/server/persistence";
import type { AdminReferralFilters, PublicSlyderReferral } from "@/types/backend/onboarding";
import {
  createReferralEvent,
  findReferralById,
  findRewardByReferralId,
  listReferrals as listReferralRows,
  listRewardAuditsByRewardId,
  updateReferral,
} from "@/modules/referrals/repositories/referral.repository";
import { createEarnedRewardForReferral } from "@/modules/referrals/services/referral-reward.service";

function nowIso() {
  return new Date().toISOString();
}

export async function listReferrals(filters?: AdminReferralFilters) {
  return listReferralRows(filters);
}

export async function getReferralDetail(id: string) {
  const referral = await findReferralById(id);
  if (!referral) return null;
  const reward = await findRewardByReferralId(referral.id);
  const audits = reward ? await listRewardAuditsByRewardId(reward.id) : [];
  return { referral, reward, audits };
}

export async function linkReferralToSlyderApplication(referralId: string, applicationId: string) {
  const referral = await findReferralById(referralId);
  if (!referral) throw new Error("Referral not found.");

  const store = await readPersistenceStore();
  const application = store.applications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Slyder application not found.");

  const linked: PublicSlyderReferral = {
    ...referral,
    linkedSlyderApplicationId: application.id,
    linkedSlyderProfileId: application.linkedSlyderProfileId,
    status: "application_completed",
    statusReason: undefined,
    applicationStartedAt: referral.applicationStartedAt || application.submittedAt,
    applicationCompletedAt: referral.applicationCompletedAt || application.submittedAt,
    updatedAt: nowIso(),
  };

  const updated = await updateReferral(linked);
  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "application_completed",
    title: "Referral linked to application",
    description: "Referral linked to a Slyder application.",
    metadata: { applicationId: application.id },
    createdAt: nowIso(),
  });

  return updated;
}

export async function markReferralDisqualified(
  referralId: string,
  reason: string,
  actor?: { id?: string; fullName?: string },
) {
  const referral = await findReferralById(referralId);
  if (!referral) throw new Error("Referral not found.");

  const updated = await updateReferral({
    ...referral,
    status: "disqualified",
    statusReason: actor?.fullName ? `${reason} (by ${actor.fullName})` : reason,
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "disqualified",
    title: "Referral disqualified",
    description: reason,
    metadata: actor?.id ? { actorId: actor.id } : undefined,
    createdAt: nowIso(),
  });

  return updated;
}

export async function markFirstDeliveryCompleted(
  referralId: string,
  actor?: { id?: string; fullName?: string; notes?: string },
) {
  const referral = await findReferralById(referralId);
  if (!referral) throw new Error("Referral not found.");

  await updateReferral({
    ...referral,
    status: "first_delivery_completed",
    statusReason: actor?.notes,
    firstDeliveryCompletedAt: nowIso(),
    updatedAt: nowIso(),
  });

  await createReferralEvent({
    id: crypto.randomUUID(),
    referralId: referral.id,
    eventType: "first_delivery_completed",
    title: "First delivery completed",
    description: actor?.notes || "Admin marked first delivery completed.",
    metadata: actor?.id ? { actorId: actor.id } : undefined,
    createdAt: nowIso(),
  });

  return createEarnedRewardForReferral(referral.id);
}
