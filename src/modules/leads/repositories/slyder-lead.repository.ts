import { prisma } from "@/server/db/prisma";
import type { CreateSlyderLeadInput, UpdateSlyderLeadInput, ListSlyderLeadsQuery } from "@/modules/leads/schemas/slyder-lead.schema";
import type { CreateSlyderQualificationInput } from "@/modules/leads/schemas/slyder-qualification.schema";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SL-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();
    const existing = await prisma.slyderLead.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  // Fallback with timestamp suffix
  return `SL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function createLead(data: CreateSlyderLeadInput) {
  const referralCode = await generateUniqueReferralCode();
  return prisma.slyderLead.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      whatsapp: data.whatsapp,
      parish: data.parish,
      vehicleType: data.vehicleType,
      source: data.source,
      referredByCode: data.referredByCode,
      referralCode,
    },
  });
}

export async function updateLead(id: string, data: UpdateSlyderLeadInput) {
  return prisma.slyderLead.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
      ...(data.parish !== undefined ? { parish: data.parish } : {}),
      ...(data.vehicleType !== undefined ? { vehicleType: data.vehicleType } : {}),
      ...(data.source !== undefined ? { source: data.source } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.qualificationNotes !== undefined ? { qualificationNotes: data.qualificationNotes } : {}),
      ...(data.lastContactedAt !== undefined ? { lastContactedAt: new Date(data.lastContactedAt) } : {}),
      ...(data.applicationId !== undefined ? { applicationId: data.applicationId } : {}),
      ...(data.actionCenterTitle !== undefined ? { actionCenterTitle: data.actionCenterTitle } : {}),
      ...(data.actionCenterBody !== undefined ? { actionCenterBody: data.actionCenterBody } : {}),
      ...(data.actionCenterCtaLabel !== undefined ? { actionCenterCtaLabel: data.actionCenterCtaLabel } : {}),
      ...(data.actionCenterCtaHref !== undefined ? { actionCenterCtaHref: data.actionCenterCtaHref } : {}),
      ...(data.actionCenterUpdatedAt !== undefined ? { actionCenterUpdatedAt: new Date(data.actionCenterUpdatedAt) } : {}),
    },
  });
}

export async function findLeadById(id: string) {
  return prisma.slyderLead.findUnique({
    where: { id },
    include: { qualification: true },
  });
}

export async function listLeads(filters: ListSlyderLeadsQuery) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.parish) {
    where.parish = { equals: filters.parish, mode: "insensitive" };
  }
  if (filters.vehicleType) {
    where.vehicleType = { equals: filters.vehicleType, mode: "insensitive" };
  }
  if (filters.q) {
    where.OR = [
      { firstName: { contains: filters.q, mode: "insensitive" } },
      { lastName: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
      { whatsapp: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.slyderLead.findMany({
    where,
    include: { qualification: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertQualification(data: CreateSlyderQualificationInput) {
  return prisma.slyderQualification.upsert({
    where: { leadId: data.leadId },
    create: {
      leadId: data.leadId,
      hasVehicle: data.hasVehicle,
      hasSmartphone: data.hasSmartphone,
      usesWhatsapp: data.usesWhatsapp,
      hasDataAccess: data.hasDataAccess,
      availableWeekly: data.availableWeekly,
      preferredZones: data.preferredZones,
      preferredSchedule: data.preferredSchedule,
      deliveryExperience: data.deliveryExperience,
      readinessLevel: data.readinessLevel,
    },
    update: {
      hasVehicle: data.hasVehicle,
      hasSmartphone: data.hasSmartphone,
      usesWhatsapp: data.usesWhatsapp,
      hasDataAccess: data.hasDataAccess,
      availableWeekly: data.availableWeekly,
      preferredZones: data.preferredZones,
      preferredSchedule: data.preferredSchedule,
      deliveryExperience: data.deliveryExperience,
      readinessLevel: data.readinessLevel,
    },
  });
}

export async function getFunnelMetrics() {
  const grouped = await prisma.slyderLead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countMap = new Map(grouped.map((item) => [item.status as string, item._count._all]));
  const get = (status: string) => countMap.get(status) ?? 0;

  const totalLeads = grouped.reduce((sum, item) => sum + item._count._all, 0);
  const qualified = get("QUALIFIED");
  const nurturing = get("NURTURING");
  const startedApplication = get("STARTED_APPLICATION");
  const submitted = get("SUBMITTED");
  const underReview = get("UNDER_REVIEW");
  const approved = get("APPROVED");
  const activated = get("ACTIVATED");
  const live = get("LIVE");
  const rejected = get("REJECTED");

  const pct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0;

  return {
    totalLeads,
    qualified,
    nurturing,
    startedApplication,
    submitted,
    underReview,
    approved,
    activated,
    live,
    rejected,
    conversionRates: {
      leadToQualified: pct(qualified + nurturing, totalLeads),
      qualifiedToStarted: pct(startedApplication, qualified + nurturing),
      startedToSubmitted: pct(submitted, startedApplication),
      submittedToApproved: pct(approved, submitted + underReview),
      approvedToActivated: pct(activated + live, approved),
    },
  };
}

/**
 * Normalise a parish name for comparison:
 * lowercase, remove dots, collapse whitespace.
 * e.g. "St. James" → "st james", "St. Andrew" → "st andrew"
 */
export function normalizeParishKey(p: string): string {
  return p.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

/**
 * Returns a map of normalised parish key → lead count.
 * Only rows where parish is not null are included.
 */
export async function getLeadCountsByParish(): Promise<Record<string, number>> {
  const rows = await prisma.slyderLead.groupBy({
    by: ["parish"],
    _count: { _all: true },
    where: { parish: { not: null } },
  });

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (row.parish) {
      const key = normalizeParishKey(row.parish);
      result[key] = (result[key] ?? 0) + row._count._all;
    }
  }
  return result;
}
