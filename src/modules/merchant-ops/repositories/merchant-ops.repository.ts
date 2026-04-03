import { getPersistenceRepository, readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type {
  DeliveryLeg,
  DeliveryTransferPlan,
  MerchantAddress,
  MerchantApplication,
  MerchantDelivery,
  MerchantDispatchEvent,
  MerchantLead,
  MerchantNotificationPreference,
  MerchantOrder,
  MerchantTeamMember,
  NotificationTriggerEvent,
  OnboardingStore,
  PartnerCarrier,
  PartnerHandoffLocation,
  PartnerTrackingEvent,
} from "@/types/backend/onboarding";

function defaultNotificationPreference(merchantId: string, timestamp: string): MerchantNotificationPreference {
  return {
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
}

function getMerchantWorkspaceFromStore(store: OnboardingStore, merchantId: string) {
  const application = store.merchantApplications.find((item) => item.id === merchantId);
  if (!application) return null;

  const lead = store.merchantLeads.find((item) => item.id === application.merchantLeadId) ?? null;
  const integrationProfile =
    store.merchantIntegrationProfiles.find((item) => item.merchantApplicationId === application.id) ?? null;
  const teamMembers = store.merchantTeamMembers.filter((item) => item.merchantId === merchantId);
  const notificationPreference =
    store.merchantNotificationPreferences.find((item) => item.merchantId === merchantId) ?? null;

  return {
    application,
    lead,
    integrationProfile,
    teamMembers,
    notificationPreference,
  };
}

export async function findMerchantWorkspaceByUserId(userId: string) {
  const store = await readPersistenceStore();
  const membership =
    store.merchantTeamMembers
      .filter((item) => item.userId === userId && item.status === "active")
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null;
  if (!membership) return null;

  const workspace = getMerchantWorkspaceFromStore(store, membership.merchantId);
  if (!workspace) return null;

  return {
    ...workspace,
    membership,
    user: store.users.find((item) => item.id === userId) ?? null,
  };
}

export async function findMerchantWorkspaceById(merchantId: string) {
  const store = await readPersistenceStore();
  return getMerchantWorkspaceFromStore(store, merchantId);
}

export async function listMerchantOrdersForMerchant(merchantId: string) {
  return getPersistenceRepository().listMerchantOrdersByMerchantId(merchantId);
}

export async function findMerchantOrderForMerchant(orderId: string, merchantId: string) {
  const order = await getPersistenceRepository().findMerchantOrderById(orderId);
  if (!order || order.merchantId !== merchantId) return null;
  return order;
}

export async function listMerchantDeliveriesForMerchant(merchantId: string) {
  return getPersistenceRepository().listMerchantDeliveriesByMerchantId(merchantId);
}

export async function findMerchantDeliveryForMerchant(deliveryId: string, merchantId: string) {
  const delivery = await getPersistenceRepository().findMerchantDeliveryById(deliveryId);
  if (!delivery || delivery.merchantId !== merchantId) return null;
  return delivery;
}

export async function listMerchantAddressesForMerchant(merchantId: string) {
  return getPersistenceRepository().listMerchantAddressesByMerchantId(merchantId);
}

export async function findMerchantAddressForMerchant(addressId: string, merchantId: string) {
  const address = await getPersistenceRepository().findMerchantAddressById(addressId);
  if (!address || address.merchantId !== merchantId) return null;
  return address;
}

export async function saveMerchantAddress(address: MerchantAddress) {
  const repository = getPersistenceRepository();
  const existing = await repository.findMerchantAddressById(address.id);
  if (existing) {
    return repository.updateMerchantAddress(address);
  }
  return repository.createMerchantAddress(address);
}

export async function saveMerchantOrder(order: MerchantOrder) {
  const repository = getPersistenceRepository();
  const existing = await repository.findMerchantOrderById(order.id);
  if (existing) {
    return repository.updateMerchantOrder(order);
  }
  return repository.createMerchantOrder(order);
}

export async function saveMerchantDelivery(delivery: MerchantDelivery) {
  const repository = getPersistenceRepository();
  const existing = await repository.findMerchantDeliveryById(delivery.id);
  if (existing) {
    return repository.updateMerchantDelivery(delivery);
  }
  return repository.createMerchantDelivery(delivery);
}

export async function saveMerchantTeamMember(member: MerchantTeamMember) {
  const repository = getPersistenceRepository();
  const existing = (await repository.listMerchantTeamMembersByMerchantId(member.merchantId)).find((item) => item.id === member.id);
  if (existing) {
    return repository.updateMerchantTeamMember(member);
  }
  return repository.createMerchantTeamMember(member);
}

export async function findMerchantNotificationPreference(merchantId: string) {
  return getPersistenceRepository().findMerchantNotificationPreferenceByMerchantId(merchantId);
}

export async function saveMerchantNotificationPreference(preference: MerchantNotificationPreference) {
  return getPersistenceRepository().upsertMerchantNotificationPreference(preference);
}

export async function appendMerchantDispatchEvent(event: MerchantDispatchEvent) {
  return getPersistenceRepository().createMerchantDispatchEvent(event);
}

export async function listMerchantDispatchEvents(deliveryId: string) {
  return getPersistenceRepository().listMerchantDispatchEventsByDeliveryId(deliveryId);
}

export async function savePartnerCarrier(carrier: PartnerCarrier) {
  const repository = getPersistenceRepository();
  const existing = await repository.findPartnerCarrierById(carrier.id);
  if (existing) return repository.updatePartnerCarrier(carrier);
  return repository.createPartnerCarrier(carrier);
}

export async function listPartnerCarriers() {
  return getPersistenceRepository().listPartnerCarriers();
}

export async function findPartnerCarrierById(id: string) {
  return getPersistenceRepository().findPartnerCarrierById(id);
}

export async function savePartnerHandoffLocation(location: PartnerHandoffLocation) {
  const repository = getPersistenceRepository();
  const existing = await repository.findPartnerHandoffLocationById(location.id);
  if (existing) return repository.updatePartnerHandoffLocation(location);
  return repository.createPartnerHandoffLocation(location);
}

export async function listPartnerHandoffLocationsByCarrierId(partnerCarrierId: string) {
  return getPersistenceRepository().listPartnerHandoffLocationsByCarrierId(partnerCarrierId);
}

export async function findPartnerHandoffLocationById(id: string) {
  return getPersistenceRepository().findPartnerHandoffLocationById(id);
}

export async function saveDeliveryTransferPlan(plan: DeliveryTransferPlan) {
  const repository = getPersistenceRepository();
  const existing = await repository.findDeliveryTransferPlanByMerchantDeliveryId(plan.merchantDeliveryId);
  if (existing) return repository.updateDeliveryTransferPlan({ ...existing, ...plan });
  return repository.createDeliveryTransferPlan(plan);
}

export async function findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId: string) {
  return getPersistenceRepository().findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId);
}

export async function saveDeliveryLeg(leg: DeliveryLeg) {
  const repository = getPersistenceRepository();
  const existing = await repository.findDeliveryLegById(leg.id);
  if (existing) return repository.updateDeliveryLeg(leg);
  return repository.createDeliveryLeg(leg);
}

export async function findDeliveryLegById(id: string) {
  return getPersistenceRepository().findDeliveryLegById(id);
}

export async function listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId: string) {
  return getPersistenceRepository().listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId);
}

export async function appendPartnerTrackingEvent(event: PartnerTrackingEvent) {
  return getPersistenceRepository().createPartnerTrackingEvent(event);
}

export async function listPartnerTrackingEventsByDeliveryLegId(deliveryLegId: string) {
  return getPersistenceRepository().listPartnerTrackingEventsByDeliveryLegId(deliveryLegId);
}

export async function ensureMerchantNotificationPreference(merchantId: string) {
  const timestamp = new Date().toISOString();
  const existing = await findMerchantNotificationPreference(merchantId);
  if (existing) return existing;
  return saveMerchantNotificationPreference(defaultNotificationPreference(merchantId, timestamp));
}

export async function setMerchantDefaultAddress(merchantId: string, addressId: string) {
  const repository = getPersistenceRepository();
  const addresses = await repository.listMerchantAddressesByMerchantId(merchantId);
  for (const address of addresses) {
    const next = { ...address, isDefault: address.id === addressId, updatedAt: new Date().toISOString() };
    await repository.updateMerchantAddress(next);
  }
}

export async function deleteMerchantAddress(addressId: string) {
  return getPersistenceRepository().deleteMerchantAddress(addressId);
}

export async function appendMerchantSupportTrigger(trigger: NotificationTriggerEvent) {
  return withPersistenceTransaction((store) => {
    store.notificationTriggers.push(trigger);
    return trigger;
  });
}

export async function updateMerchantWorkspace(
  merchantId: string,
  updater: (input: {
    application: MerchantApplication;
    lead: MerchantLead | null;
    preference: MerchantNotificationPreference;
  }) => {
    application?: MerchantApplication;
    lead?: MerchantLead | null;
    preference?: MerchantNotificationPreference;
  },
) {
  return withPersistenceTransaction(async (store) => {
    const application = store.merchantApplications.find((item) => item.id === merchantId);
    if (!application) {
      throw new Error("Merchant workspace not found");
    }

    const leadIndex = store.merchantLeads.findIndex((item) => item.id === application.merchantLeadId);
    const lead = leadIndex >= 0 ? store.merchantLeads[leadIndex] : null;
    const preferenceIndex = store.merchantNotificationPreferences.findIndex((item) => item.merchantId === merchantId);
    const timestamp = new Date().toISOString();
    const preference =
      preferenceIndex >= 0
        ? store.merchantNotificationPreferences[preferenceIndex]
        : defaultNotificationPreference(merchantId, timestamp);

    const result = updater({ application, lead, preference });

    if (result.application) {
      const applicationIndex = store.merchantApplications.findIndex((item) => item.id === merchantId);
      store.merchantApplications[applicationIndex] = result.application;
    }

    if (result.lead && leadIndex >= 0) {
      store.merchantLeads[leadIndex] = result.lead;
    }

    if (result.preference) {
      if (preferenceIndex >= 0) {
        store.merchantNotificationPreferences[preferenceIndex] = result.preference;
      } else {
        store.merchantNotificationPreferences.push(result.preference);
      }
    }

    return {
      application: result.application ?? application,
      lead: result.lead ?? lead,
      preference: result.preference ?? preference,
    };
  });
}
