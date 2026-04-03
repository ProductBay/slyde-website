"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function MerchantLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/merchant/login", {
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

      window.location.assign(body?.nextPath || "/merchant/dashboard");
    });
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Merchant login</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Run your delivery workspace</h1>
        <p className="text-sm leading-7 text-slate-600">
          Sign in with the merchant contact email or phone that was activated by SLYDE operations.
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
        <Button type="button" className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Signing in..." : "Open merchant workspace"}
        </Button>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-7 text-cyan-900">
        Merchants are provisioned when their SLYDE application is activated. New merchant accounts now receive an activation link
        by email so the owner can create a password securely before signing in.
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link href="/for-businesses/slyde" className="font-semibold text-sky-700">
          Need SLYDE delivery onboarding?
        </Link>
        <Link href="/merchant/support" className="font-semibold text-slate-700">
          Need support?
        </Link>
      </div>
    </div>
  );
}
