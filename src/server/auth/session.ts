import { cookies } from "next/headers";
import type { SessionRecord, StoredUser, UserRoleCode } from "@/types/backend/onboarding";
import { readPersistenceStore } from "@/server/persistence";
import { verifyStatelessSessionToken } from "@/server/auth/stateless-session";

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
  const statelessSession = verifyStatelessSessionToken(token);
  if (statelessSession) {
    const user = store.users.find((entry) => entry.id === statelessSession.userId && entry.isEnabled);
    if (!user) return null;

    return {
      session: {
        id: token,
        userId: user.id,
        roles: statelessSession.roles as UserRoleCode[],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(statelessSession.exp * 1000).toISOString(),
      },
      user,
    };
  }

  const session = store.sessions.find((entry) => entry.id === token && new Date(entry.expiresAt) > new Date());
  if (!session) return null;

  const user = store.users.find((entry) => entry.id === session.userId && entry.isEnabled);
  if (!user) return null;

  return { session, user };
}

export function hasRole(user: StoredUser, roles: UserRoleCode[]) {
  return roles.some((role) => user.roles.includes(role));
}
