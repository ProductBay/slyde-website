import { prisma } from "@/server/db/prisma";
import type { ReferralStatus, ReferralReferrerType, SlyderReferralFilters } from "@/modules/referrals/schemas/slyder-referral.schema";
import type { ReferralPayoutStatus, SlyderReferralPayoutFilters } from "@/modules/referrals/schemas/slyder-referral-payout.schema";

// Charset excludes ambiguous chars O, I, 0, 1
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateSlyderReferralCode(): string {
  let code = "SLYDE-";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function generateUniqueSlyderReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateSlyderReferralCode();
    const existing = await prisma.slyderReferral.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  // Fallback with timestamp suffix to guarantee uniqueness
  return `SLYDE-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

// ─── Referral CRUD ───────────────────────────────────────────

export async function createSlyderReferral(data: {
  referralCode: string;
  referralLink?: string;
  referrerType: ReferralReferrerType;
  referrerName: string;
  referrerEmail?: string;
  referrerWhatsapp: string;
  referrerSlyderId?: string;
  referredFirstName?: string;
  referredLastName?: string;
  referredEmail?: string;
  referredWhatsapp?: string;
}) {
  return prisma.slyderReferral.create({ data });
}

export async function findSlyderReferralById(id: string) {
  return prisma.slyderReferral.findUnique({
    where: { id },
    include: { payouts: { orderBy: { cycleNumber: "asc" } } },
  });
}

export async function findSlyderReferralByCode(code: string) {
  return prisma.slyderReferral.findUnique({
    where: { referralCode: code },
    include: { payouts: { orderBy: { cycleNumber: "asc" } } },
  });
}

export async function findSlyderReferralByReferredPhone(phone: string) {
  return prisma.slyderReferral.findFirst({
    where: { referredWhatsapp: phone },
    orderBy: { createdAt: "asc" },
  });
}

export async function findSlyderReferralByReferredSlyderId(slyderId: string) {
  return prisma.slyderReferral.findFirst({
    where: { referredSlyderId: slyderId },
    orderBy: { createdAt: "asc" },
  });
}

export async function findSlyderReferralByReferredApplicationId(applicationId: string) {
  return prisma.slyderReferral.findFirst({
    where: { referredApplicationId: applicationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function listSlyderReferralsByReferrerSlyderId(referrerSlyderId: string) {
  return prisma.slyderReferral.findMany({
    where: { referrerSlyderId },
    include: { payouts: { orderBy: { cycleNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSlyderReferral(
  id: string,
  data: Partial<{
    referralLink: string;
    referredFirstName: string;
    referredLastName: string;
    referredEmail: string;
    referredWhatsapp: string;
    referredLeadId: string;
    referredApplicationId: string;
    referredSlyderId: string;
    status: ReferralStatus;
    paidAmount: number;
    remainingAmount: number;
    rentCyclesCompleted: number;
    qualificationNotes: string;
    adminNotes: string;
    firstRentPaidAt: Date;
    rewardActivatedAt: Date;
    paidOutAt: Date;
  }>,
) {
  return prisma.slyderReferral.update({ where: { id }, data });
}

export async function listSlyderReferrals(filters: SlyderReferralFilters) {
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.referrerType) where.referrerType = filters.referrerType;
  if (filters.search) {
    const s = filters.search;
    where.OR = [
      { referralCode: { contains: s, mode: "insensitive" } },
      { referrerName: { contains: s, mode: "insensitive" } },
      { referrerWhatsapp: { contains: s } },
      { referredWhatsapp: { contains: s } },
      { referredFirstName: { contains: s, mode: "insensitive" } },
      { referredLastName: { contains: s, mode: "insensitive" } },
    ];
  }

  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.slyderReferral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: { payouts: { orderBy: { cycleNumber: "asc" } } },
    }),
    prisma.slyderReferral.count({ where }),
  ]);

  return { rows, total, page: filters.page, pageSize: filters.pageSize };
}

// ─── Payout CRUD ─────────────────────────────────────────────

export async function createSlyderReferralPayout(data: {
  referralId: string;
  cycleNumber: number;
  rentAmount?: number;
  payoutAmount?: number;
}) {
  return prisma.slyderReferralPayout.create({
    data: {
      referralId: data.referralId,
      cycleNumber: data.cycleNumber,
      rentAmount: data.rentAmount ?? 2000,
      payoutAmount: data.payoutAmount ?? 1000,
    },
  });
}

export async function findSlyderReferralPayoutById(id: string) {
  return prisma.slyderReferralPayout.findUnique({
    where: { id },
    include: { referral: true },
  });
}

export async function findSlyderReferralPayoutByCycle(referralId: string, cycleNumber: number) {
  return prisma.slyderReferralPayout.findUnique({
    where: { referralId_cycleNumber: { referralId, cycleNumber } },
  });
}

export async function updateSlyderReferralPayout(
  id: string,
  data: Partial<{
    status: ReferralPayoutStatus;
    payoutMethod: string;
    externalReference: string;
    adminNotes: string;
    earnedAt: Date;
    approvedAt: Date;
    paidAt: Date;
  }>,
) {
  return prisma.slyderReferralPayout.update({ where: { id }, data });
}

export async function listSlyderReferralPayouts(filters: SlyderReferralPayoutFilters) {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.referralId) where.referralId = filters.referralId;

  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.slyderReferralPayout.findMany({
      where,
      orderBy: [{ earnedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: filters.pageSize,
      include: { referral: true },
    }),
    prisma.slyderReferralPayout.count({ where }),
  ]);

  return { rows, total, page: filters.page, pageSize: filters.pageSize };
}

// ─── Summary helpers ─────────────────────────────────────────

export async function getSlyderReferralSummaryForSlyder(referrerSlyderId: string) {
  const referrals = await listSlyderReferralsByReferrerSlyderId(referrerSlyderId);

  const totalReferrals = referrals.length;
  const liveReferrals = referrals.filter((r) =>
    ["LIVE", "REWARD_ACTIVE", "PARTIAL_PAID", "PAID_OUT"].includes(r.status),
  ).length;
  const totalEarned = referrals.reduce((s, r) => s + r.paidAmount + (r.remainingAmount < r.totalRewardAmount ? r.paidAmount : 0), 0);
  const totalPaid = referrals.reduce((s, r) => s + r.paidAmount, 0);
  const remainingPotential = referrals.reduce((s, r) => s + r.remainingAmount, 0);

  return {
    totalReferrals,
    liveReferrals,
    totalEarned: referrals.reduce(
      (s, r) =>
        s +
        r.payouts.filter((p) => ["EARNED", "APPROVED", "PAID"].includes(p.status)).reduce((ps, p) => ps + p.payoutAmount, 0),
      0,
    ),
    totalPaid,
    remainingPotential,
    referrals,
  };
}
