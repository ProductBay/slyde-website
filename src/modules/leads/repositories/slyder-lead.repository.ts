import { prisma } from "@/server/db/prisma";
import type { UpdateSlyderLeadInput, ListSlyderLeadsQuery } from "@/modules/leads/schemas/slyder-lead.schema";
import type { CreateSlyderQualificationInput } from "@/modules/leads/schemas/slyder-qualification.schema";

// Explicit type — avoids Zod inference ambiguity in the repository layer
export interface CreateLeadRepositoryInput {
  firstName: string;
  lastName?: string | null;
  email: string;
  whatsapp: string;
  parish?: string | null;
  vehicleType?: string | null;
  source?: string | null;
  referredByCode?: string | null;
  agreementIpAddress?: string | null;
  agreementUserAgent?: string | null;
}

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

export async function createLead(data: CreateLeadRepositoryInput) {
  const referralCode = await generateUniqueReferralCode();
  return prisma.slyderLead.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      email: data.email,
      whatsapp: data.whatsapp,
      parish: data.parish ?? null,
      vehicleType: data.vehicleType ?? null,
      source: data.source ?? null,
      referredByCode: data.referredByCode ?? null,
      referralCode,
      agreementAccepted: true,
      agreementVersion: "slyder-join-v1.0",
      agreementAcceptedAt: new Date(),
      agreementIpAddress: data.agreementIpAddress ?? null,
      agreementUserAgent: data.agreementUserAgent ?? null,
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
      ...(data.applicationInviteUnlocked !== undefined ? { applicationInviteUnlocked: data.applicationInviteUnlocked } : {}),
      ...(data.applicationInviteUnlockedAt !== undefined ? { applicationInviteUnlockedAt: new Date(data.applicationInviteUnlockedAt) } : {}),
    },
  });
}

export async function findLeadById(id: string) {
  return prisma.slyderLead.findUnique({
    where: { id },
    include: { qualification: true },
  });
}

export async function findLeadByEmailOrWhatsapp(email: string, whatsapp: string) {
  const normalizedWhatsapp = whatsapp.replace(/\D/g, "");
  return prisma.slyderLead.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { whatsapp: { contains: normalizedWhatsapp } },
      ],
    },
    orderBy: { createdAt: "desc" },
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
    orderBy: { updatedAt: "desc" },
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
 * Normalise a parish or major town name for comparison:
 * lowercase, remove dots, collapse whitespace, and map major towns to parish keys.
 * e.g. "St. James" -> "st james", "Spanish Town" -> "st catherine"
 */
const PARISH_ALIASES: Record<string, string> = {
  kingston: "kingston",
  "new kingston": "kingston",
  "downtown kingston": "kingston",
  "cross roads": "kingston",
  "st andrew": "st andrew",
  "saint andrew": "st andrew",
  "half way tree": "st andrew",
  "half-way tree": "st andrew",
  "constant spring": "st andrew",
  liguanea: "st andrew",
  papine: "st andrew",
  "st thomas": "st thomas",
  "saint thomas": "st thomas",
  "morant bay": "st thomas",
  yallahs: "st thomas",
  "port morant": "st thomas",
  portland: "portland",
  "port antonio": "portland",
  "buff bay": "portland",
  manchioneal: "portland",
  "st mary": "st mary",
  "saint mary": "st mary",
  "port maria": "st mary",
  "annotto bay": "st mary",
  oracabessa: "st mary",
  "st ann": "st ann",
  "saint ann": "st ann",
  "ocho rios": "st ann",
  "ochos rios": "st ann",
  "st anns bay": "st ann",
  "st ann's bay": "st ann",
  "saint anns bay": "st ann",
  "brown's town": "st ann",
  "browns town": "st ann",
  "runaway bay": "st ann",
  trelawny: "trelawny",
  falmouth: "trelawny",
  "clarks town": "trelawny",
  "clark's town": "trelawny",
  wakefield: "trelawny",
  "st james": "st james",
  "saint james": "st james",
  "montego bay": "st james",
  ironshore: "st james",
  "rose hall": "st james",
  hanover: "hanover",
  lucea: "hanover",
  "green island": "hanover",
  "sandy bay": "hanover",
  westmoreland: "westmoreland",
  westmorelan: "westmoreland",
  "savanna la mar": "westmoreland",
  "savanna-la-mar": "westmoreland",
  negril: "westmoreland",
  whithorn: "westmoreland",
  "st elizabeth": "st elizabeth",
  "saint elizabeth": "st elizabeth",
  "black river": "st elizabeth",
  "santa cruz": "st elizabeth",
  junction: "st elizabeth",
  manchester: "manchester",
  mandeville: "manchester",
  christiana: "manchester",
  porus: "manchester",
  clarendon: "clarendon",
  "may pen": "clarendon",
  chapelton: "clarendon",
  "lionel town": "clarendon",
  "st catherine": "st catherine",
  "saint catherine": "st catherine",
  "spanish town": "st catherine",
  portmore: "st catherine",
  "old harbour": "st catherine",
  "old harbor": "st catherine",
  linstead: "st catherine",
};

export function normalizeParishKey(p: string): string {
  const normalized = p.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  return PARISH_ALIASES[normalized] ?? normalized;
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
