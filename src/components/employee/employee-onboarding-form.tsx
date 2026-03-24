"use client";

import { useState, startTransition } from "react";
import { Button } from "@/components/ui/button";

export function EmployeeOnboardingForm({
  defaultEmergencyName,
  defaultEmergencyPhone,
  defaultPayoutMethod,
  defaultPayoutMasked,
}: {
  defaultEmergencyName?: string;
  defaultEmergencyPhone?: string;
  defaultPayoutMethod: "bank_transfer" | "cash_pickup" | "mobile_wallet";
  defaultPayoutMasked?: string;
}) {
  const [emergencyContactName, setEmergencyContactName] = useState(defaultEmergencyName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(defaultEmergencyPhone ?? "");
  const [payoutMethod, setPayoutMethod] = useState(defaultPayoutMethod);
  const [payoutAccountMasked, setPayoutAccountMasked] = useState(defaultPayoutMasked ?? "");
  const [acknowledgeHandbook, setAcknowledgeHandbook] = useState(false);
  const [acknowledgePayrollVisibility, setAcknowledgePayrollVisibility] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/employee/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyContactName,
          emergencyContactPhone,
          payoutMethod,
          payoutAccountMasked,
          acknowledgeHandbook,
          acknowledgePayrollVisibility,
        }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setPending(false);
        setError(body?.error ?? "Unable to complete onboarding.");
        return;
      }

      window.location.assign("/employee/portal");
    });
  }

  return (
    <div className="employee-paper max-w-3xl p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee onboarding</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Finish your internal portal setup</h2>
        <p className="text-sm leading-7 text-slate-600">
          Confirm emergency contact information, payout destination, and handbook visibility acknowledgements before entering the employee workspace.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field-shell">
          <span className="field-label">Emergency contact name</span>
          <input className="field-input" value={emergencyContactName} onChange={(event) => setEmergencyContactName(event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Emergency contact phone</span>
          <input className="field-input" value={emergencyContactPhone} onChange={(event) => setEmergencyContactPhone(event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Payout method</span>
          <select className="field-input" value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value as typeof defaultPayoutMethod)}>
            <option value="bank_transfer">Bank transfer</option>
            <option value="mobile_wallet">Mobile wallet</option>
            <option value="cash_pickup">Cash pickup</option>
          </select>
        </label>
        <label className="field-shell">
          <span className="field-label">Payout destination</span>
          <input
            className="field-input"
            value={payoutAccountMasked}
            onChange={(event) => setPayoutAccountMasked(event.target.value)}
            placeholder="Example: NCB •••• 4412"
          />
        </label>
      </div>

      <div className="mt-6 space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input className="field-checkbox mt-1" type="checkbox" checked={acknowledgeHandbook} onChange={(event) => setAcknowledgeHandbook(event.target.checked)} />
          <span>I acknowledge that the employee handbook and role guides must be reviewed as part of my ongoing responsibilities.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input className="field-checkbox mt-1" type="checkbox" checked={acknowledgePayrollVisibility} onChange={(event) => setAcknowledgePayrollVisibility(event.target.checked)} />
          <span>I understand that paycheck and payout amounts shown in the portal are for my internal review and should be reported if inaccurate.</span>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving..." : "Complete employee onboarding"}
        </Button>
      </div>
    </div>
  );
}
