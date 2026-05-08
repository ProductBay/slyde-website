import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { CreateFleetLeadInput, ListFleetLeadsQuery, UpdateFleetLeadInput } from "@/modules/fleet/schemas/fleet-lead.schema";

export async function createFleetLead(data: CreateFleetLeadInput) {
  return prisma.fleetLead.create({
    data: {
      ownerName: data.ownerName,
      companyName: data.companyName,
      whatsapp: data.whatsapp,
      email: data.email || null,
      parish: data.parish || null,
      operatingAreas: data.operatingAreas,
      fleetSize: data.fleetSize || null,
      driverCount: data.driverCount || null,
      vehicleTypes: data.vehicleTypes,
      hasDispatchSystem: data.hasDispatchSystem || null,
      partnershipInterest: data.partnershipInterest || null,
      notes: data.notes || null,
    },
  });
}

export async function findRecentFleetLeadByWhatsapp(whatsapp: string) {
  const normalized = whatsapp.replace(/\D/g, "");
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  return prisma.fleetLead.findFirst({
    where: {
      whatsapp: { contains: normalized },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listFleetLeads(filters: ListFleetLeadsQuery) {
  const where: Prisma.FleetLeadWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.parish) where.parish = { equals: filters.parish, mode: "insensitive" };
  if (filters.q) {
    where.OR = [
      { ownerName: { contains: filters.q, mode: "insensitive" } },
      { companyName: { contains: filters.q, mode: "insensitive" } },
      { whatsapp: { contains: filters.q } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.fleetLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateFleetLead(id: string, data: UpdateFleetLeadInput) {
  return prisma.fleetLead.update({
    where: { id },
    data: {
      ...(data.ownerName !== undefined ? { ownerName: data.ownerName } : {}),
      ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
      ...(data.email !== undefined ? { email: data.email || null } : {}),
      ...(data.parish !== undefined ? { parish: data.parish || null } : {}),
      ...(data.operatingAreas !== undefined ? { operatingAreas: data.operatingAreas } : {}),
      ...(data.fleetSize !== undefined ? { fleetSize: data.fleetSize || null } : {}),
      ...(data.driverCount !== undefined ? { driverCount: data.driverCount || null } : {}),
      ...(data.vehicleTypes !== undefined ? { vehicleTypes: data.vehicleTypes } : {}),
      ...(data.hasDispatchSystem !== undefined ? { hasDispatchSystem: data.hasDispatchSystem || null } : {}),
      ...(data.partnershipInterest !== undefined ? { partnershipInterest: data.partnershipInterest || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.contactedAt !== undefined ? { contactedAt: new Date(data.contactedAt) } : {}),
    },
  });
}
