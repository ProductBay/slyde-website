import { cookies } from "next/headers";
import { normalizeEmail } from "@/modules/onboarding/services/onboarding-rules.service";
import {
  createReferrerAccount,
  createReferrerLoginChallenge,
  createReferrerSession,
  createReferralEvent,
  deleteReferrerSession,
  findReferrerAccountById,
  findReferrerAccountByEmail,
  findReferrerLoginChallengeById,
  updateReferral,
  updateReferrerAccount,
  updateReferrerLoginChallenge,
} from "@/modules/referrals/repositories/referral.repository";
import type { ReferrerRequestCodeInput, ReferrerVerifyCodeInput } from "@/modules/referrals/schemas/referrer-auth.schema";
import { sendReferrerLoginCodeNotification } from "@/server/notifications/notification.service";
import { readPersistenceStore } from "@/server/persistence";
import { REFERRER_SESSION_COOKIE, getReferrerSessionContext } from "@/server/auth/referrer-session";
import { generateOtpCode, hashToken } from "@/server/auth/tokens";
import { getAppBaseUrl } from "@/lib/app-base-url";

const REFERRER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const LOGIN_CODE_TTL_MS = 1000 * 60 * 10;

function nowIso() {
  return new Date().toISOString();
}

function expiresIso(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toISOString();
}

function buildDisplayName(input?: string, email?: string) {
  return input?.trim() || email || "Referrer";
}

function shouldUseSecureCookies() {
  const baseUrl = getAppBaseUrl();
  return process.env.NODE_ENV === "production" || baseUrl.startsWith("https://");
}

function getReferrerSessionCookieOptions(expiresAt: string | Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: shouldUseSecureCookies(),
    expires: expiresAt instanceof Date ? expiresAt : new Date(expiresAt),
  };
}

async function invalidateExistingReferrerSessions(referrerAccountId: string) {
  const store = await readPersistenceStore();
  const activeSessionIds = store.referrerSessions
    .filter((entry) => entry.referrerAccountId === referrerAccountId)
    .map((entry) => entry.id);

  await Promise.all(activeSessionIds.map((sessionId) => deleteReferrerSession(sessionId)));
}

async function consumeOutstandingChallenges(referrerAccountId: string, timestamp: string, keepChallengeId?: string) {
  const store = await readPersistenceStore();
  const pendingChallenges = store.referrerLoginChallenges.filter(
    (entry) =>
      entry.referrerAccountId === referrerAccountId &&
      !entry.consumedAt &&
      entry.id !== keepChallengeId,
  );

  await Promise.all(
    pendingChallenges.map((challenge) =>
      updateReferrerLoginChallenge({
        ...challenge,
        consumedAt: timestamp,
      }),
    ),
  );
}

async function ensureReferrerAccount(email: string, displayName?: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findReferrerAccountByEmail(normalizedEmail);
  if (existing) {
    if (displayName && existing.fullName !== displayName.trim()) {
      return updateReferrerAccount({
        ...existing,
        fullName: displayName.trim(),
        updatedAt: nowIso(),
      });
    }
    return existing;
  }

  return createReferrerAccount({
    id: crypto.randomUUID(),
    fullName: buildDisplayName(displayName, normalizedEmail),
    email: normalizedEmail,
    isEnabled: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
}

async function attachExistingReferralsToAccount(referrerAccountId: string, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const store = await readPersistenceStore();
  const matchingReferrals = store.publicSlyderReferrals.filter(
    (referral) => referral.referrerEmail && normalizeEmail(referral.referrerEmail) === normalizedEmail,
  );

  for (const referral of matchingReferrals) {
    if (referral.referrerAccountId === referrerAccountId) continue;

    await updateReferral({
      ...referral,
      referrerAccountId,
      updatedAt: nowIso(),
    });

    await createReferralEvent({
      id: crypto.randomUUID(),
      referralId: referral.id,
      eventType: "referrer_account_linked",
      title: "Referrer account linked",
      description: "Referral linked to authenticated referrer account.",
      metadata: {
        email: normalizedEmail,
      },
      createdAt: nowIso(),
    });
  }
}

export async function requestReferrerLoginCode(input: ReferrerRequestCodeInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const store = await readPersistenceStore();
  const matchingReferrals = store.publicSlyderReferrals.filter(
    (referral) => referral.referrerEmail && normalizeEmail(referral.referrerEmail) === normalizedEmail,
  );

  if (matchingReferrals.length === 0) {
    throw new Error("No referral dashboard account was found for that email yet.");
  }

  const account = await ensureReferrerAccount(normalizedEmail, input.displayName || matchingReferrals[0]?.referrerName);
  if (!account.isEnabled) {
    throw new Error("This referrer account is currently disabled.");
  }

  await attachExistingReferralsToAccount(account.id, normalizedEmail);
  await consumeOutstandingChallenges(account.id, nowIso());

  const code = generateOtpCode();
  const challenge = await createReferrerLoginChallenge({
    id: crypto.randomUUID(),
    referrerAccountId: account.id,
    channel: "email",
    email: normalizedEmail,
    codeHash: hashToken(code),
    expiresAt: expiresIso(LOGIN_CODE_TTL_MS),
    createdAt: nowIso(),
  });

  const notification = await sendReferrerLoginCodeNotification({
    referrerAccountId: account.id,
    email: normalizedEmail,
    displayName: account.fullName,
    code,
    challengeId: challenge.id,
    expiresInMinutes: 10,
  });

  if (notification.status === "failed") {
    throw new Error(notification.failureReason || "Could not deliver the login code email.");
  }

  return {
    challengeId: challenge.id,
    email: normalizedEmail,
    expiresInSeconds: 600,
  };
}

export async function verifyReferrerLoginCode(input: ReferrerVerifyCodeInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const challenge = await findReferrerLoginChallengeById(input.challengeId);

  if (
    !challenge ||
    challenge.channel !== "email" ||
    normalizeEmail(challenge.email || "") !== normalizedEmail ||
    challenge.consumedAt ||
    challenge.codeHash !== hashToken(input.code) ||
    new Date(challenge.expiresAt) <= new Date()
  ) {
    throw new Error("The login code is invalid or expired.");
  }

  const account = challenge.referrerAccountId ? await findReferrerAccountById(challenge.referrerAccountId) : null;
  if (!account) {
    throw new Error("Referrer account not found.");
  }
  if (challenge.referrerAccountId !== account.id) {
    throw new Error("The login code is invalid or expired.");
  }
  if (!account.isEnabled) {
    throw new Error("This referrer account is currently disabled.");
  }

  const timestamp = nowIso();
  await updateReferrerLoginChallenge({
    ...challenge,
    consumedAt: timestamp,
  });

  await attachExistingReferralsToAccount(account.id, normalizedEmail);
  await consumeOutstandingChallenges(account.id, timestamp, challenge.id);
  await invalidateExistingReferrerSessions(account.id);

  const expiresAt = expiresIso(REFERRER_SESSION_TTL_MS);
  const session = await createReferrerSession({
    id: crypto.randomUUID(),
    referrerAccountId: account.id,
    createdAt: timestamp,
    expiresAt,
  });

  await updateReferrerAccount({
    ...account,
    emailVerifiedAt: account.emailVerifiedAt || timestamp,
    updatedAt: timestamp,
  });

  const cookieStore = await cookies();
  cookieStore.set(REFERRER_SESSION_COOKIE, session.id, getReferrerSessionCookieOptions(expiresAt));

  return {
    referrerAccountId: account.id,
    sessionId: session.id,
    expiresAt,
  };
}

export async function logoutReferrer() {
  const context = await getReferrerSessionContext();
  if (context) {
    await deleteReferrerSession(context.session.id);
  }

  const cookieStore = await cookies();
  cookieStore.set(REFERRER_SESSION_COOKIE, "", getReferrerSessionCookieOptions(new Date(0)));

  return { ok: true };
}

export async function getAuthenticatedReferrer() {
  const context = await getReferrerSessionContext();
  if (!context) return null;
  return context.account;
}

export async function getReferrerSessionFromCookie() {
  const context = await getReferrerSessionContext();
  if (!context) return null;

  return {
    account: context.account,
    session: context.session,
  };
}
