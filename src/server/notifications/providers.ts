import type { NotificationChannel } from "@/types/backend/onboarding";

export type DispatchPayload = {
  channel: NotificationChannel;
  recipient?: string;
  subject?: string;
  body: string;
};

export type DispatchResult = {
  ok: boolean;
  providerName: string;
  providerMessageId?: string;
  errorMessage?: string;
};

function buildMessageId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

function toHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

function normalizeJamaicaPhone(value: string | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (trimmed.startsWith("whatsapp:")) {
    return trimmed.replace(/^whatsapp:/, "");
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("876")) return `+1${digits}`;
  if (digits.length === 7) return `+1876${digits}`;

  return `+${digits}`;
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export function isEmailConfigured() {
  return Boolean(getResendConfig());
}

function getTwilioWhatsappConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) return null;
  return { accountSid, authToken, from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}` };
}

export function isWhatsappConfigured() {
  return Boolean(getTwilioWhatsappConfig());
}

async function sendEmailViaResend(payload: DispatchPayload): Promise<DispatchResult> {
  const config = getResendConfig();
  if (!config) {
    return { ok: false, providerName: "resend", errorMessage: "Resend is not configured." };
  }
  if (!payload.recipient) {
    return { ok: false, providerName: "resend", errorMessage: "Recipient is required for email delivery." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [payload.recipient],
      subject: payload.subject || "SLYDE Notification",
      text: payload.body,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#0f172a">${toHtml(payload.body)}</div>`,
    }),
  });

  const data = (await response.json().catch(() => null)) as { id?: string; message?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    return {
      ok: false,
      providerName: "resend",
      errorMessage: data?.message || data?.error?.message || `Resend request failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
    providerName: "resend",
    providerMessageId: data?.id || buildMessageId("resend"),
  };
}

async function sendEmailStub(payload: DispatchPayload): Promise<DispatchResult> {
  if (!payload.recipient) {
    return { ok: false, providerName: "email_stub", errorMessage: "Recipient is required for email delivery." };
  }

  console.info("[SLYDE email stub]", JSON.stringify(payload));
  return {
    ok: true,
    providerName: "email_stub",
    providerMessageId: buildMessageId("email"),
  };
}

async function sendEmail(payload: DispatchPayload): Promise<DispatchResult> {
  if (getResendConfig()) {
    return sendEmailViaResend(payload);
  }

  return sendEmailStub(payload);
}

async function sendWhatsappViaTwilio(payload: DispatchPayload): Promise<DispatchResult> {
  const config = getTwilioWhatsappConfig();
  if (!config) {
    return { ok: false, providerName: "twilio_whatsapp", errorMessage: "Twilio WhatsApp is not configured." };
  }

  const normalizedRecipient = normalizeJamaicaPhone(payload.recipient);
  if (!normalizedRecipient) {
    return { ok: false, providerName: "twilio_whatsapp", errorMessage: "A valid WhatsApp recipient number is required." };
  }

  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const body = new URLSearchParams({
    From: config.from,
    To: `whatsapp:${normalizedRecipient}`,
    Body: payload.body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json().catch(() => null)) as { sid?: string; message?: string; code?: number } | null;
  if (!response.ok) {
    return {
      ok: false,
      providerName: "twilio_whatsapp",
      errorMessage: data?.message || `Twilio WhatsApp request failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
    providerName: "twilio_whatsapp",
    providerMessageId: data?.sid || buildMessageId("twilio_wa"),
  };
}

async function sendWhatsappStub(payload: DispatchPayload): Promise<DispatchResult> {
  if (!payload.recipient) {
    return { ok: false, providerName: "whatsapp_stub", errorMessage: "Recipient is required for WhatsApp delivery." };
  }

  console.info("[SLYDE WhatsApp stub]", JSON.stringify(payload));
  return {
    ok: true,
    providerName: "whatsapp_stub",
    providerMessageId: buildMessageId("wa"),
  };
}

async function sendWhatsapp(payload: DispatchPayload): Promise<DispatchResult> {
  if (getTwilioWhatsappConfig()) {
    return sendWhatsappViaTwilio(payload);
  }

  return sendWhatsappStub(payload);
}

async function sendSms(payload: DispatchPayload): Promise<DispatchResult> {
  if (!payload.recipient) {
    return { ok: false, providerName: "sms_stub", errorMessage: "Recipient is required for SMS delivery." };
  }

  console.info("[SLYDE SMS stub]", JSON.stringify(payload));
  return {
    ok: true,
    providerName: "sms_stub",
    providerMessageId: buildMessageId("sms"),
  };
}

export function isSmsConfigured() {
  return false;
}

async function sendInternal(payload: DispatchPayload): Promise<DispatchResult> {
  console.info("[SLYDE internal notification]", JSON.stringify(payload));
  return {
    ok: true,
    providerName: "internal_feed",
    providerMessageId: buildMessageId("internal"),
  };
}

export async function dispatchViaProvider(payload: DispatchPayload): Promise<DispatchResult> {
  if (payload.channel === "email") return sendEmail(payload);
  if (payload.channel === "whatsapp") return sendWhatsapp(payload);
  if (payload.channel === "sms") return sendSms(payload);
  return sendInternal(payload);
}
