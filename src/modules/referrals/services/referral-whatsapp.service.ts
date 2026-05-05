/** WhatsApp helper utilities for the SLYDE Referral Engine */

function normalizeWhatsapp(phone: string): string {
  // Strip all non-digit chars, ensure no leading +
  return phone.replace(/\D/g, "");
}

function encodeMessage(text: string): string {
  return encodeURIComponent(text);
}

// ─── Message builders ────────────────────────────────────────

export function buildReferralShareMessage(referralLink: string): string {
  return `🚀 Join me on SLYDE! SLYDE is onboarding new Slyders across Jamaica. Reserve your spot here: ${referralLink}`;
}

export function buildReferrerConfirmationMessage(referrerName: string, referralLink: string): string {
  return `Hi ${referrerName}, your SLYDE referral link is ready: ${referralLink}. You can earn JMD $5,000 when your referred Slyder goes live and completes the qualifying rent cycles.`;
}

export function buildReferredInviteMessage(referrerName: string, referralLink: string): string {
  return `Hi, you've been invited to become a SLYDE Slyder by ${referrerName}. SLYDE lets Slyders keep 100% of delivery earnings with no commission. Reserve your spot here: ${referralLink}`;
}

export function buildRewardEarnedMessage(referrerName: string, amount: number): string {
  return `Good news ${referrerName}! A referral payout of JMD $${amount.toLocaleString()} has been earned and is pending approval.`;
}

export function buildPayoutPaidMessage(referrerName: string, amount: number): string {
  return `Hi ${referrerName}, your SLYDE referral payout of JMD $${amount.toLocaleString()} has been marked as paid.`;
}

// ─── URL builders ────────────────────────────────────────────

/**
 * WhatsApp share link — opens pre-filled message in WhatsApp web/app.
 * Use for generic "share my link" buttons.
 */
export function buildWhatsappShareUrl(referralLink: string): string {
  const msg = buildReferralShareMessage(referralLink);
  return `https://wa.me/?text=${encodeMessage(msg)}`;
}

/**
 * Direct WhatsApp link to a specific phone number with an optional message.
 */
export function buildDirectWhatsappUrl(phone: string, message?: string): string {
  const normalized = normalizeWhatsapp(phone);
  if (message) {
    return `https://wa.me/${normalized}?text=${encodeMessage(message)}`;
  }
  return `https://wa.me/${normalized}`;
}

/**
 * Admin "open WhatsApp to referrer" convenience URL.
 */
export function buildAdminReferrerWhatsappUrl(referrerWhatsapp: string, referralLink: string): string {
  const msg = buildReferrerConfirmationMessage("", referralLink);
  return buildDirectWhatsappUrl(referrerWhatsapp, msg);
}

/**
 * Admin "open WhatsApp to referred person" convenience URL.
 */
export function buildAdminReferredWhatsappUrl(referredWhatsapp: string, referrerName: string, referralLink: string): string {
  const msg = buildReferredInviteMessage(referrerName, referralLink);
  return buildDirectWhatsappUrl(referredWhatsapp, msg);
}
