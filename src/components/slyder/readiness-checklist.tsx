"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReadinessChecklist({
  initial,
}: {
  initial: {
    locationPermissionConfirmed: boolean;
    notificationPermissionConfirmed: boolean;
    equipmentConfirmed: boolean;
    trainingAcknowledged: boolean;
    emergencyContactConfirmed: boolean;
  };
}) {
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finishReadiness() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/slyder/onboarding/readiness", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationPermissionConfirmed: form.locationPermissionConfirmed,
        notificationPermissionConfirmed: form.notificationPermissionConfirmed,
        equipmentConfirmed: form.equipmentConfirmed,
        trainingComplete: form.trainingAcknowledged,
        emergencyContactConfirmed: form.emergencyContactConfirmed,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "We could not save your readiness information.");
      return;
    }

    await fetch("/api/slyder/onboarding/complete-readiness", { method: "POST" });
    await fetch("/api/slyder/onboarding/evaluate-eligibility", { method: "POST" });
    window.location.assign("/slyder/onboarding/complete");
  }

  return (
    <div className="space-y-4">
      {[
        ["locationPermissionConfirmed", "I understand that location services must be available while I am working on the SLYDE platform."],
        ["notificationPermissionConfirmed", "I understand that operational alerts and order updates depend on device notifications reaching me."],
        ["equipmentConfirmed", "I have the equipment I need to deliver safely, including any required bag, helmet, or courier gear."],
        ["trainingAcknowledged", "I have reviewed the starter delivery guidance, customer professionalism expectations, and proof-of-delivery responsibilities."],
        ["emergencyContactConfirmed", "My emergency contact is current and confirmed."],
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
        <Button type="button" onClick={() => void finishReadiness()} disabled={pending}>
          {pending ? "Finishing..." : "Complete readiness"}
        </Button>
      </div>
    </div>
  );
}
