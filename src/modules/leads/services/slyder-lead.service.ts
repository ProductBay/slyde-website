import type { CreateSlyderLeadInput, UpdateSlyderLeadInput, ConvertSlyderLeadInput, ListSlyderLeadsQuery } from "@/modules/leads/schemas/slyder-lead.schema";
import type { CreateSlyderQualificationInput } from "@/modules/leads/schemas/slyder-qualification.schema";
import * as repo from "@/modules/leads/repositories/slyder-lead.repository";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { buildWhatsappWebUrl } from "@/server/notifications/providers";
import { sendTemplateNotification } from "@/server/notifications/notification.service";

type SlyderLeadNotificationTarget = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  whatsapp: string;
  parish: string | null;
  vehicleType: string | null;
  referralCode: string | null;
};

function buildLeadNotificationContext(lead: SlyderLeadNotificationTarget) {
  const baseUrl = getAppBaseUrl();
  const statusUrl = `${baseUrl}/join/slyder/status?leadId=${encodeURIComponent(lead.id)}`;
  const applicationUrl = `${baseUrl}/become-a-slyder/apply?leadId=${encodeURIComponent(lead.id)}`;
  const supportEmail = process.env.RESEND_FROM_EMAIL || "info@slyde.app";
  const supportPhone = process.env.SLYDE_SUPPORT_PHONE || "876-594-7320";

  return {
    variables: {
      firstName: lead.firstName,
      fullName: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
      email: lead.email,
      whatsapp: lead.whatsapp,
      parish: lead.parish || "your area",
      vehicleType: lead.vehicleType || "your vehicle",
      referralCode: lead.referralCode || "pending",
      statusUrl,
      applicationUrl,
      supportEmail,
      supportPhone,
    },
    payload: {
      leadId: lead.id,
      statusUrl,
      applicationUrl,
      referralCode: lead.referralCode,
      parish: lead.parish,
      vehicleType: lead.vehicleType,
    },
  };
}

async function sendSlyderLeadReceivedNotifications(lead: SlyderLeadNotificationTarget, options?: { force?: boolean; triggeredByUserId?: string }) {
  const { variables, payload } = buildLeadNotificationContext(lead);

  const [email, whatsapp] = await Promise.all([
    sendTemplateNotification({
      templateKey: "slyder_lead_received_email",
      actorType: "slyder_applicant",
      recipient: lead.email,
      recipientName: variables.fullName,
      variables,
      payload,
      dedupeKey: `slyder_lead_received:email:${lead.id}`,
      force: options?.force,
      triggeredByUserId: options?.triggeredByUserId,
      createdBySystem: !options?.triggeredByUserId,
    }),
    sendTemplateNotification({
      templateKey: "slyder_lead_received_whatsapp",
      actorType: "slyder_applicant",
      recipient: lead.whatsapp,
      recipientName: variables.fullName,
      variables,
      payload,
      dedupeKey: `slyder_lead_received:whatsapp:${lead.id}`,
      force: options?.force,
      triggeredByUserId: options?.triggeredByUserId,
      createdBySystem: !options?.triggeredByUserId,
    }),
  ]);

  return { email, whatsapp };
}

export async function createSlyderLead(input: CreateSlyderLeadInput) {
  const lead = await repo.createLead(input);
  await sendSlyderLeadReceivedNotifications(lead).catch((error) => {
    console.error("[slyder-lead] welcome notifications failed", {
      leadId: lead.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return {
    leadId: lead.id,
    referralCode: lead.referralCode,
  };
}

export async function resendSlyderLeadEmail(leadId: string, triggeredByUserId?: string) {
  const lead = await repo.findLeadById(leadId);
  if (!lead) throw new Error("Slyder lead not found");

  const { email } = await sendSlyderLeadReceivedNotifications(lead, { force: true, triggeredByUserId });
  return email;
}

export async function getSlyderLeadWhatsappUrl(leadId: string) {
  const lead = await repo.findLeadById(leadId);
  if (!lead) throw new Error("Slyder lead not found");

  const { variables } = buildLeadNotificationContext(lead);
  const body = [
    `Hi ${variables.firstName}, this is SLYDE. Your Founding Slyder spot has been reserved.`,
    `Check your Slyder status and next step here: ${variables.statusUrl}`,
    `Referral code: ${variables.referralCode}`,
    `Need help? ${variables.supportPhone}`,
  ].join("\n\n");
  const whatsappUrl = buildWhatsappWebUrl(lead.whatsapp, body);
  if (!whatsappUrl) throw new Error("A valid WhatsApp phone number is required.");

  return { whatsappUrl };
}

export async function updateSlyderLead(id: string, input: UpdateSlyderLeadInput) {
  const lead = await repo.updateLead(id, input);
  return {
    leadId: lead.id,
    status: lead.status,
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function qualifySlyderLead(input: CreateSlyderQualificationInput) {
  await repo.upsertQualification(input);

  let score = 0;
  if (input.hasVehicle) score += 20;
  if (input.hasSmartphone) score += 20;
  if (input.usesWhatsapp) score += 20;
  if (input.hasDataAccess) score += 20;
  if (input.availableWeekly) score += 20;

  const newStatus = score >= 60 ? "QUALIFIED" : "NURTURING";

  await repo.updateLead(input.leadId, {
    status: newStatus as "QUALIFIED" | "NURTURING",
    qualificationNotes: `Auto-scored ${score}/100`,
  });

  return {
    status: newStatus,
    qualificationScore: score,
    nextUrl: `/join/slyder/status?leadId=${input.leadId}`,
  };
}

export async function convertSlyderLead(input: ConvertSlyderLeadInput) {
  const updateData: UpdateSlyderLeadInput = {
    status: input.status,
    ...(input.applicationId ? { applicationId: input.applicationId } : {}),
  };

  if (input.status === "SUBMITTED") {
    await repo.updateLead(input.leadId, updateData);
    await repo.updateLead(input.leadId, {
      lastContactedAt: new Date().toISOString(),
    });
  } else {
    await repo.updateLead(input.leadId, updateData);
  }

  return { ok: true };
}

export async function listSlyderLeads(filters: ListSlyderLeadsQuery) {
  return repo.listLeads(filters);
}
