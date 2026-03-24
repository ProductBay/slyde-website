"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SetupChecklistForm({
  initial,
}: {
  initial: {
    profileComplete: boolean;
    payoutSetupComplete: boolean;
    vehicleVerified: boolean;
    permissionsComplete: boolean;
    requiredAgreementsAccepted: boolean;
    emergencyContactConfirmed: boolean;
  };
}) {
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveAndContinue() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/slyder/onboarding/setup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "We could not save your setup right now.");
      return;
    }

    await fetch("/api/slyder/onboarding/complete-setup", { method: "POST" });
    window.location.assign("/slyder/onboarding/readiness");
  }

  return (
    <div className="space-y-4">
      {[
        ["profileComplete", "I confirm my profile and contact details are correct."],
        ["vehicleVerified", "I confirm my vehicle details are correct for activation."],
        ["emergencyContactConfirmed", "I confirm my emergency contact details are current."],
        ["payoutSetupComplete", "I have completed the payout setup required for SLYDE onboarding."],
        ["permissionsComplete", "I understand the device, location, and notification permissions required for operations."],
        ["requiredAgreementsAccepted", "I understand that additional operational instructions may apply before I can go online."],
      ].map(([key, label]) => (
        <label key={key} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
          <input
            type="checkbox"
            className="field-checkbox mt-1"
            checked={form[key as keyof typeof form]}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
          />
          <span className="text-sm leading-7 text-slate-700">{label}</span>
        </label>
      ))}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div>
        <Button type="button" onClick={() => void saveAndContinue()} disabled={pending}>
          {pending ? "Saving..." : "Complete setup"}
        </Button>
      </div>
    </div>
  );
}
