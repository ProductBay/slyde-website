import type { CreateFleetLeadInput, ListFleetLeadsQuery, UpdateFleetLeadInput } from "@/modules/fleet/schemas/fleet-lead.schema";
import * as repo from "@/modules/fleet/repositories/fleet-lead.repository";

export async function createFleetLead(input: CreateFleetLeadInput) {
  const existing = await repo.findRecentFleetLeadByWhatsapp(input.whatsapp);
  if (existing) {
    return {
      leadId: existing.id,
      duplicate: true,
    };
  }

  const lead = await repo.createFleetLead(input);
  return {
    leadId: lead.id,
    duplicate: false,
  };
}

export async function listFleetLeads(filters: ListFleetLeadsQuery) {
  return repo.listFleetLeads(filters);
}

export async function updateFleetLead(id: string, input: UpdateFleetLeadInput) {
  const lead = await repo.updateFleetLead(id, input);
  return {
    leadId: lead.id,
    status: lead.status,
    updatedAt: lead.updatedAt.toISOString(),
  };
}
