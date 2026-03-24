import { cookies } from "next/headers";
import type { SessionRecord, StoredUser, UserRoleCode } from "@/types/backend/onboarding";
import { readPersistenceStore } from "@/server/persistence";

export const SESSION_COOKIE = "slyde_session";

export type SessionContext = {
  session: SessionRecord;
  user: StoredUser;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const store = await readPersistenceStore();
  const session = store.sessions.find((entry) => entry.id === token && new Date(entry.expiresAt) > new Date());
  if (!session) return null;

  const user = store.users.find((entry) => entry.id === session.userId && entry.isEnabled);
  if (!user) return null;

  return { session, user };
}

export function hasRole(user: StoredUser, roles: UserRoleCode[]) {
  return roles.some((role) => user.roles.includes(role));
}
