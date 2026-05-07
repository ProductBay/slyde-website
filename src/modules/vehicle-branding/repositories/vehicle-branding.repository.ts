import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  CreateVehicleBrandingLeadInput,
  ListVehicleBrandingLeadsQuery,
  UpdateVehicleBrandingLeadInput,
} from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

export async function createVehicleBrandingLead(data: CreateVehicleBrandingLeadInput) {
  return prisma.vehicleBrandingLead.create({
    data: {
      fullName: data.fullName,
      whatsapp: data.whatsapp,
      email: data.email?.trim() || null,
      currentSlyderStatus: data.currentSlyderStatus || null,
      vehicleType: data.vehicleType || null,
      brandingInterest: data.brandingInterest,
      parish: data.parish || null,
      notes: data.notes || null,
    },
  });
}

export async function findRecentVehicleBrandingLeadByWhatsapp(whatsapp: string) {
  const digits = normalizeWhatsapp(whatsapp);
  const recentCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  return prisma.vehicleBrandingLead.findFirst({
    where: {
      whatsapp: { contains: digits },
      createdAt: { gte: recentCutoff },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findVehicleBrandingLeadById(id: string) {
  return prisma.vehicleBrandingLead.findUnique({ where: { id } });
}

export async function listVehicleBrandingLeads(filters: ListVehicleBrandingLeadsQuery) {
  const where: Prisma.VehicleBrandingLeadWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.parish) {
    where.parish = { equals: filters.parish, mode: "insensitive" };
  }
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: "insensitive" } },
      { whatsapp: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.vehicleBrandingLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateVehicleBrandingLead(id: string, data: UpdateVehicleBrandingLeadInput) {
  return prisma.vehicleBrandingLead.update({
    where: { id },
    data: {
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
      ...(data.email !== undefined ? { email: data.email.trim() || null } : {}),
      ...(data.currentSlyderStatus !== undefined ? { currentSlyderStatus: data.currentSlyderStatus || null } : {}),
      ...(data.vehicleType !== undefined ? { vehicleType: data.vehicleType || null } : {}),
      ...(data.brandingInterest !== undefined ? { brandingInterest: data.brandingInterest } : {}),
      ...(data.parish !== undefined ? { parish: data.parish || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.contactedAt !== undefined ? { contactedAt: new Date(data.contactedAt) } : {}),
    },
  });
}
