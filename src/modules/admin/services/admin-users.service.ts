import { UserRoleCode, UserType } from "@prisma/client";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { sendTemplateNotification } from "@/server/notifications/notification.service";
import { buildWhatsappWebUrl } from "@/server/notifications/providers";
import { prisma } from "@/server/db/prisma";

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

function resolveAccountTypeLabel(userType: UserType) {
  if (userType === UserType.slyder) return "Slyder";
  if (userType === UserType.merchant) return "Merchant";
  return "SLYDE user";
}

export async function resendAdminUserRegistrationEmail(userId: string, triggeredByUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      userType: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const baseUrl = getAppBaseUrl();
  const notification = await sendTemplateNotification({
    templateKey: "user_registration_welcome_email",
    actorType: "public_user",
    actorId: user.id,
    recipient: user.email,
    recipientName: user.fullName,
    variables: {
      fullName: user.fullName,
      accountTypeLabel: resolveAccountTypeLabel(user.userType),
      profileUrl: `${baseUrl}/account`,
      supportUrl: `${baseUrl}/support`,
      becomeSlyderUrl: `${baseUrl}/become-a-slyder`,
      businessPartnerUrl: `${baseUrl}/for-businesses`,
      dispatchFromHomeUrl: `${baseUrl}/dispatch-from-home`,
      referUrl: `${baseUrl}/refer`,
      supportEmail: process.env.RESEND_FROM_EMAIL || "info@slyde.app",
      supportPhone: process.env.SLYDE_SUPPORT_PHONE || "876-594-7320",
    },
    payload: {
      userId: user.id,
      source: "admin_resend_registration",
    },
    dedupeKey: `admin_resend_registration_email:${user.id}:${Date.now()}`,
    force: true,
    triggeredByUserId,
    createdBySystem: !triggeredByUserId,
  });

  return notification;
}

export async function getAdminUserRegistrationWhatsappUrl(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const baseUrl = getAppBaseUrl();
  const firstName = user.fullName.split(" ")[0] || "there";
  const body = [
    `Hi ${firstName}, your SLYDE registration link is ready.`,
    `Create or complete your account here: ${baseUrl}/login?tab=register`,
    `Sign in anytime here: ${baseUrl}/login`,
    `Need help? ${process.env.SLYDE_SUPPORT_PHONE || "876-594-7320"}`,
  ].join("\n\n");

  const whatsappUrl = buildWhatsappWebUrl(user.phone, body);
  if (!whatsappUrl) {
    throw new Error("A valid phone number is required to build the WhatsApp message.");
  }

  return { whatsappUrl };
}
