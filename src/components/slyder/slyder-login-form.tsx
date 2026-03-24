"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SlyderLoginForm() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [delivery, setDelivery] = useState<"email" | "sms" | "otp">("otp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitCredentials() {
    setPending(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/slyder/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Could not start sign-in.");
      return;
    }

    setChallengeId(payload.result.challengeId);
    setDelivery(payload.result.delivery || "otp");
    setStep("otp");
    setPending(false);
  }

  async function submitOtp() {
    setPending(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/slyder/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, code }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Could not verify the OTP.");
      return;
    }

    window.location.assign("/slyder/onboarding/welcome");
  }

  async function resendOtp() {
    setPending(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/slyder/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Could not resend the OTP.");
      return;
    }

    setChallengeId(payload.result.challengeId);
    setDelivery(payload.result.delivery || "otp");
    setMessage(
      payload.result.delivery === "email"
        ? "A fresh OTP has been sent to your approved email address."
        : "A fresh OTP has been sent to your approved phone number.",
    );
    setPending(false);
  }

  return step === "credentials" ? (
    <div className="grid gap-4">
      <label className="field-shell">
        <span className="field-label">Email or phone</span>
        <input className="field-input" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
      </label>
      <label className="field-shell">
        <span className="field-label">Password</span>
        <input className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div>
        <Button type="button" onClick={() => void submitCredentials()} disabled={pending}>
          {pending ? "Signing in..." : "Continue to OTP"}
        </Button>
      </div>
    </div>
  ) : (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-600">
        {delivery === "email"
          ? "SLYDE has sent a one-time login code to your approved email address. Enter it below to continue into onboarding."
          : delivery === "sms"
            ? "SLYDE has sent a one-time login code to your approved phone number. Enter it below to continue into onboarding."
            : "SLYDE has sent a one-time login code to your approved contact channel. Enter it below to continue into onboarding."}
      </p>
      <label className="field-shell">
        <span className="field-label">OTP code</span>
        <input className="field-input" value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void submitOtp()} disabled={pending}>
          {pending ? "Verifying..." : "Verify and continue"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void resendOtp()} disabled={pending || !challengeId}>
          {pending ? "Working..." : "Resend code"}
        </Button>
      </div>
    </div>
  );
}
