import crypto from "node:crypto";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import {
  createMerchantLead as persistMerchantLead,
  findMerchantLeadByEmailOrPhone,
  listMerchantLeads,
  updateMerchantLead,
} from "@/modules/merchant/repositories/merchant.repository";
import { determineMerchantProductIntent } from "@/modules/merchant/services/merchant-routing.service";
import type { MerchantLead, MerchantLeadFilters } from "@/types/backend/onboarding";
import type { MerchantLeadInput } from "@/modules/merchant/schemas/merchant-lead.schema";

function nowIso() {
  return new Date().toISOString();
}

export async function createMerchantLead(input: MerchantLeadInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = normalizePhone(input.phone);
  const existing = await findMerchantLeadByEmailOrPhone(normalizedEmail, normalizedPhone);
  const resolvedProductIntent = determineMerchantProductIntent({
    productIntent: input.productIntent,
    orderChannels: input.orderChannels,
  });

  if (existing) {
    const timestamp = nowIso();
    const mergedOrderChannels = Array.from(
      new Set([...existing.orderChannels, ...input.orderChannels.map((item) => item.trim())]),
    );
    const nextProductIntent =
      existing.productIntent === resolvedProductIntent ||
      existing.productIntent === "both" ||
      resolvedProductIntent === "both"
        ? existing.productIntent === "both" || resolvedProductIntent === "both"
          ? "both"
          : existing.productIntent
        : "both";

    const updatedLead: MerchantLead = {
      ...existing,
      businessName: input.businessName.trim() || existing.businessName,
      contactName: input.contactName.trim() || existing.contactName,
      phone: normalizedPhone || existing.phone,
      email: normalizedEmail || existing.email,
      parish: input.parish.trim() || existing.parish,
      town: input.town.trim() || existing.town,
      category: input.category.trim() || existing.category,
      instagramHandle: input.instagramHandle?.trim() || existing.instagramHandle,
      website: input.website?.trim() || existing.website,
      orderChannels: mergedOrderChannels,
      averageDailyOrders: input.averageDailyOrders?.trim() || existing.averageDailyOrders,
      currentDeliveryMethod: input.currentDeliveryMethod?.trim() || existing.currentDeliveryMethod,
      preferredStartTimeline: input.preferredStartTimeline?.trim() || existing.preferredStartTimeline,
      productIntent: nextProductIntent,
      updatedAt: timestamp,
    };

    return updateMerchantLead(updatedLead);
  }

  const timestamp = nowIso();
  const lead: MerchantLead = {
    id: crypto.randomUUID(),
    businessName: input.businessName.trim(),
    contactName: input.contactName.trim(),
    phone: normalizedPhone,
    email: normalizedEmail,
    parish: input.parish.trim(),
    town: input.town.trim(),
    category: input.category.trim(),
    instagramHandle: input.instagramHandle?.trim() || undefined,
    website: input.website?.trim() || undefined,
    orderChannels: input.orderChannels.map((item) => item.trim()),
    averageDailyOrders: input.averageDailyOrders?.trim() || undefined,
    currentDeliveryMethod: input.currentDeliveryMethod?.trim() || undefined,
    preferredStartTimeline: input.preferredStartTimeline?.trim() || undefined,
    productIntent: resolvedProductIntent,
    status: "submitted",
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return persistMerchantLead(lead);
}

export async function getMerchantLead(id: string) {
  const rows = await listMerchantLeads();
  return rows.find((item) => item.id === id) ?? null;
}

export async function listMerchantLeadRows(filters?: MerchantLeadFilters) {
  return listMerchantLeads(filters);
}
