import {
  ensureMerchantNotificationPreference,
  findMerchantWorkspaceById,
  setMerchantDefaultAddress,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { createMerchantOnboardingEvent } from "@/modules/merchant/repositories/merchant.repository";
import {
  getMerchantBusinessLicenseCompliance,
  submitMerchantBusinessLicense,
} from "@/modules/merchant-ops/services/merchant-business-license.service";
import { withPersistenceTransaction } from "@/server/persistence";
import type { MerchantSettingsUpdateInput } from "@/types/backend/onboarding";
import crypto from "node:crypto";

function uniqueChanges(values: string[]) {
  return Array.from(new Set(values));
}

export async function getMerchantSettings(merchantId: string) {
  const preference = await ensureMerchantNotificationPreference(merchantId);
  const workspace = await findMerchantWorkspaceById(merchantId);
  const compliance = await getMerchantBusinessLicenseCompliance(merchantId);
  if (!workspace) {
    throw new Error("Merchant workspace not found");
  }
  return {
    application: workspace.application,
    lead: workspace.lead,
    preference,
    integrationProfile: workspace.integrationProfile,
    compliance,
  };
}

export async function updateMerchantSettings(merchantId: string, input: MerchantSettingsUpdateInput) {
  if (input.defaultPickupLocationId) {
    await setMerchantDefaultAddress(merchantId, input.defaultPickupLocationId);
  }

  if (input.businessLicenseNumber?.trim()) {
    await submitMerchantBusinessLicense(merchantId, input.businessLicenseNumber);
  }

  const onboardingChanges: string[] = [];
  const workspace = await withPersistenceTransaction((store) => {
    const applicationIndex = store.merchantApplications.findIndex((item) => item.id === merchantId);
    if (applicationIndex < 0) {
      throw new Error("Merchant workspace not found");
    }

    const application = store.merchantApplications[applicationIndex];
    const leadIndex = store.merchantLeads.findIndex((item) => item.id === application.merchantLeadId);
    const lead = leadIndex >= 0 ? store.merchantLeads[leadIndex] : null;
    const preferenceIndex = store.merchantNotificationPreferences.findIndex((item) => item.merchantId === merchantId);
    const profileIndex = store.merchantIntegrationProfiles.findIndex((item) => item.merchantApplicationId === merchantId);
    const timestamp = new Date().toISOString();
    const preference =
      preferenceIndex >= 0
        ? store.merchantNotificationPreferences[preferenceIndex]
        : {
            id: crypto.randomUUID(),
            merchantId,
            emailEnabled: true,
            smsEnabled: false,
            whatsappEnabled: true,
            notifyOnAssigned: true,
            notifyOnDelivered: true,
            notifyOnFailed: true,
            notifyOnBilling: true,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
    const nextApplication = {
      ...application,
      storeName: input.storeName?.trim() || application.storeName,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl.trim() || undefined : application.logoUrl,
      heroBannerUrl: input.heroBannerUrl !== undefined ? input.heroBannerUrl.trim() || undefined : application.heroBannerUrl,
      heroBannerPosition: input.heroBannerPosition ?? application.heroBannerPosition,
      businessDescription: input.businessDescription?.trim() || application.businessDescription,
      category: input.category?.trim() || application.category,
      pickupAddress: input.pickupAddress?.trim() || application.pickupAddress,
      serviceAreas: input.serviceAreas?.length ? input.serviceAreas : application.serviceAreas,
      fulfillmentMode: input.fulfillmentMode?.trim() || application.fulfillmentMode,
      operatingHours:
        input.operatingHours && Object.values(input.operatingHours).some(Boolean)
          ? {
              days: input.operatingHours.days ?? [],
              openTime: input.operatingHours.openTime ?? undefined,
              closeTime: input.operatingHours.closeTime ?? undefined,
              summary:
                input.operatingHours.summary ??
                ([input.operatingHours.openTime, input.operatingHours.closeTime].filter(Boolean).join(" - ") || undefined),
            }
          : application.operatingHours,
      payoutDetails: {
        ...(application.payoutDetails ?? {}),
        defaultDeliveryInstruction:
          input.defaultDeliveryInstruction !== undefined
            ? input.defaultDeliveryInstruction
            : (application.payoutDetails as Record<string, unknown> | undefined)?.defaultDeliveryInstruction,
      },
      updatedAt: timestamp,
    };

    if ((input.businessName?.trim() || "") && input.businessName?.trim() !== lead?.businessName) onboardingChanges.push("business name");
    if ((input.contactName?.trim() || "") && input.contactName?.trim() !== lead?.contactName) onboardingChanges.push("primary contact");
    if ((input.email?.trim() || "") && input.email?.trim() !== lead?.email) onboardingChanges.push("email");
    if ((input.phone?.trim() || "") && input.phone?.trim() !== lead?.phone) onboardingChanges.push("phone");
    if ((input.parish?.trim() || "") && input.parish?.trim() !== lead?.parish) onboardingChanges.push("parish");
    if ((input.town?.trim() || "") && input.town?.trim() !== lead?.town) onboardingChanges.push("town");
    if ((input.category?.trim() || "") && input.category?.trim() !== (lead?.category ?? application.category)) onboardingChanges.push("business category");
    if ((input.instagramHandle?.trim() || "") && input.instagramHandle?.trim() !== lead?.instagramHandle) onboardingChanges.push("Instagram handle");
    if ((input.website?.trim() || "") && input.website?.trim() !== lead?.website) onboardingChanges.push("website");
    if (input.orderChannels?.length && JSON.stringify(input.orderChannels) !== JSON.stringify(lead?.orderChannels ?? [])) onboardingChanges.push("order channels");
    if ((input.averageDailyOrders?.trim() || "") && input.averageDailyOrders?.trim() !== lead?.averageDailyOrders) onboardingChanges.push("average daily orders");
    if ((input.currentDeliveryMethod?.trim() || "") && input.currentDeliveryMethod?.trim() !== lead?.currentDeliveryMethod) onboardingChanges.push("current delivery method");
    if ((input.preferredStartTimeline?.trim() || "") && input.preferredStartTimeline?.trim() !== lead?.preferredStartTimeline) onboardingChanges.push("preferred start timeline");
    if ((input.storeName?.trim() || "") && input.storeName?.trim() !== application.storeName) onboardingChanges.push("storefront name");
    if (input.logoUrl !== undefined && input.logoUrl.trim() !== (application.logoUrl ?? "")) onboardingChanges.push("logo");
    if (input.heroBannerUrl !== undefined && input.heroBannerUrl.trim() !== (application.heroBannerUrl ?? "")) onboardingChanges.push("workspace hero banner");
    if (input.heroBannerPosition !== undefined && input.heroBannerPosition !== (application.heroBannerPosition ?? "center")) onboardingChanges.push("hero banner focal point");
    if ((input.businessDescription?.trim() || "") && input.businessDescription?.trim() !== application.businessDescription) onboardingChanges.push("business description");
    if ((input.pickupAddress?.trim() || "") && input.pickupAddress?.trim() !== application.pickupAddress) onboardingChanges.push("pickup address");
    if (input.serviceAreas?.length && JSON.stringify(input.serviceAreas) !== JSON.stringify(application.serviceAreas)) onboardingChanges.push("service areas");
    if ((input.fulfillmentMode?.trim() || "") && input.fulfillmentMode?.trim() !== application.fulfillmentMode) onboardingChanges.push("fulfillment mode");
    if (input.operatingHours && JSON.stringify(input.operatingHours) !== JSON.stringify(application.operatingHours ?? {})) onboardingChanges.push("operating hours");

    const nextLead =
      lead
        ? {
            ...lead,
            businessName: input.businessName?.trim() || lead.businessName,
            contactName: input.contactName?.trim() || lead.contactName,
            email: input.email?.trim() || lead.email,
            phone: input.phone?.trim() || lead.phone,
            parish: input.parish?.trim() || lead.parish,
            town: input.town?.trim() || lead.town,
            category: input.category?.trim() || lead.category,
            instagramHandle: input.instagramHandle?.trim() || lead.instagramHandle,
            website: input.website?.trim() || lead.website,
            orderChannels: input.orderChannels?.length ? input.orderChannels : lead.orderChannels,
            averageDailyOrders: input.averageDailyOrders?.trim() || lead.averageDailyOrders,
            currentDeliveryMethod: input.currentDeliveryMethod?.trim() || lead.currentDeliveryMethod,
            preferredStartTimeline: input.preferredStartTimeline?.trim() || lead.preferredStartTimeline,
            updatedAt: timestamp,
          }
        : null;

    const nextPreference = {
      ...preference,
      emailEnabled: input.emailEnabled ?? preference.emailEnabled,
      smsEnabled: input.smsEnabled ?? preference.smsEnabled,
      whatsappEnabled: input.whatsappEnabled ?? preference.whatsappEnabled,
      notifyOnAssigned: input.notifyOnAssigned ?? preference.notifyOnAssigned,
      notifyOnDelivered: input.notifyOnDelivered ?? preference.notifyOnDelivered,
      notifyOnFailed: input.notifyOnFailed ?? preference.notifyOnFailed,
      notifyOnBilling: input.notifyOnBilling ?? preference.notifyOnBilling,
      updatedAt: timestamp,
    };

    if (leadIndex >= 0 && nextLead) {
      store.merchantLeads[leadIndex] = nextLead;
    }

    store.merchantApplications[applicationIndex] = nextApplication;

    if (preferenceIndex >= 0) {
      store.merchantNotificationPreferences[preferenceIndex] = nextPreference;
    } else {
      store.merchantNotificationPreferences.push(nextPreference);
    }

    if (profileIndex >= 0) {
      if (input.dispatchMode && input.dispatchMode !== store.merchantIntegrationProfiles[profileIndex].dispatchMode) onboardingChanges.push("dispatch mode");
      if (input.acceptsCOD !== undefined && input.acceptsCOD !== store.merchantIntegrationProfiles[profileIndex].acceptsCOD) onboardingChanges.push("cash on delivery preference");
      if ((input.averageBasketSize?.trim() || "") && input.averageBasketSize?.trim() !== store.merchantIntegrationProfiles[profileIndex].averageBasketSize) onboardingChanges.push("average basket size");
      if (input.packageTypes?.length && JSON.stringify(input.packageTypes) !== JSON.stringify(store.merchantIntegrationProfiles[profileIndex].packageTypes)) onboardingChanges.push("package types");
      if (input.orderSources?.length && JSON.stringify(input.orderSources) !== JSON.stringify(store.merchantIntegrationProfiles[profileIndex].orderSources)) onboardingChanges.push("order sources");
      if (input.pickupLocations?.length && JSON.stringify(input.pickupLocations) !== JSON.stringify(store.merchantIntegrationProfiles[profileIndex].pickupLocations)) onboardingChanges.push("pickup locations");
      if ((input.deliveryRadius?.trim() || "") && input.deliveryRadius?.trim() !== store.merchantIntegrationProfiles[profileIndex].deliveryRadius) onboardingChanges.push("delivery radius");
      if (input.sameDaySupported !== undefined && input.sameDaySupported !== store.merchantIntegrationProfiles[profileIndex].sameDaySupported) onboardingChanges.push("same-day support");
      if (input.scheduledSupported !== undefined && input.scheduledSupported !== store.merchantIntegrationProfiles[profileIndex].scheduledSupported) onboardingChanges.push("scheduled delivery support");
      store.merchantIntegrationProfiles[profileIndex] = {
        ...store.merchantIntegrationProfiles[profileIndex],
        dispatchMode: input.dispatchMode ?? store.merchantIntegrationProfiles[profileIndex].dispatchMode,
        acceptsCOD: input.acceptsCOD ?? store.merchantIntegrationProfiles[profileIndex].acceptsCOD,
        averageBasketSize: input.averageBasketSize?.trim() || store.merchantIntegrationProfiles[profileIndex].averageBasketSize,
        packageTypes: input.packageTypes?.length ? input.packageTypes : store.merchantIntegrationProfiles[profileIndex].packageTypes,
        orderSources: input.orderSources?.length ? input.orderSources : store.merchantIntegrationProfiles[profileIndex].orderSources,
        pickupLocations:
          input.pickupLocations?.length ? input.pickupLocations : store.merchantIntegrationProfiles[profileIndex].pickupLocations,
        deliveryRadius: input.deliveryRadius?.trim() || store.merchantIntegrationProfiles[profileIndex].deliveryRadius,
        sameDaySupported: input.sameDaySupported ?? store.merchantIntegrationProfiles[profileIndex].sameDaySupported,
        scheduledSupported: input.scheduledSupported ?? store.merchantIntegrationProfiles[profileIndex].scheduledSupported,
        operatingHours: nextApplication.operatingHours ?? store.merchantIntegrationProfiles[profileIndex].operatingHours,
        updatedAt: timestamp,
      };
    }

    return { application: nextApplication, lead: nextLead, preference: nextPreference };
  });

  const reviewChanges = uniqueChanges(onboardingChanges);
  if (reviewChanges.length) {
    await createMerchantOnboardingEvent({
      id: crypto.randomUUID(),
      merchantApplicationId: merchantId,
      eventType: "changes_pending_admin_review",
      actorType: "merchant_user",
      actorId: workspace.lead?.id,
      notes: `Merchant updated onboarding details: ${reviewChanges.join(", ")}.`,
      createdAt: new Date().toISOString(),
    });
  }

  return workspace;
}
