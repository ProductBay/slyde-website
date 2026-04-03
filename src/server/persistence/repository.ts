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

export type PersistenceDriver = "file" | "prisma";

export type ReferralRewardWithReferral = {
  referral: PublicSlyderReferral;
  reward?: ReferralReward;
};

export interface PersistenceRepository {
  readonly driver: PersistenceDriver;
  readSnapshot(): Promise<OnboardingStore>;
  transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T>;
  createReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount>;
  findReferrerAccountById(id: string): Promise<ReferrerAccount | null>;
  findReferrerAccountByEmail(email: string): Promise<ReferrerAccount | null>;
  findReferrerAccountByPhone(phone: string): Promise<ReferrerAccount | null>;
  updateReferrerAccount(account: ReferrerAccount): Promise<ReferrerAccount>;
  createReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge>;
  findReferrerLoginChallengeById(id: string): Promise<ReferrerLoginChallenge | null>;
  updateReferrerLoginChallenge(challenge: ReferrerLoginChallenge): Promise<ReferrerLoginChallenge>;
  createReferrerSession(session: ReferrerSession): Promise<ReferrerSession>;
  findReferrerSessionById(id: string): Promise<ReferrerSession | null>;
  deleteReferrerSession(id: string): Promise<void>;
  createReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral>;
  findReferralById(id: string): Promise<PublicSlyderReferral | null>;
  findReferralByIdForReferrerAccount(id: string, referrerAccountId: string): Promise<PublicSlyderReferral | null>;
  findReferralByCode(referralCode: string): Promise<PublicSlyderReferral | null>;
  findReferralByReferredPhone(referredPhone: string): Promise<PublicSlyderReferral | null>;
  listReferralsByReferrerAccountId(referrerAccountId: string): Promise<ReferralRewardWithReferral[]>;
  listReferrals(filters?: AdminReferralFilters): Promise<ReferralRewardWithReferral[]>;
  updateReferral(referral: PublicSlyderReferral): Promise<PublicSlyderReferral>;
  createReferralEvent(event: ReferralEvent): Promise<ReferralEvent>;
  listReferralEventsByReferralId(referralId: string): Promise<ReferralEvent[]>;
  createReward(reward: ReferralReward): Promise<ReferralReward>;
  findRewardById(id: string): Promise<ReferralReward | null>;
  findRewardByReferralId(publicReferralId: string): Promise<ReferralReward | null>;
  updateReward(reward: ReferralReward): Promise<ReferralReward>;
  createRewardAudit(audit: ReferralRewardAudit): Promise<ReferralRewardAudit>;
  listRewardAuditsByRewardId(rewardId: string): Promise<ReferralRewardAudit[]>;
  createMerchantOrder(order: MerchantOrder): Promise<MerchantOrder>;
  updateMerchantOrder(order: MerchantOrder): Promise<MerchantOrder>;
  findMerchantOrderById(id: string): Promise<MerchantOrder | null>;
  listMerchantOrdersByMerchantId(merchantId: string): Promise<MerchantOrder[]>;
  createMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery>;
  updateMerchantDelivery(delivery: MerchantDelivery): Promise<MerchantDelivery>;
  findMerchantDeliveryById(id: string): Promise<MerchantDelivery | null>;
  listMerchantDeliveriesByMerchantId(merchantId: string): Promise<MerchantDelivery[]>;
  createMerchantAddress(address: MerchantAddress): Promise<MerchantAddress>;
  updateMerchantAddress(address: MerchantAddress): Promise<MerchantAddress>;
  deleteMerchantAddress(id: string): Promise<void>;
  findMerchantAddressById(id: string): Promise<MerchantAddress | null>;
  listMerchantAddressesByMerchantId(merchantId: string): Promise<MerchantAddress[]>;
  createMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember>;
  updateMerchantTeamMember(member: MerchantTeamMember): Promise<MerchantTeamMember>;
  findMerchantTeamMemberByUserId(userId: string): Promise<MerchantTeamMember | null>;
  listMerchantTeamMembersByMerchantId(merchantId: string): Promise<MerchantTeamMember[]>;
  upsertMerchantNotificationPreference(
    preference: MerchantNotificationPreference,
  ): Promise<MerchantNotificationPreference>;
  findMerchantNotificationPreferenceByMerchantId(merchantId: string): Promise<MerchantNotificationPreference | null>;
  createMerchantDispatchEvent(event: MerchantDispatchEvent): Promise<MerchantDispatchEvent>;
  listMerchantDispatchEventsByDeliveryId(merchantDeliveryId: string): Promise<MerchantDispatchEvent[]>;
  createPartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier>;
  updatePartnerCarrier(carrier: PartnerCarrier): Promise<PartnerCarrier>;
  findPartnerCarrierById(id: string): Promise<PartnerCarrier | null>;
  listPartnerCarriers(): Promise<PartnerCarrier[]>;
  createPartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation>;
  updatePartnerHandoffLocation(location: PartnerHandoffLocation): Promise<PartnerHandoffLocation>;
  listPartnerHandoffLocationsByCarrierId(partnerCarrierId: string): Promise<PartnerHandoffLocation[]>;
  findPartnerHandoffLocationById(id: string): Promise<PartnerHandoffLocation | null>;
  createDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan>;
  updateDeliveryTransferPlan(plan: DeliveryTransferPlan): Promise<DeliveryTransferPlan>;
  findDeliveryTransferPlanByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryTransferPlan | null>;
  createDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg>;
  updateDeliveryLeg(leg: DeliveryLeg): Promise<DeliveryLeg>;
  findDeliveryLegById(id: string): Promise<DeliveryLeg | null>;
  listDeliveryLegsByMerchantDeliveryId(merchantDeliveryId: string): Promise<DeliveryLeg[]>;
  createPartnerTrackingEvent(event: PartnerTrackingEvent): Promise<PartnerTrackingEvent>;
  listPartnerTrackingEventsByDeliveryLegId(deliveryLegId: string): Promise<PartnerTrackingEvent[]>;
  createSupportConversation(conversation: SupportConversation): Promise<SupportConversation>;
  updateSupportConversation(conversation: SupportConversation): Promise<SupportConversation>;
  findSupportConversationById(id: string): Promise<SupportConversation | null>;
  listSupportConversations(): Promise<SupportConversation[]>;
  createSupportMessage(message: SupportMessage): Promise<SupportMessage>;
  listSupportMessagesByConversationId(conversationId: string): Promise<SupportMessage[]>;
  createSupportContextSnapshot(snapshot: SupportContextSnapshot): Promise<SupportContextSnapshot>;
  listSupportContextSnapshotsByConversationId(conversationId: string): Promise<SupportContextSnapshot[]>;
  createSupportHandoff(handoff: SupportHandoff): Promise<SupportHandoff>;
  listSupportHandoffsByConversationId(conversationId: string): Promise<SupportHandoff[]>;
  createSupportEvent(event: SupportEvent): Promise<SupportEvent>;
  listSupportEventsByConversationId(conversationId: string): Promise<SupportEvent[]>;
  createSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle>;
  updateSupportKnowledgeArticle(article: SupportKnowledgeArticle): Promise<SupportKnowledgeArticle>;
  findSupportKnowledgeArticleById(id: string): Promise<SupportKnowledgeArticle | null>;
  findSupportKnowledgeArticleBySlug(slug: string): Promise<SupportKnowledgeArticle | null>;
  listSupportKnowledgeArticles(): Promise<SupportKnowledgeArticle[]>;
}

export function getPersistenceDriver(): PersistenceDriver {
  return process.env.PERSISTENCE_DRIVER === "prisma" ? "prisma" : "file";
}
