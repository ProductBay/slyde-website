import { appendAuditEvent } from "@/server/audit/audit.service";
import { onMerchantInterestSubmitted } from "@/server/notifications/notification.service";
import { withStoreTransaction } from "@/server/persistence/store";
import { recordMultipleLegalAcceptances, hasAcceptedCurrentVersion } from "@/modules/legal/services/legal-document.service";
import type { LegalDocumentType, MerchantInterestRecord } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

function deriveZoneName(coverageNeeds: string) {
  return coverageNeeds.split(",")[0]?.trim() || coverageNeeds.trim();
}

function deriveZoneId(coverageNeeds: string) {
  return deriveZoneName(coverageNeeds).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createMerchantInterest(input: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  deliveryVolume: string;
  coverageNeeds: string;
  goals: string;
  legal: {
    accuracyConfirmed: boolean;
    contactConsent: boolean;
    noGuaranteeAcknowledgement: boolean;
    acceptedDocumentTypes: LegalDocumentType[];
  };
  ipAddress?: string;
  userAgent?: string;
}) {
  if (!input.legal.accuracyConfirmed) throw new Error("Merchant accuracy confirmation is required.");
  if (!input.legal.contactConsent) throw new Error("Merchant contact consent is required.");
  if (!input.legal.noGuaranteeAcknowledgement) throw new Error("Merchant onboarding acknowledgement is required.");

  const timestamp = nowIso();
  const record = await withStoreTransaction(async (store) => {
    const existing = store.merchantInterests.find(
      (item) =>
        item.email.toLowerCase() === input.email.toLowerCase() &&
        item.companyName.toLowerCase() === input.companyName.toLowerCase() &&
        item.lifecycleStatus !== "declined",
    );

    if (existing) {
      existing.updatedAt = timestamp;
      return existing;
    }

    const interest: MerchantInterestRecord = {
      id: crypto.randomUUID(),
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      businessType: input.businessType,
      deliveryVolume: input.deliveryVolume,
      coverageNeeds: input.coverageNeeds,
      goals: input.goals,
      zoneId: deriveZoneId(input.coverageNeeds),
      zoneName: deriveZoneName(input.coverageNeeds),
      lifecycleStatus: "submitted",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.merchantInterests.push(interest);
    appendAuditEvent(store, {
      entityType: "application",
      entityId: interest.id,
      eventType: "merchant_interest_submitted",
      metadata: {
        companyName: interest.companyName,
        zoneName: interest.zoneName,
      },
    });

    await onMerchantInterestSubmitted(store, interest.id);

    return interest;
  });

  const acceptances = await recordMultipleLegalAcceptances({
    actorType: "merchant_interest",
    actorId: record.id,
    context: "merchant_interest",
    acceptanceSource: "website_form",
    acceptedDocumentTypes: input.legal.acceptedDocumentTypes,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: {
      companyName: record.companyName,
      zoneName: record.zoneName,
    },
  });

  return {
    merchantInterestId: record.id,
    lifecycleStatus: record.lifecycleStatus,
    legalAccepted:
      (await hasAcceptedCurrentVersion("merchant_interest", record.id, "merchant_privacy_notice")) &&
      (await hasAcceptedCurrentVersion("merchant_interest", record.id, "merchant_interest_terms")),
    acceptedDocuments: acceptances.map((item) => ({
      documentType: item.documentType,
      version: item.documentVersion,
    })),
    zoneName: record.zoneName,
  };
}
