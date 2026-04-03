"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReferrerVerifyForm({
  initialChallengeId,
  initialEmail,
}: {
  initialChallengeId?: string;
  initialEmail?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [challengeId, setChallengeId] = useState(initialChallengeId || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function readJsonSafely(response: Response) {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as { error?: { formErrors?: string[] } | string };
    } catch {
      return { error: text };
    }
  }

  async function submit() {
    setError(null);

    const response = await fetch("/api/auth/referrer/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId,
        email,
        code,
      }),
    });

    const payload = await readJsonSafely(response);

    if (!response.ok) {
      const formError =
        typeof payload?.error === "string"
          ? payload.error.startsWith("<")
            ? "We could not verify your sign-in code right now."
            : payload.error
          : payload?.error?.formErrors?.[0] || "We could not verify your code.";
      setError(formError);
      return;
    }

    router.push("/refer/dashboard");
    router.refresh();
  }

  return (
    <div className="surface-panel max-w-xl p-8">
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Verify Code</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Finish signing in</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Enter the six-digit code from your email to open your authenticated referral dashboard.
          </p>
        </div>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Email</span>
          <input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Challenge Id</span>
          <input className="field-input" value={challengeId} onChange={(event) => setChallengeId(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>6-digit code</span>
          <input className="field-input" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="button" onClick={() => startTransition(() => void submit())} disabled={pending}>
          {pending ? "Verifying..." : "Verify And Continue"}
        </Button>
      </div>
    </div>
  );
}
