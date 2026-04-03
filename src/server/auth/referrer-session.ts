import { cookies } from "next/headers";
import type { ReferrerAccount, ReferrerSession } from "@/types/backend/onboarding";
import { readPersistenceStore } from "@/server/persistence";

export const REFERRER_SESSION_COOKIE = "slyde_referrer_session";

export type ReferrerSessionContext = {
  session: ReferrerSession;
  account: ReferrerAccount;
};

export async function getReferrerSessionContext(): Promise<ReferrerSessionContext | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(REFERRER_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const store = await readPersistenceStore();
  const session = store.referrerSessions.find(
    (entry) =>
      entry.id === sessionId &&
      new Date(entry.expiresAt) > new Date(),
  );

  if (!session) return null;

  const account = store.referrerAccounts.find((entry) => entry.id === session.referrerAccountId);
  if (!account || !account.isEnabled) return null;

  return { session, account };
}
