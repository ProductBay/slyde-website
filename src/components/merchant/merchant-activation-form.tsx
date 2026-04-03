"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MerchantActivationForm({
  token,
  passwordSet,
}: {
  token: string;
  passwordSet: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleContinue() {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/merchant/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "We could not complete merchant activation.");
      return;
    }

    window.location.assign("/merchant/login");
  }

  if (passwordSet) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-600">
          This activation link has already been used to create your merchant password. Continue to the merchant sign-in page to open the workspace.
        </p>
        <Button type="button" onClick={() => window.location.assign("/merchant/login")}>
          Go to merchant sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-600">
        Create your merchant workspace password first. After that, sign in and open the merchant dashboard to manage dispatch, deliveries, addresses, settings, and support.
      </p>
      <label className="field-shell">
        <span className="field-label">Create password</span>
        <input className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <label className="field-shell">
        <span className="field-label">Confirm password</span>
        <input className="field-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="button" onClick={() => void handleContinue()} disabled={pending}>
        {pending ? "Activating..." : "Complete merchant activation"}
      </Button>
    </div>
  );
}
