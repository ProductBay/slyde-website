"use client";

import Link from "next/link";
import { useState, startTransition } from "react";
import { Button } from "@/components/ui/button";

export function EmployeeLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/employee/login", {
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

      window.location.assign(body?.nextPath || "/employee/portal");
    });
  }

  return (
    <div className="employee-paper max-w-xl p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee sign-in</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Access the internal employee portal</h2>
        <p className="text-sm leading-7 text-slate-600">
          This portal is separate from the Slyder application. Employees sign in here to access onboarding, guides, announcements, and payroll visibility.
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
          {pending ? "Signing in..." : "Sign in to employee portal"}
        </Button>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/careers/apply" className="font-semibold text-sky-700">
            Need to apply first?
          </Link>
          <Link href="/employee/activate" className="font-semibold text-slate-700">
            Already invited? Open activation help
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-cyan-900">
        Dev access is seeded with `logistics@slyde.local` and `manager@slyde.local`. Default password: `Employee123!` unless overridden by `SLYDE_DEFAULT_EMPLOYEE_PASSWORD`.
      </div>
    </div>
  );
}
