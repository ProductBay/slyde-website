"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmployeeActivationForm({
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

    const response = await fetch("/api/auth/employee/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "We could not complete employee activation.");
      return;
    }

    window.location.assign("/employee/login");
  }

  if (passwordSet) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-600">
          This activation link has already been used to create your password. Continue to the employee sign-in page to begin or finish onboarding.
        </p>
        <Button type="button" onClick={() => window.location.assign("/employee/login")}>
          Go to employee sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-600">
        Create your employee portal password first. After that, sign in and complete your employee onboarding details before entering the workspace.
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
        {pending ? "Activating..." : "Complete employee activation"}
      </Button>
    </div>
  );
}
