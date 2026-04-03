import {
  findMerchantApplicationById,
  findMerchantLeadByEmailOrPhone,
  findMerchantLeadById,
  listMerchantApplications,
  listMerchantOnboardingEventsByApplicationId,
  updateMerchantApplication,
  updateMerchantLead,
} from "@/modules/merchant/repositories/merchant.repository";
import { sendMerchantInformationRequestedNotifications } from "@/server/notifications/notification.service";
import { withPersistenceTransaction } from "@/server/persistence";
import { buildMerchantStatusUrl, verifyMerchantStatusToken } from "@/modules/merchant/services/merchant-status-link.service";
import type {
  MerchantApplication,
  MerchantLead,
  MerchantOnboardingEvent,
} from "@/types/backend/onboarding";
import type {
  MerchantApplicantReplyInput,
  MerchantRequestInfoInput,
  MerchantStatusLookupInput,
} from "@/modules/merchant/schemas/merchant-status.schema";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { createMerchantOnboardingEvent } from "@/modules/merchant/repositories/merchant.repository";
import crypto from "node:crypto";

function nowIso() {
  return new Date().toISOString();
}

function latestApplicationForLead(applications: MerchantApplication[], leadId: string) {
  return applications
    .filter((item) => item.merchantLeadId === leadId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null;
}

function applicantFacingStatus(input: {
  lead: MerchantLead;
  application: MerchantApplication | null;
  events: MerchantOnboardingEvent[];
}) {
  const latestRequest = input.events.find((event) => event.eventType === "information_requested");
  if (latestRequest) {
    const repliedAfterRequest = input.events.some(
      (event) => event.eventType === "merchant_response_submitted" && event.createdAt > latestRequest.createdAt,
    );
    if (!repliedAfterRequest) {
      return {
        key: "action_required",
        title: "Action required",
        body: "SLYDE reviewed your application and requested additional information before review can continue.",
      };
    }
  }

  if (!input.application) {
    return {
      key: input.lead.status,
      title: input.lead.status === "submitted" ? "Submitted" : "In review",
      body: "SLYDE has your business lead and is preparing the next onboarding step.",
    };
  }

  if (input.application.approvalStatus === "rejected" || input.lead.status === "rejected") {
    return {
      key: "rejected",
      title: "Not approved",
      body: "SLYDE has closed this onboarding request for now. If needed, contact support for clarification.",
    };
  }

  if (input.application.activationStatus === "live") {
    return {
      key: "live",
      title: "Merchant workspace is live",
      body: "Your business has been activated and moved into live merchant operations.",
    };
  }

  if (input.application.activationStatus === "activated") {
    return {
      key: "activated",
      title: "Activation ready",
      body: "Your merchant workspace has been approved. Use the activation link from SLYDE to create your password and sign in.",
    };
  }

  if (input.application.approvalStatus === "approved") {
    return {
      key: "approved",
      title: "Approved",
      body: "Your business has been approved and is moving toward activation.",
    };
  }

  return {
    key: "reviewing",
    title: "In review",
    body: "SLYDE is reviewing your business details and onboarding fit.",
  };
}

export async function lookupMerchantApplicantStatus(input: MerchantStatusLookupInput) {
  let lead: MerchantLead | null = null;
  let application: MerchantApplication | null = null;

  if (input.token) {
    const verified = verifyMerchantStatusToken(input.token);
    lead = await findMerchantLeadById(verified.leadId);
    if (!lead) {
      throw new Error("Status link is invalid or expired.");
    }

    application = verified.applicationId ? await findMerchantApplicationById(verified.applicationId) : null;
    if (!application) {
      const applications = await listMerchantApplications();
      application = latestApplicationForLead(applications, lead.id);
    }
  } else {
    lead = await findMerchantLeadByEmailOrPhone(
      normalizeEmail(input.email || ""),
      normalizePhone(input.phone || ""),
    );
    if (!lead) {
      throw new Error("We could not find a merchant application for that email and phone number.");
    }

    const applications = await listMerchantApplications();
    application = latestApplicationForLead(applications, lead.id);
  }

  const events = application ? await listMerchantOnboardingEventsByApplicationId(application.id) : [];
  const status = applicantFacingStatus({ lead, application, events });

  return {
    lead,
    application,
    events,
    applicantStatus: status,
    statusUrl: buildMerchantStatusUrl(lead.id, application?.id),
  };
}

export async function requestMerchantApplicantInformation(
  applicationId: string,
  input: MerchantRequestInfoInput,
  actorId?: string,
) {
  const application = await findMerchantApplicationById(applicationId);
  if (!application) throw new Error("Merchant application not found.");

  const lead = await findMerchantLeadById(application.merchantLeadId);
  if (!lead) throw new Error("Merchant lead not found.");

  const timestamp = nowIso();
  await updateMerchantApplication({
    ...application,
    documentStatus: "pending",
    updatedAt: timestamp,
  });
  await updateMerchantLead({
    ...lead,
    status: "reviewing",
    updatedAt: timestamp,
  });

  const event = await createMerchantOnboardingEvent({
    id: crypto.randomUUID(),
    merchantApplicationId: application.id,
    eventType: "information_requested",
    actorType: "admin_user",
    actorId,
    notes: input.notes.trim(),
    createdAt: timestamp,
  });

  await withPersistenceTransaction((store) =>
    sendMerchantInformationRequestedNotifications(store, application.id, input.notes.trim()),
  );

  return event;
}

export async function submitMerchantApplicantResponse(input: MerchantApplicantReplyInput) {
  const status = await lookupMerchantApplicantStatus({
    email: input.email,
    phone: input.phone,
  });
  if (!status.application || status.application.id !== input.applicationId) {
    throw new Error("That application could not be verified for this merchant contact.");
  }

  const timestamp = nowIso();
  await updateMerchantApplication({
    ...status.application,
    documentStatus: "submitted",
    updatedAt: timestamp,
  });
  await updateMerchantLead({
    ...status.lead,
    status: "reviewing",
    updatedAt: timestamp,
  });

  const event = await createMerchantOnboardingEvent({
    id: crypto.randomUUID(),
    merchantApplicationId: status.application.id,
    eventType: "merchant_response_submitted",
    actorType: "merchant_user",
    actorId: status.lead.id,
    notes: input.message.trim(),
    createdAt: timestamp,
  });

  const refreshedEvents = await listMerchantOnboardingEventsByApplicationId(status.application.id);
  return {
    event,
    lead: {
      ...status.lead,
      status: "reviewing",
      updatedAt: timestamp,
    },
    application: {
      ...status.application,
      documentStatus: "submitted",
      updatedAt: timestamp,
    },
    events: refreshedEvents,
    applicantStatus: applicantFacingStatus({
      lead: { ...status.lead, status: "reviewing", updatedAt: timestamp },
      application: { ...status.application, documentStatus: "submitted", updatedAt: timestamp },
      events: refreshedEvents,
    }),
  };
}
