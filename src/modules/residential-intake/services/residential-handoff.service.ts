import type { ResidentialIntakeInput } from "@/modules/residential-intake/schemas/residential-intake.schemas";
import {
  findPendingHandoffJobs,
  updateHandoffJobState,
  updateResidentialLeadStatus,
} from "@/modules/residential-intake/repositories/residential-intake.repository";

const SLYDE_APP_HANDOFF_URL = process.env.SLYDE_APP_HANDOFF_URL;
const SLYDE_APP_HANDOFF_SECRET = process.env.SLYDE_APP_HANDOFF_SECRET;
const MAX_ATTEMPTS = 5;

export function buildHandoffPayload(args: {
  leadId: string;
  referenceCode: string;
  input: ResidentialIntakeInput;
  submittedAt: Date;
}) {
  return {
    schemaVersion: "1.0",
    externalReference: args.referenceCode,
    idempotencyKey: args.leadId,
    source: "slyde_website",
    submittedAt: args.submittedAt.toISOString(),
    customerIdentity: {
      fullName: args.input.fullName,
      phone: args.input.phone,
      email: args.input.email || null,
    },
    pickupLocation: {
      parish: args.input.parish,
      area: args.input.area,
      address: args.input.pickupAddress,
    },
    dropoffLocation: {
      parish: args.input.dropoffParish,
      area: args.input.dropoffArea,
      address: args.input.dropoffAddress,
    },
    parcel: {
      category: args.input.parcelCategory,
      notes: args.input.parcelNotes || null,
    },
    dispatch: {
      urgency: args.input.urgency,
      preferredWindow: args.input.preferredWindow || null,
    },
    commercial: {
      paymentPreference: args.input.paymentPreference,
    },
    compliance: {
      consentVersion: "residential-v1.0",
      privacyAccepted: args.input.privacyAccepted,
      termsAccepted: args.input.termsAccepted,
      consentedAt: args.submittedAt.toISOString(),
    },
  };
}

export function shouldHandoff(): boolean {
  return !!(SLYDE_APP_HANDOFF_URL && SLYDE_APP_HANDOFF_SECRET);
}

async function sendHandoff(payload: object): Promise<{ ok: boolean; error?: string }> {
  if (!SLYDE_APP_HANDOFF_URL || !SLYDE_APP_HANDOFF_SECRET) {
    return { ok: false, error: "Handoff not configured" };
  }

  try {
    const res = await fetch(SLYDE_APP_HANDOFF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Slyde-Handoff-Secret": SLYDE_APP_HANDOFF_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function processPendingHandoffJobs(): Promise<void> {
  if (!shouldHandoff()) return;

  const jobs = await findPendingHandoffJobs();

  for (const job of jobs) {
    const attempts = job.attempts + 1;

    const result = await sendHandoff(job.payloadJson as object);

    if (result.ok) {
      await updateHandoffJobState(job.id, "acknowledged", { acknowledgedAt: new Date(), attempts });
      await updateResidentialLeadStatus(job.leadId, "handed_off");
    } else {
      if (attempts >= MAX_ATTEMPTS) {
        await updateHandoffJobState(job.id, "dead_letter", {
          attempts,
          lastError: result.error,
        });
        await updateResidentialLeadStatus(job.leadId, "failed");
      } else {
        const backoffMs = Math.min(1000 * 60 * Math.pow(2, attempts - 1), 1000 * 60 * 30);
        const nextRetryAt = new Date(Date.now() + backoffMs);
        await updateHandoffJobState(job.id, "retrying", {
          attempts,
          lastError: result.error,
          nextRetryAt,
        });
      }
    }
  }
}
