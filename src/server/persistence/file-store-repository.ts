import { normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import type {
  AdminReferralFilters,
  DeliveryLeg,
  DeliveryTransferPlan,
  MerchantAddress,
  MerchantDelivery,
  MerchantDispatchEvent,
  MerchantNotificationPreference,
  MerchantOrder,
  MerchantTeamMember,
  OnboardingStore,
  PartnerCarrier,
  PartnerHandoffLocation,
  PartnerTrackingEvent,
  PublicSlyderReferral,
  ReferralEvent,
  ReferralReward,
  ReferralRewardAudit,
  ReferrerAccount,
  ReferrerLoginChallenge,
  ReferrerSession,
  SupportContextSnapshot,
  SupportConversation,
  SupportEvent,
  SupportHandoff,
  SupportKnowledgeArticle,
  SupportMessage,
} from "@/types/backend/onboarding";
import type { PersistenceRepository, ReferralRewardWithReferral } from "@/server/persistence/repository";
import { readStore, withStoreTransaction } from "@/server/persistence/store";

function matchesReferralFilters(
  referral: PublicSlyderReferral,
  reward: ReferralReward | undefined,
  filters?: AdminReferralFilters,
) {
  if (!filters) return true;
  if (filters.status && referral.status !== filters.status) return false;
  if (filters.parish && referral.referredParish?.toLowerCase() !== filters.parish.trim().toLowerCase()) return false;
  if (filters.rewardStatus && reward?.status !== filters.rewardStatus) return false;
  if (filters.duplicateFlagged !== undefined) {
    const isDuplicate = referral.status === "duplicate_flagged" || Boolean(referral.duplicateOfReferralId);
    if (isDuplicate !== filters.duplicateFlagged) return false;
  }
  if (filters.dateFrom && referral.createdAt < filters.dateFrom) return false;
  if (filters.dateTo && referral.createdAt > `${filters.dateTo}T23:59:59.999Z`) return false;
  if (filters.search) {
    const haystack = [
      referral.referralCode,
      referral.referrerName,
      referral.referrerPhone,
      referral.referrerEmail,
      referral.referredName,
      referral.referredPhone,
      referral.referredParish,
      referral.referredTown,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(filters.search.trim().toLowerCase())) return false;
  }
  return true;
}

export class FileStoreRepository implements PersistenceRepository {
  readonly driver = "file" as const;

  async readSnapshot(): Promise<OnboardingStore> {
    return readStore();
  }

  async transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
    return withStoreTransaction(mutator);
  }

  async createReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount> {
    return withStoreTransaction((store) => {
      store.referrerAccounts.push(account);
      return account;
    });
  }

  async updateReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount> {
    return withStoreTransaction((store) => {
      const index = store.referrerAccounts.findIndex((item) => item.id === account.id);
      if (index < 0) {
        throw new Error("Referrer account not found");
      }
      store.referrerAccounts[index] = account;
      return account;
    });
  }

  async findReferrerAccountById(id: string): Promise<ReferrerAccount | null> {
    const store = await readStore();
    return store.referrerAccounts.find((item) => item.id === id) ?? null;
  }

  async findReferrerAccountByEmail(email: string): Promise<ReferrerAccount | null> {
    const store = await readStore();
    return (
      store.referrerAccounts.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase()) ?? null
    );
  }

  async findReferrerAccountByPhone(phone: string): Promise<ReferrerAccount | null> {
    const store = await readStore();
    const normalizedPhone = normalizePhone(phone);
    return store.referrerAccounts.find((item) => item.phone && normalizePhone(item.phone) === normalizedPhone) ?? null;
  }

  async createReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge> {
    return withStoreTransaction((store) => {
      store.referrerLoginChallenges.push(challenge);
      return challenge;
    });
  }

  async updateReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge> {
    return withStoreTransaction((store) => {
      const index = store.referrerLoginChallenges.findIndex((item) => item.id === challenge.id);
      if (index < 0) {
        throw new Error("Referrer login challenge not found");
      }
      store.referrerLoginChallenges[index] = challenge;
      return challenge;
    });
  }

  async findReferrerLoginChallengeById(id: string): Promise<ReferrerLoginChallenge | null> {
    const store = await readStore();
    return store.referrerLoginChallenges.find((item) => item.id === id) ?? null;
  }

  async createReferrerSession(session: ReferrerSession): Promise<ReferrerSession> {
    return withStoreTransaction((store) => {
      store.referrerSessions.push(session);
      return session;
    });
  }

  async findReferrerSessionById(id: string): Promise<ReferrerSession | null> {
    const store = await readStore();
    return store.referrerSessions.find((item) => item.id === id) ?? null;
  }

  async deleteReferrerSession(id: string): Promise<void> {
    await withStoreTransaction((store) => {
      const index = store.referrerSessions.findIndex((item) => item.id === id);
      if (index >= 0) {
        store.referrerSessions.splice(index, 1);
      }
    });
  }

  async createReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral> {
    return withStoreTransaction((store) => {
      store.publicSlyderReferrals.push(referral);
      return referral;
    });
  }

  async findReferralById(id: string): Promise<PublicSlyderReferral | null> {
    const store = await readStore();
    return store.publicSlyderReferrals.find((item) => item.id === id) ?? null;
  }

  async findReferralByIdForReferrerAccount(
    id: string,
    referrerAccountId: string,
  ): Promise<PublicSlyderReferral | null> {
    const store = await readStore();
    return (
      store.publicSlyderReferrals.find(
        (item) => item.id === id && item.referrerAccountId === referrerAccountId,
      ) ?? null
    );
  }

  async findReferralByCode(referralCode: string): Promise<PublicSlyderReferral | null> {
    const store = await readStore();
    return store.publicSlyderReferrals.find((item) => item.referralCode === referralCode) ?? null;
  }

  async findReferralByReferredPhone(referredPhone: string): Promise<PublicSlyderReferral | null> {
    const store = await readStore();
    const normalizedPhone = normalizePhone(referredPhone);
    return store.publicSlyderReferrals.find((item) => normalizePhone(item.referredPhone) === normalizedPhone) ?? null;
  }

  async listReferralsByReferrerAccountId(referrerAccountId: string): Promise<ReferralRewardWithReferral[]> {
    const store = await readStore();
    return [...store.publicSlyderReferrals]
      .filter((referral) => referral.referrerAccountId === referrerAccountId)
      .map((referral) => ({
        referral,
        reward: store.referralRewards.find((item) => item.publicReferralId === referral.id),
      }))
      .sort((left, right) => right.referral.createdAt.localeCompare(left.referral.createdAt));
  }

  async listReferrals(filters?: AdminReferralFilters): Promise<ReferralRewardWithReferral[]> {
    const store = await readStore();
    return [...store.publicSlyderReferrals]
      .map((referral) => ({
        referral,
        reward: store.referralRewards.find((item) => item.publicReferralId === referral.id),
      }))
      .filter((item) => matchesReferralFilters(item.referral, item.reward, filters))
      .sort((left, right) => right.referral.createdAt.localeCompare(left.referral.createdAt));
  }

  async updateReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral> {
    return withStoreTransaction((store) => {
      const index = store.publicSlyderReferrals.findIndex((item) => item.id === referral.id);
      if (index < 0) {
        throw new Error("Referral not found");
      }
      store.publicSlyderReferrals[index] = referral;
      return referral;
    });
  }

  async createReferralEvent(event: ReferralEvent): Promise<ReferralEvent> {
    return withStoreTransaction((store) => {
      store.referralEvents.push(event);
      return event;
    });
  }

  async listReferralEventsByReferralId(referralId: string): Promise<ReferralEvent[]> {
    const store = await readStore();
    return store.referralEvents
      .filter((item) => item.referralId === referralId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createReward(reward: ReferralReward): Promise<ReferralReward> {
    return withStoreTransaction((store) => {
      store.referralRewards.push(reward);
      return reward;
    });
  }

  async findRewardById(id: string): Promise<ReferralReward | null> {
    const store = await readStore();
    return store.referralRewards.find((item) => item.id === id) ?? null;
  }

  async findRewardByReferralId(publicReferralId: string): Promise<ReferralReward | null> {
    const store = await readStore();
    return store.referralRewards.find((item) => item.publicReferralId === publicReferralId) ?? null;
  }

  async updateReward(reward: ReferralReward): Promise<ReferralReward> {
    return withStoreTransaction((store) => {
      const index = store.referralRewards.findIndex((item) => item.id === reward.id);
      if (index < 0) {
        throw new Error("Referral reward not found");
      }
      store.referralRewards[index] = reward;
      return reward;
    });
  }

  async createRewardAudit(audit: ReferralRewardAudit): Promise<ReferralRewardAudit> {
    return withStoreTransaction((store) => {
      store.referralRewardAudits.push(audit);
      return audit;
    });
  }

  async listRewardAuditsByRewardId(rewardId: string): Promise<ReferralRewardAudit[]> {
    const store = await readStore();
    return store.referralRewardAudits
      .filter((item) => item.rewardId === rewardId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async createMerchantOrder(order: MerchantOrder): Promise<MerchantOrder> {
    return withStoreTransaction((store) => {
      store.merchantOrders.push(order);
      return order;
    });
  }

  async updateMerchantOrder(order: MerchantOrder): Promise<MerchantOrder> {
    return withStoreTransaction((store) => {
      const index = store.merchantOrders.findIndex((item) => item.id === order.id);
      if (index < 0) throw new Error("Merchant order not found");
      store.merchantOrders[index] = order;
      return order;
    });
  }

  async findMerchantOrderById(id: string): Promise<MerchantOrder | null> {
    const store = await readStore();
    return store.merchantOrders.find((item) => item.id === id) ?? null;
  }

  async listMerchantOrdersByMerchantId(merchantId: string): Promise<MerchantOrder[]> {
    const store = await readStore();
    return store.merchantOrders
      .filter((item) => item.merchantId === merchantId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery> {
    return withStoreTransaction((store) => {
      store.merchantDeliveries.push(delivery);
      return delivery;
    });
  }

  async updateMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery> {
    return withStoreTransaction((store) => {
      const index = store.merchantDeliveries.findIndex((item) => item.id === delivery.id);
      if (index < 0) throw new Error("Merchant delivery not found");
      store.merchantDeliveries[index] = delivery;
      return delivery;
    });
  }

  async findMerchantDeliveryById(id: string): Promise<MerchantDelivery | null> {
    const store = await readStore();
    return store.merchantDeliveries.find((item) => item.id === id) ?? null;
  }

  async listMerchantDeliveriesByMerchantId(merchantId: string): Promise<MerchantDelivery[]> {
    const store = await readStore();
    return store.merchantDeliveries
      .filter((item) => item.merchantId === merchantId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createMerchantAddress(address: MerchantAddress): Promise<MerchantAddress> {
    return withStoreTransaction((store) => {
      store.merchantAddresses.push(address);
      return address;
    });
  }

  async updateMerchantAddress(address: MerchantAddress): Promise<MerchantAddress> {
    return withStoreTransaction((store) => {
      const index = store.merchantAddresses.findIndex((item) => item.id === address.id);
      if (index < 0) throw new Error("Merchant address not found");
      store.merchantAddresses[index] = address;
      return address;
    });
  }

  async deleteMerchantAddress(id: string): Promise<void> {
    await withStoreTransaction((store) => {
      const index = store.merchantAddresses.findIndex((item) => item.id === id);
      if (index >= 0) {
        store.merchantAddresses.splice(index, 1);
      }
    });
  }

  async findMerchantAddressById(id: string): Promise<MerchantAddress | null> {
    const store = await readStore();
    return store.merchantAddresses.find((item) => item.id === id) ?? null;
  }

  async listMerchantAddressesByMerchantId(merchantId: string): Promise<MerchantAddress[]> {
    const store = await readStore();
    return store.merchantAddresses
      .filter((item) => item.merchantId === merchantId)
      .sort((left, right) => Number(right.isDefault) - Number(left.isDefault) || left.label.localeCompare(right.label));
  }

  async createMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember> {
    return withStoreTransaction((store) => {
      store.merchantTeamMembers.push(member);
      return member;
    });
  }

  async updateMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember> {
    return withStoreTransaction((store) => {
      const index = store.merchantTeamMembers.findIndex((item) => item.id === member.id);
      if (index < 0) throw new Error("Merchant team member not found");
      store.merchantTeamMembers[index] = member;
      return member;
    });
  }

  async findMerchantTeamMemberByUserId(userId: string): Promise<MerchantTeamMember | null> {
    const store = await readStore();
    return store.merchantTeamMembers.find((item) => item.userId === userId) ?? null;
  }

  async listMerchantTeamMembersByMerchantId(merchantId: string): Promise<MerchantTeamMember[]> {
    const store = await readStore();
    return store.merchantTeamMembers
      .filter((item) => item.merchantId === merchantId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async upsertMerchantNotificationPreference(
    preference: MerchantNotificationPreference,
  ): Promise<MerchantNotificationPreference> {
    return withStoreTransaction((store) => {
      const index = store.merchantNotificationPreferences.findIndex((item) => item.merchantId === preference.merchantId);
      if (index >= 0) {
        store.merchantNotificationPreferences[index] = preference;
      } else {
        store.merchantNotificationPreferences.push(preference);
      }
      return preference;
    });
  }

  async findMerchantNotificationPreferenceByMerchantId(
    merchantId: string,
  ): Promise<MerchantNotificationPreference | null> {
    const store = await readStore();
    return store.merchantNotificationPreferences.find((item) => item.merchantId === merchantId) ?? null;
  }

  async createMerchantDispatchEvent(event: MerchantDispatchEvent): Promise<MerchantDispatchEvent> {
    return withStoreTransaction((store) => {
      store.merchantDispatchEvents.push(event);
      return event;
    });
  }

  async listMerchantDispatchEventsByDeliveryId(merchantDeliveryId: string): Promise<MerchantDispatchEvent[]> {
    const store = await readStore();
    return store.merchantDispatchEvents
      .filter((item) => item.merchantDeliveryId === merchantDeliveryId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async createPartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier> {
    return withStoreTransaction((store) => {
      store.partnerCarriers.push(carrier);
      return carrier;
    });
  }

  async updatePartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier> {
    return withStoreTransaction((store) => {
      const index = store.partnerCarriers.findIndex((item) => item.id === carrier.id);
      if (index < 0) throw new Error("Partner carrier not found");
      store.partnerCarriers[index] = carrier;
      return carrier;
    });
  }

  async findPartnerCarrierById(id: string): Promise<PartnerCarrier | null> {
    const store = await readStore();
    return store.partnerCarriers.find((item) => item.id === id) ?? null;
  }

  async listPartnerCarriers(): Promise<PartnerCarrier[]> {
    const store = await readStore();
    return [...store.partnerCarriers].sort((left, right) => left.name.localeCompare(right.name));
  }

  async createPartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation> {
    return withStoreTransaction((store) => {
      store.partnerHandoffLocations.push(location);
      return location;
    });
  }

  async updatePartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation> {
    return withStoreTransaction((store) => {
      const index = store.partnerHandoffLocations.findIndex((item) => item.id === location.id);
      if (index < 0) throw new Error("Partner handoff location not found");
      store.partnerHandoffLocations[index] = location;
      return location;
    });
  }

  async listPartnerHandoffLocationsByCarrierId(partnerCarrierId: string): Promise<PartnerHandoffLocation[]> {
    const store = await readStore();
    return store.partnerHandoffLocations
      .filter((item) => item.partnerCarrierId === partnerCarrierId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async findPartnerHandoffLocationById(id: string): Promise<PartnerHandoffLocation | null> {
    const store = await readStore();
    return store.partnerHandoffLocations.find((item) => item.id === id) ?? null;
  }

  async createDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan> {
    return withStoreTransaction((store) => {
      store.deliveryTransferPlans.push(plan);
      return plan;
    });
  }

  async updateDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan> {
    return withStoreTransaction((store) => {
      const index = store.deliveryTransferPlans.findIndex((item) => item.id === plan.id);
      if (index < 0) throw new Error("Delivery transfer plan not found");
      store.deliveryTransferPlans[index] = plan;
      return plan;
    });
  }

  async findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryTransferPlan | null> {
    const store = await readStore();
    return store.deliveryTransferPlans.find((item) => item.merchantDeliveryId === merchantDeliveryId) ?? null;
  }

  async createDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg> {
    return withStoreTransaction((store) => {
      store.deliveryLegs.push(leg);
      return leg;
    });
  }

  async updateDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg> {
    return withStoreTransaction((store) => {
      const index = store.deliveryLegs.findIndex((item) => item.id === leg.id);
      if (index < 0) throw new Error("Delivery leg not found");
      store.deliveryLegs[index] = leg;
      return leg;
    });
  }

  async findDeliveryLegById(id: string): Promise<DeliveryLeg | null> {
    const store = await readStore();
    return store.deliveryLegs.find((item) => item.id === id) ?? null;
  }

  async listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryLeg[]> {
    const store = await readStore();
    return store.deliveryLegs
      .filter((item) => item.merchantDeliveryId === merchantDeliveryId)
      .sort((left, right) => left.legSequence - right.legSequence || left.createdAt.localeCompare(right.createdAt));
  }

  async createPartnerTrackingEvent(event: PartnerTrackingEvent): Promise<PartnerTrackingEvent> {
    return withStoreTransaction((store) => {
      store.partnerTrackingEvents.push(event);
      return event;
    });
  }

  async listPartnerTrackingEventsByDeliveryLegId(deliveryLegId: string): Promise<PartnerTrackingEvent[]> {
    const store = await readStore();
    return store.partnerTrackingEvents
      .filter((item) => item.deliveryLegId === deliveryLegId)
      .sort((left, right) => left.eventTimestamp.localeCompare(right.eventTimestamp));
  }

  async createSupportConversation(conversation: SupportConversation): Promise<SupportConversation> {
    return withStoreTransaction((store) => {
      store.supportConversations.push(conversation);
      return conversation;
    });
  }

  async updateSupportConversation(conversation: SupportConversation): Promise<SupportConversation> {
    return withStoreTransaction((store) => {
      const index = store.supportConversations.findIndex((item) => item.id === conversation.id);
      if (index < 0) throw new Error("Support conversation not found");
      store.supportConversations[index] = conversation;
      return conversation;
    });
  }

  async findSupportConversationById(id: string): Promise<SupportConversation | null> {
    const store = await readStore();
    return store.supportConversations.find((item) => item.id === id) ?? null;
  }

  async listSupportConversations(): Promise<SupportConversation[]> {
    const store = await readStore();
    return [...store.supportConversations].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createSupportMessage(message: SupportMessage): Promise<SupportMessage> {
    return withStoreTransaction((store) => {
      store.supportMessages.push(message);
      return message;
    });
  }

  async listSupportMessagesByConversationId(conversationId: string): Promise<SupportMessage[]> {
    const store = await readStore();
    return store.supportMessages
      .filter((item) => item.conversationId === conversationId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async createSupportContextSnapshot(snapshot: SupportContextSnapshot): Promise<SupportContextSnapshot> {
    return withStoreTransaction((store) => {
      store.supportContextSnapshots.push(snapshot);
      return snapshot;
    });
  }

  async listSupportContextSnapshotsByConversationId(conversationId: string): Promise<SupportContextSnapshot[]> {
    const store = await readStore();
    return store.supportContextSnapshots
      .filter((item) => item.conversationId === conversationId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createSupportHandoff(handoff: SupportHandoff): Promise<SupportHandoff> {
    return withStoreTransaction((store) => {
      store.supportHandoffs.push(handoff);
      return handoff;
    });
  }

  async listSupportHandoffsByConversationId(conversationId: string): Promise<SupportHandoff[]> {
    const store = await readStore();
    return store.supportHandoffs
      .filter((item) => item.conversationId === conversationId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createSupportEvent(event: SupportEvent): Promise<SupportEvent> {
    return withStoreTransaction((store) => {
      store.supportEvents.push(event);
      return event;
    });
  }

  async listSupportEventsByConversationId(conversationId: string): Promise<SupportEvent[]> {
    const store = await readStore();
    return store.supportEvents
      .filter((item) => item.conversationId === conversationId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async createSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle> {
    return withStoreTransaction((store) => {
      store.supportKnowledgeArticles.push(article);
      return article;
    });
  }

  async updateSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle> {
    return withStoreTransaction((store) => {
      const index = store.supportKnowledgeArticles.findIndex((item) => item.id === article.id);
      if (index < 0) throw new Error("Support knowledge article not found");
      store.supportKnowledgeArticles[index] = article;
      return article;
    });
  }

  async findSupportKnowledgeArticleById(id: string): Promise<SupportKnowledgeArticle | null> {
    const store = await readStore();
    return store.supportKnowledgeArticles.find((item) => item.id === id) ?? null;
  }

  async findSupportKnowledgeArticleBySlug(slug: string): Promise<SupportKnowledgeArticle | null> {
    const store = await readStore();
    return store.supportKnowledgeArticles.find((item) => item.slug === slug) ?? null;
  }

  async listSupportKnowledgeArticles(): Promise<SupportKnowledgeArticle[]> {
    const store = await readStore();
    return [...store.supportKnowledgeArticles].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }
}

export const fileStoreRepository = new FileStoreRepository();
