"use client";

import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; nextPath?: string } | null;
      if (!response.ok) {
        setPending(false);
        setError(body?.error ?? "Unable to sign in.");
        return;
      }

      window.location.assign(body?.nextPath || "/admin");
    });
  }

  return (
    <div className="employee-paper max-w-xl p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Admin sign-in</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Access the SLYDE control tower</h2>
        <p className="text-sm leading-7 text-slate-600">
          Platform and operations admins sign in here to review onboarding, monitor launch readiness, manage notifications, and operate the live control tower.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="field-shell">
          <span className="field-label">Email or phone</span>
          <input className="field-input" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Password</span>
          <input className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="button" onClick={submit} disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in to admin"}
        </Button>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-4 text-sm leading-7 text-sky-900">
        Default local admin access is seeded with <code>admin@slyde.local</code>. Default password: <code>Admin123!</code> unless overridden by <code>SLYDE_DEFAULT_ADMIN_PASSWORD</code>.
      </div>
    </div>
  );
}
