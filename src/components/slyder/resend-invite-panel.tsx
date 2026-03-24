"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResendInvitePanel({ allowStatusUpdate = false }: { allowStatusUpdate?: boolean }) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    setState("pending");
    setMessage(null);

    const response = await fetch("/api/slyder/resend-activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "email" }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(payload.error || "We could not resend the activation invite.");
      return;
    }

    setState("done");
    setMessage("A fresh activation message has been queued for your approved SLYDE account.");
  }

  async function handleStatusResend() {
    setState("pending");
    setMessage(null);

    const response = await fetch("/api/slyder/resend-status-update", {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(payload.error || "We could not resend your onboarding status update.");
      return;
    }

    setState("done");
    setMessage("Your latest onboarding status update has been resent to your approved email and WhatsApp.");
  }

  return (
    <div className="surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Need another invite?</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        If your original activation email has expired or cannot be found, you can request another invite from your Slyder session.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => void handleResend()} disabled={state === "pending"}>
          {state === "pending" ? "Resending..." : "Resend activation"}
        </Button>
        {allowStatusUpdate ? (
          <Button type="button" variant="secondary" onClick={() => void handleStatusResend()} disabled={state === "pending"}>
            {state === "pending" ? "Sending..." : "Resend status update"}
          </Button>
        ) : null}
      </div>
      {message ? <p className={`mt-3 text-sm ${state === "error" ? "text-rose-600" : "text-emerald-700"}`}>{message}</p> : null}
    </div>
  );
}
