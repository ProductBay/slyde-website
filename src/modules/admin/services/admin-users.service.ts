import { UserRoleCode, UserType } from "@prisma/client";
import { buildWhatsappWebUrl } from "@/server/notifications/providers";
import {
  getUserRegistrationWelcomeWhatsappMessage,
  resendUserRegistrationWelcomeEmail,
} from "@/server/notifications/notification.service";
import { prisma } from "@/server/db/prisma";
import { withPersistenceTransaction } from "@/server/persistence";

export type AdminUserStatusFilter = "enabled" | "disabled";

export type AdminUserFilters = {
  search?: string;
  userType?: UserType;
  role?: UserRoleCode;
  status?: AdminUserStatusFilter;
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserType;
  roles: UserRoleCode[];
  isEnabled: boolean;
  accountStatus: string;
  createdAt: string;
  lastLoginAt: string | null;
  lastSessionAt: string | null;
  lastActivityAt: string | null;
  activeSessionCount: number;
};

function normalizeSearch(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function listAdminUsers(filters: AdminUserFilters): Promise<AdminUserRow[]> {
  const now = new Date();
  const search = normalizeSearch(filters.search);

  const users = await prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.userType ? { userType: filters.userType } : {}),
      ...(filters.role ? { roles: { has: filters.role } } : {}),
      ...(filters.status ? { isEnabled: filters.status === "enabled" } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      userType: true,
      roles: true,
      isEnabled: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const userIds = users.map((item) => item.id);
  const activeSessionCounts = userIds.length
    ? await prisma.sessionRecord.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          expiresAt: { gt: now },
        },
        _count: { _all: true },
      })
    : [];

  const activeByUserId = new Map(activeSessionCounts.map((item) => [item.userId, item._count._all]));

  return users.map((user) => {
    const lastSessionAt = user.sessions[0]?.createdAt ?? null;
    const lastActivitySource = [user.lastLoginAt, lastSessionAt]
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      roles: user.roles,
      isEnabled: user.isEnabled,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      lastSessionAt: lastSessionAt?.toISOString() ?? null,
      lastActivityAt: lastActivitySource?.toISOString() ?? null,
      activeSessionCount: activeByUserId.get(user.id) ?? 0,
    };
  });
}

export async function resendAdminUserRegistrationEmail(userId: string, triggeredByUserId?: string) {
  return withPersistenceTransaction((store) => resendUserRegistrationWelcomeEmail(store, userId, triggeredByUserId));
}

export async function getAdminUserRegistrationWhatsappUrl(userId: string) {
  const { recipient, body } = await withPersistenceTransaction((store) =>
    getUserRegistrationWelcomeWhatsappMessage(store, userId),
  );
  const whatsappUrl = buildWhatsappWebUrl(recipient, body);
  if (!whatsappUrl) throw new Error("A valid WhatsApp phone number is required.");

  return { whatsappUrl };
}
