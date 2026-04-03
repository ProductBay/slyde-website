import crypto from "node:crypto";
import {
  createMerchantOnboardingEvent,
  findMerchantApplicationById,
  updateMerchantApplication,
} from "@/modules/merchant/repositories/merchant.repository";
import { listMerchantDeliveriesForMerchant } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import type { MerchantApplication, MerchantBusinessLicenseStatus } from "@/types/backend/onboarding";

const BUSINESS_LICENSE_GRACE_DAYS = 30;
const BUSINESS_LICENSE_DELIVERY_LIMIT = 10;

function nowIso() {
  return new Date().toISOString();
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function businessLicenseEvent(
  merchantApplicationId: string,
  eventType: string,
  notes: string,
  actorType = "system_internal",
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

export function buildMerchantBusinessLicenseDefaults(
  application: Pick<MerchantApplication, "createdAt"> & Partial<MerchantApplication>,
) {
  const graceReference = application.businessLicenseGraceEndsAt ?? addDays(application.createdAt, BUSINESS_LICENSE_GRACE_DAYS);

  return {
    businessLicenseStatus: application.businessLicenseStatus ?? ("missing" as MerchantBusinessLicenseStatus),
    businessLicenseNumber: application.businessLicenseNumber ?? undefined,
    businessLicenseSubmittedAt: application.businessLicenseSubmittedAt ?? undefined,
    businessLicenseVerifiedAt: application.businessLicenseVerifiedAt ?? undefined,
    businessLicenseGraceEndsAt: graceReference,
    businessLicenseRequiredAfterDeliveries:
      application.businessLicenseRequiredAfterDeliveries ?? BUSINESS_LICENSE_DELIVERY_LIMIT,
    businessLicenseDisabledAt: application.businessLicenseDisabledAt ?? undefined,
  };
}

export async function getMerchantBusinessLicenseCompliance(merchantId: string) {
  const application = await findMerchantApplicationById(merchantId);
  if (!application) {
    throw new Error("Merchant application not found.");
  }

  const normalized = { ...application, ...buildMerchantBusinessLicenseDefaults(application) };
  const deliveries = await listMerchantDeliveriesForMerchant(merchantId);
  const completedDeliveries = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const deliveriesRemaining = Math.max(0, normalized.businessLicenseRequiredAfterDeliveries - completedDeliveries);
  const graceEndsAt = normalized.businessLicenseGraceEndsAt;
  const msRemaining = graceEndsAt ? new Date(graceEndsAt).getTime() - Date.now() : 0;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const submissionSatisfied =
    normalized.businessLicenseStatus === "submitted" || normalized.businessLicenseStatus === "verified";
  const thresholdReached =
    Boolean(graceEndsAt && new Date(graceEndsAt).getTime() <= Date.now()) ||
    completedDeliveries >= normalized.businessLicenseRequiredAfterDeliveries;
  const isRestricted = !submissionSatisfied && thresholdReached;

  return {
    application: normalized,
    completedDeliveries,
    deliveriesRemaining,
    graceEndsAt,
    daysRemaining,
    thresholdReached,
    isRestricted,
    submissionSatisfied,
  };
}

export async function enforceMerchantBusinessLicenseCompliance(merchantId: string) {
  const compliance = await getMerchantBusinessLicenseCompliance(merchantId);
  if (!compliance.isRestricted) {
    return compliance;
  }

  if (compliance.application.businessLicenseStatus !== "overdue") {
    const timestamp = nowIso();
    await updateMerchantApplication({
      ...compliance.application,
      businessLicenseStatus: "overdue",
      businessLicenseDisabledAt: compliance.application.businessLicenseDisabledAt ?? timestamp,
      updatedAt: timestamp,
    });
    await createMerchantOnboardingEvent(
      businessLicenseEvent(
        merchantId,
        "business_license_overdue",
        "Merchant workspace was restricted because the COJ business license details were not submitted before the 30-day or 10-delivery grace threshold.",
      ),
    );
  }

  return {
    ...compliance,
    application: {
      ...compliance.application,
      businessLicenseStatus: "overdue" as const,
      businessLicenseDisabledAt: compliance.application.businessLicenseDisabledAt ?? nowIso(),
    },
  };
}

export async function submitMerchantBusinessLicense(merchantId: string, businessLicenseNumber: string) {
  const application = await findMerchantApplicationById(merchantId);
  if (!application) {
    throw new Error("Merchant application not found.");
  }

  const timestamp = nowIso();
  const normalized = { ...application, ...buildMerchantBusinessLicenseDefaults(application) };
  const updated = await updateMerchantApplication({
    ...normalized,
    businessLicenseNumber: businessLicenseNumber.trim(),
    businessLicenseStatus: normalized.businessLicenseStatus === "verified" ? "verified" : "submitted",
    businessLicenseSubmittedAt: timestamp,
    businessLicenseDisabledAt: undefined,
    updatedAt: timestamp,
  });

  await createMerchantOnboardingEvent(
    businessLicenseEvent(
      merchantId,
      "business_license_submitted",
      `Merchant submitted COJ business license credentials${normalized.businessLicenseStatus === "overdue" ? " after restriction" : ""}.`,
      "merchant_user",
    ),
  );

  return updated;
}

export async function verifyMerchantBusinessLicense(merchantId: string, actorId?: string) {
  const application = await findMerchantApplicationById(merchantId);
  if (!application) {
    throw new Error("Merchant application not found.");
  }

  const normalized = { ...application, ...buildMerchantBusinessLicenseDefaults(application) };
  if (!normalized.businessLicenseNumber?.trim()) {
    throw new Error("Merchant has not submitted business license credentials yet.");
  }

  const timestamp = nowIso();
  const updated = await updateMerchantApplication({
    ...normalized,
    businessLicenseStatus: "verified",
    businessLicenseVerifiedAt: timestamp,
    businessLicenseDisabledAt: undefined,
    updatedAt: timestamp,
  });

  await createMerchantOnboardingEvent(
    businessLicenseEvent(
      merchantId,
      "business_license_verified",
      "Merchant COJ business license credentials were validated by admin.",
      "admin_user",
      actorId,
    ),
  );

  return updated;
}
