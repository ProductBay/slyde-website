"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReferrerLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function readJsonSafely(response: Response) {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as { challengeId?: string; email?: string; error?: { formErrors?: string[] } | string };
    } catch {
      return { error: text };
    }
  }

  async function submit() {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/referrer/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        displayName: displayName || undefined,
      }),
    });

    const payload = await readJsonSafely(response);

    if (!response.ok || !payload?.challengeId || !payload?.email) {
      const formError =
        typeof payload?.error === "string"
          ? payload.error.startsWith("<")
            ? "We could not send your sign-in code right now."
            : payload.error
          : payload?.error?.formErrors?.[0] || "We could not send your sign-in code.";
      setError(formError);
      return;
    }

    setMessage("Your code was sent. Check your email and continue to verification.");
    router.push(`/refer/verify?challenge=${encodeURIComponent(payload.challengeId)}&email=${encodeURIComponent(payload.email)}`);
  }

  return (
    <div className="surface-panel max-w-xl p-8">
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Referrer Login</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Sign in to your referral dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use the same email address you used when submitting referrals. We will send a one-time code so you can view referral progress, milestones, and rewards.
          </p>
        </div>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Email</span>
          <input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Name for this dashboard account</span>
          <input className="field-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Optional" />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Button type="button" onClick={() => startTransition(() => void submit())} disabled={pending}>
          {pending ? "Sending code..." : "Send Login Code"}
        </Button>
      </div>
    </div>
  );
}
