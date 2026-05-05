"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle } from "lucide-react";

type UserMessageActionsProps = {
  userId: string;
  devAdminKey?: string;
};

export function UserMessageActions({ userId, devAdminKey }: UserMessageActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headers = devAdminKey ? { "x-slyde-admin-key": devAdminKey } : undefined;

  function resendEmail() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/users/${userId}/resend-registration-email`, { method: "POST", headers });
      const payload = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;

      if (!response.ok) {
        setError(payload?.error || "Email resend failed.");
        return;
      }

      setMessage(payload?.status ? `Email ${payload.status}.` : "Email queued.");
    });
  }

  function openWhatsapp() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/users/${userId}/whatsapp-registration-url`, { method: "POST", headers });
      const payload = (await response.json().catch(() => null)) as { error?: string; whatsappUrl?: string } | null;

      if (!response.ok || !payload?.whatsappUrl) {
        setError(payload?.error || "WhatsApp message could not be created.");
        return;
      }

      window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");
      setMessage("WhatsApp Web opened.");
    });
  }

  return (
    <div className="min-w-[15rem]">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={resendEmail}
          disabled={isPending}
          title="Resend registration email"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>Resend Email</span>
        </button>
        <button
          type="button"
          onClick={openWhatsapp}
          disabled={isPending}
          title="Open WhatsApp Web message"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-emerald-200 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>WhatsApp</span>
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
