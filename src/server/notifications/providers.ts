import type { NotificationChannel } from "@/types/backend/onboarding";
import { getAppBaseUrl } from "@/lib/app-base-url";

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

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function linkifyEscapedText(text: string) {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => `<a href="${url}" style="color:#0369a1;text-decoration:underline">${url}</a>`,
  );
}

function getPublicAssetUrl(path: string) {
  const baseUrl = getAppBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function renderEmailHtml(input: { subject: string; body: string; messageReference: string }) {
  const slydeLogoUrl = getPublicAssetUrl("/images/slyde-logo-email.png");
  const adashLogoUrl = getPublicAssetUrl("/images/adash-logo-email.png");
  const paragraphs = input.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 16px">${linkifyEscapedText(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return [
    "<!doctype html>",
    '<html lang="en">',
    '<body style="margin:0;background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f8fafc">',
    "<tr>",
    '<td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse">',
    "<tr>",
    '<td style="padding:0 0 14px">',
    `<img src="${slydeLogoUrl}" alt="SLYDE Logistics" width="190" style="display:block;width:190px;max-width:70%;height:auto;border:0" />`,
    "</td>",
    "</tr>",
    "<tr>",
    '<td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">',
    `<h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;color:#020617">${escapeHtml(input.subject)}</h1>`,
    `<div style="font-size:15px;line-height:1.7;color:#0f172a">${paragraphs}</div>`,
    '<hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0" />',
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">SLYDE message reference: ${escapeHtml(input.messageReference)}</p>`,
    "</td>",
    "</tr>",
    "<tr>",
    '<td style="padding:18px 4px 0;text-align:center">',
    '<p style="margin:0 0 8px;font-size:11px;line-height:1.5;letter-spacing:0.12em;text-transform:uppercase;color:#64748b">Powered by</p>',
    `<img src="${adashLogoUrl}" alt="A'Dash Technologies Group" width="160" style="display:inline-block;width:160px;max-width:60%;height:auto;border:0" />`,
    '<p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#64748b">A&apos;Dash Technologies Group</p>',
    "</td>",
    "</tr>",
    "</table>",
    "</td>",
    "</tr>",
    "</table>",
    "</body>",
    "</html>",
  ].join("");
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

export function buildWhatsappWebUrl(recipient: string | undefined, body: string) {
  const normalizedRecipient = normalizeJamaicaPhone(recipient);
  if (!normalizedRecipient) return null;

  return `https://web.whatsapp.com/send?phone=${encodeURIComponent(normalizedRecipient.replace(/^\+/, ""))}&text=${encodeURIComponent(body)}`;
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

export function isWhatsappConfigured() {
  return true;
}

async function sendEmailViaResend(payload: DispatchPayload): Promise<DispatchResult> {
  const config = getResendConfig();
  if (!config) {
    return { ok: false, providerName: "resend", errorMessage: "Resend is not configured." };
  }
  if (!payload.recipient) {
    return { ok: false, providerName: "resend", errorMessage: "Recipient is required for email delivery." };
  }

  const subject = payload.subject || "SLYDE Notification";
  const messageReference = buildMessageId("slyde_email");
  const text = `${payload.body}\n\nSLYDE message reference: ${messageReference}`;
  const html = renderEmailHtml({ subject, body: payload.body, messageReference });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [payload.recipient],
      subject,
      text,
      html,
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

async function sendWhatsappViaWeb(payload: DispatchPayload): Promise<DispatchResult> {
  const whatsappUrl = buildWhatsappWebUrl(payload.recipient, payload.body);
  if (!whatsappUrl) {
    return { ok: false, providerName: "whatsapp_web", errorMessage: "A valid WhatsApp recipient number is required." };
  }

  console.info("[SLYDE WhatsApp Web]", JSON.stringify({ ...payload, whatsappUrl }));
  return {
    ok: true,
    providerName: "whatsapp_web",
    providerMessageId: buildMessageId("wa_web"),
  };
}

async function sendWhatsapp(payload: DispatchPayload): Promise<DispatchResult> {
  return sendWhatsappViaWeb(payload);
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
