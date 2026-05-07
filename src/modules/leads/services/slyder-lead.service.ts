import type {
  CreateSlyderLeadInput,
  UpdateSlyderLeadInput,
  ConvertSlyderLeadInput,
  ListSlyderLeadsQuery,
  SlyderLeadActionCenterInput,
} from "@/modules/leads/schemas/slyder-lead.schema";
import type { CreateSlyderQualificationInput } from "@/modules/leads/schemas/slyder-qualification.schema";
import * as repo from "@/modules/leads/repositories/slyder-lead.repository";
import { attachReferralToLead } from "@/modules/referrals/services/slyder-referral.service";
import { findSlyderReferralByCode } from "@/modules/referrals/repositories/slyder-referral.repository";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { buildWhatsappWebUrl } from "@/server/notifications/providers";
import { sendSlyderReferralUsedNotifications, sendTemplateNotification } from "@/server/notifications/notification.service";

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
  const applicationUrl = `${baseUrl}/join/slyder?leadId=${encodeURIComponent(lead.id)}`;
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

function toAbsoluteAppUrl(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
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

async function sendSlyderLeadActionCenterNotifications(
  lead: SlyderLeadNotificationTarget,
  input: SlyderLeadActionCenterInput,
  options?: { triggeredByUserId?: string },
) {
  const { variables: baseVariables, payload: basePayload } = buildLeadNotificationContext(lead);
  const ctaUrl = toAbsoluteAppUrl(input.actionCenterCtaHref, `${baseVariables.statusUrl}`);
  const ctaLine = input.actionCenterCtaLabel && input.actionCenterCtaHref
    ? `${input.actionCenterCtaLabel}: ${ctaUrl}`
    : "";
  const variables = {
    ...baseVariables,
    actionTitle: input.actionCenterTitle,
    actionBody: input.actionCenterBody,
    ctaLabel: input.actionCenterCtaLabel || "Open Action Center",
    ctaUrl,
    ctaLine,
  };
  const payload = {
    ...basePayload,
    actionTitle: input.actionCenterTitle,
    actionBody: input.actionCenterBody,
    ctaUrl,
  };
  const timestamp = Date.now();

  const tasks: Promise<unknown>[] = [];
  if (input.notifyEmail) {
    tasks.push(
      sendTemplateNotification({
        templateKey: "slyder_lead_action_center_update_email",
        actorType: "slyder_applicant",
        recipient: lead.email,
        recipientName: variables.fullName,
        variables,
        payload,
        dedupeKey: `slyder_lead_action_center:email:${lead.id}:${timestamp}`,
        force: true,
        triggeredByUserId: options?.triggeredByUserId,
        createdBySystem: !options?.triggeredByUserId,
      }),
    );
  }
  if (input.notifyWhatsapp) {
    tasks.push(
      sendTemplateNotification({
        templateKey: "slyder_lead_action_center_update_whatsapp",
        actorType: "slyder_applicant",
        recipient: lead.whatsapp,
        recipientName: variables.fullName,
        variables,
        payload,
        dedupeKey: `slyder_lead_action_center:whatsapp:${lead.id}:${timestamp}`,
        force: true,
        triggeredByUserId: options?.triggeredByUserId,
        createdBySystem: !options?.triggeredByUserId,
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}

export async function createSlyderLead(input: CreateSlyderLeadInput) {
  const referredByCode = input.referredByCode?.trim().toUpperCase();
  const normalizedInput = {
    ...input,
    ...(referredByCode ? { referredByCode } : {}),
  };

  const referral = referredByCode ? await findSlyderReferralByCode(referredByCode) : null;
  if (referredByCode && !referral) {
    throw new Error("Referral code not found.");
  }

  if (referral && referral.referrerWhatsapp.replace(/\D/g, "") === input.whatsapp.replace(/\D/g, "")) {
    throw new Error("A referrer cannot use their own referral code.");
  }

  // Duplicate check — return existing lead instead of creating a second registration
  const existing = await repo.findLeadByEmailOrWhatsapp(input.email, input.whatsapp);
  if (existing) {
    return {
      leadId: existing.id,
      referralCode: existing.referralCode,
      duplicate: true,
    };
  }

  const lead = await repo.createLead(normalizedInput);

  let attachedReferral = null;
  if (referredByCode) {
    attachedReferral = await attachReferralToLead({
      referralCode: referredByCode,
      leadId: lead.id,
      referredFirstName: lead.firstName,
      referredLastName: lead.lastName || undefined,
      referredEmail: lead.email,
      referredWhatsapp: lead.whatsapp,
    });
  }

  await sendSlyderLeadReceivedNotifications(lead).catch((error) => {
    console.error("[slyder-lead] welcome notifications failed", {
      leadId: lead.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  if (attachedReferral) {
    await sendSlyderReferralUsedNotifications(attachedReferral, lead).catch((error) => {
      console.error("[slyder-lead] referral-used notifications failed", {
        leadId: lead.id,
        referralId: attachedReferral.id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

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

export async function updateSlyderLeadActionCenter(
  id: string,
  input: SlyderLeadActionCenterInput,
  triggeredByUserId?: string,
) {
  const existingLead = await repo.findLeadById(id);
  if (!existingLead) throw new Error("Slyder lead not found");

  const lead = await repo.updateLead(id, {
    ...(input.status ? { status: input.status } : {}),
    actionCenterTitle: input.actionCenterTitle,
    actionCenterBody: input.actionCenterBody,
    actionCenterCtaLabel: input.actionCenterCtaLabel || "",
    actionCenterCtaHref: input.actionCenterCtaHref || "",
    actionCenterUpdatedAt: new Date().toISOString(),
    lastContactedAt: new Date().toISOString(),
  });

  const notifications = await sendSlyderLeadActionCenterNotifications(lead, input, { triggeredByUserId });

  return {
    leadId: lead.id,
    status: lead.status,
    actionCenterUpdatedAt: lead.actionCenterUpdatedAt?.toISOString() ?? null,
    notifications,
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
