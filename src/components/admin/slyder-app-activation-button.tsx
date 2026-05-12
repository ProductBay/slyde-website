"use client";

import { useState, useTransition } from "react";

type ActivationState = "idle" | "sent" | "error";

export function SlyderAppActivationButton({
  applicationId,
  applicationStatus,
  devAdminKey,
}: {
  applicationId: string;
  applicationStatus: string;
  devAdminKey?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActivationState>("idle");
  const [message, setMessage] = useState("");
  const canSend = applicationStatus === "approved";

  function sendActivationEmail() {
    setState("idle");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/slyder-applications/${applicationId}/send-app-activation`, {
          method: "POST",
          headers: {
            ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
          },
        });
        const json = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

        if (!response.ok) {
          throw new Error(json?.error || "Activation email could not be sent.");
        }

        setState("sent");
        setMessage(json?.message || "Activation email sent.");
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Activation email could not be sent.");
      }
    });
  }

  return (
    <div className="flex min-w-[10rem] flex-col items-start gap-1.5">
      <button
        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
        disabled={!canSend || isPending}
        onClick={sendActivationEmail}
        title={
          canSend
            ? "Send the SLYDE app activation email"
            : "Approve this application before sending app activation"
        }
        type="button"
      >
        {isPending ? "Sending..." : "Send app activation"}
      </button>
      {state !== "idle" && (
        <p className={state === "sent" ? "max-w-[13rem] text-xs text-emerald-700" : "max-w-[13rem] text-xs text-rose-700"}>
          {message}
        </p>
      )}
    </div>
  );
}
