"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SlyderActivationForm({
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

    const response = await fetch("/api/auth/slyder/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "We could not complete activation.");
      return;
    }

    window.location.assign("/slyder/login");
  }

  if (passwordSet) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-600">
          This activation token has already been used to set your password. Continue to the Slyder sign-in page to finish onboarding and readiness.
        </p>
        <Button type="button" onClick={() => window.location.assign("/slyder/login")}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-600">
        Set your SLYDE password to activate your approved courier account. After this step, sign in and complete the final legal, setup, and readiness stages.
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
        {pending ? "Activating..." : "Complete activation"}
      </Button>
    </div>
  );
}
