import { getPersistenceRepository } from "@/server/persistence";
import type {
  AdminReferralFilters,
  PublicSlyderReferral,
  ReferralEvent,
  ReferralReward,
  ReferralRewardAudit,
  ReferrerAccount,
  ReferrerLoginChallenge,
  ReferrerSession,
} from "@/types/backend/onboarding";

export async function createReferrerAccount(account: ReferrerAccount) {
  return getPersistenceRepository().createReferrerAccount(account);
}

export async function updateReferrerAccount(account: ReferrerAccount) {
  return getPersistenceRepository().updateReferrerAccount(account);
}

export async function findReferrerAccountById(id: string) {
  return getPersistenceRepository().findReferrerAccountById(id);
}

export async function findReferrerAccountByEmail(email: string) {
  return getPersistenceRepository().findReferrerAccountByEmail(email);
}

export async function findReferrerAccountByPhone(phone: string) {
  return getPersistenceRepository().findReferrerAccountByPhone(phone);
}

export async function createReferrerLoginChallenge(challenge: ReferrerLoginChallenge) {
  return getPersistenceRepository().createReferrerLoginChallenge(challenge);
}

export async function updateReferrerLoginChallenge(challenge: ReferrerLoginChallenge) {
  return getPersistenceRepository().updateReferrerLoginChallenge(challenge);
}

export async function findReferrerLoginChallengeById(id: string) {
  return getPersistenceRepository().findReferrerLoginChallengeById(id);
}

export async function createReferrerSession(session: ReferrerSession) {
  return getPersistenceRepository().createReferrerSession(session);
}

export async function findReferrerSessionById(id: string) {
  return getPersistenceRepository().findReferrerSessionById(id);
}

export async function deleteReferrerSession(id: string) {
  return getPersistenceRepository().deleteReferrerSession(id);
}

export async function createReferral(referral: PublicSlyderReferral) {
  return getPersistenceRepository().createReferral(referral);
}

export async function findReferralById(id: string) {
  return getPersistenceRepository().findReferralById(id);
}

export async function findReferralByCode(referralCode: string) {
  return getPersistenceRepository().findReferralByCode(referralCode);
}

export async function findReferralByReferredPhone(referredPhone: string) {
  return getPersistenceRepository().findReferralByReferredPhone(referredPhone);
}

export async function listReferralsByReferrerAccountId(referrerAccountId: string) {
  return getPersistenceRepository().listReferralsByReferrerAccountId(referrerAccountId);
}

export async function findReferralByIdForReferrerAccount(id: string, referrerAccountId: string) {
  return getPersistenceRepository().findReferralByIdForReferrerAccount(id, referrerAccountId);
}

export async function listReferrals(filters?: AdminReferralFilters) {
  return getPersistenceRepository().listReferrals(filters);
}

export async function updateReferral(referral: PublicSlyderReferral) {
  return getPersistenceRepository().updateReferral(referral);
}

export async function createReferralEvent(event: ReferralEvent) {
  return getPersistenceRepository().createReferralEvent(event);
}

export async function listReferralEventsByReferralId(referralId: string) {
  return getPersistenceRepository().listReferralEventsByReferralId(referralId);
}

export async function createReward(reward: ReferralReward) {
  return getPersistenceRepository().createReward(reward);
}

export async function findRewardById(id: string) {
  return getPersistenceRepository().findRewardById(id);
}

export async function findRewardByReferralId(publicReferralId: string) {
  return getPersistenceRepository().findRewardByReferralId(publicReferralId);
}

export async function updateReward(reward: ReferralReward) {
  return getPersistenceRepository().updateReward(reward);
}

export async function createRewardAudit(audit: ReferralRewardAudit) {
  return getPersistenceRepository().createRewardAudit(audit);
}

export async function listRewardAuditsByRewardId(rewardId: string) {
  return getPersistenceRepository().listRewardAuditsByRewardId(rewardId);
}
