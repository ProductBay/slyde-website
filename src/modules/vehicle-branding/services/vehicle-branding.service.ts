import type {
  CreateVehicleBrandingLeadInput,
  ListVehicleBrandingLeadsQuery,
  UpdateVehicleBrandingLeadInput,
} from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";
import * as repo from "@/modules/vehicle-branding/repositories/vehicle-branding.repository";

export async function createVehicleBrandingLead(input: CreateVehicleBrandingLeadInput) {
  const existing = await repo.findRecentVehicleBrandingLeadByWhatsapp(input.whatsapp);
  if (existing) {
    return {
      leadId: existing.id,
      duplicate: true,
    };
  }

  const lead = await repo.createVehicleBrandingLead(input);
  return {
    leadId: lead.id,
    duplicate: false,
  };
}

export async function listVehicleBrandingLeads(filters: ListVehicleBrandingLeadsQuery) {
  return repo.listVehicleBrandingLeads(filters);
}

export async function getVehicleBrandingLead(id: string) {
  return repo.findVehicleBrandingLeadById(id);
}

export async function updateVehicleBrandingLead(id: string, input: UpdateVehicleBrandingLeadInput) {
  const lead = await repo.updateVehicleBrandingLead(id, input);
  return {
    leadId: lead.id,
    status: lead.status,
    updatedAt: lead.updatedAt.toISOString(),
  };
}
