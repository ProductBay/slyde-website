"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Send, X } from "lucide-react";

const statuses = [
  "NEW",
  "QUALIFIED",
  "NURTURING",
  "STARTED_APPLICATION",
  "ABANDONED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVATED",
  "LIVE",
  "REJECTED",
] as const;

const messageSuggestions = [
  {
    label: "No action needed",
    status: "NEW",
    title: "No action is needed right now",
    body: "Your Slyder lead is saved in the SLYDE pipeline. No action is needed right now. Keep this dashboard handy and watch for the next official update by email, WhatsApp, or this Action Center.",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    label: "Lead qualified",
    status: "QUALIFIED",
    title: "Your Slyder lead is ready for the next stage",
    body: "Your details currently match SLYDE's early Slyder lead criteria. SLYDE will review your parish, vehicle type, and readiness profile against launch needs. If a next action is needed, it will appear here first.",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    label: "Request info",
    status: "NURTURING",
    title: "SLYDE needs a little more information",
    body: "SLYDE needs a little more information before moving your Slyder lead forward. Please review the details requested here and use the button below if one is shown. Your Action Center will update again after the team reviews your response.",
    ctaLabel: "Contact support",
    ctaHref: "/support",
  },
  {
    label: "Invite to apply",
    status: "QUALIFIED",
    title: "You are invited to continue your Slyder application",
    body: "SLYDE is ready for you to continue from your lead reservation into the full Slyder application. Use the button below only if you are ready to provide the requested application details.",
    ctaLabel: "Continue application",
    ctaHref: "/join/slyder",
  },
  {
    label: "Under review",
    status: "UNDER_REVIEW",
    title: "Your Slyder path is under review",
    body: "SLYDE is reviewing your Slyder path. No duplicate submission is needed right now. If the team needs another document, confirmation, or action from you, that request will be posted in this Action Center.",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    label: "Approved",
    status: "APPROVED",
    title: "You have been approved for onboarding",
    body: "Your Slyder path has been approved for onboarding. SLYDE will use this dashboard, email, and WhatsApp to guide your activation steps and any launch readiness actions.",
    ctaLabel: "Open Slyder login",
    ctaHref: "/slyder/login",
  },
] as const;

type SlyderLeadActionCenterActionsProps = {
  leadId: string;
  currentStatus: string;
  currentTitle?: string | null;
  currentBody?: string | null;
  currentCtaLabel?: string | null;
  currentCtaHref?: string | null;
  devAdminKey?: string;
};

export function SlyderLeadActionCenterActions({
  leadId,
  currentStatus,
  currentTitle,
  currentBody,
  currentCtaLabel,
  currentCtaHref,
  devAdminKey,
}: SlyderLeadActionCenterActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [title, setTitle] = useState(currentTitle || "SLYDE has a new update for you");
  const [body, setBody] = useState(currentBody || "");
  const [ctaLabel, setCtaLabel] = useState(currentCtaLabel || "");
  const [ctaHref, setCtaHref] = useState(currentCtaHref || "");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
    }),
    [devAdminKey],
  );

  function applySuggestion(suggestion: (typeof messageSuggestions)[number]) {
    setStatus(suggestion.status);
    setTitle(suggestion.title);
    setBody(suggestion.body);
    setCtaLabel(suggestion.ctaLabel);
    setCtaHref(suggestion.ctaHref);
    setError(null);
    setMessage(null);
  }

  function submitUpdate() {
    startTransition(async () => {
      setError(null);
      setMessage(null);

      const response = await fetch(`/api/admin/slyder-leads/${leadId}/action-center`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          status,
          actionCenterTitle: title,
          actionCenterBody: body,
          actionCenterCtaLabel: ctaLabel || undefined,
          actionCenterCtaHref: ctaHref || undefined,
          notifyEmail,
          notifyWhatsapp,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string | Record<string, unknown>;
        notifications?: { sent: number; failed: number };
      } | null;

      if (!response.ok) {
        setError(typeof payload?.error === "string" ? payload.error : "Action Center update failed.");
        return;
      }

      const sent = payload?.notifications?.sent ?? 0;
      const failed = payload?.notifications?.failed ?? 0;
      setMessage(`Action Center updated. ${sent} notification${sent === 1 ? "" : "s"} triggered${failed ? `, ${failed} failed` : ""}.`);
      router.refresh();
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-sky-200 px-3 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        <span>Action Center</span>
      </button>
    );
  }

  return (
    <div className="w-[min(28rem,80vw)] rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">Publish Action Center update</p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          aria-label="Close action center form"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-2">
          <p className="text-xs font-semibold text-slate-600">Auto message suggestions</p>
          <div className="flex flex-wrap gap-2">
            {messageSuggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Action title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Details for the lead
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            placeholder="Tell this lead what changed, what SLYDE will review next, or what action is needed."
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            CTA label
            <input
              value={ctaLabel}
              onChange={(event) => setCtaLabel(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="Upload documents"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            CTA URL
            <input
              value={ctaHref}
              onChange={(event) => setCtaHref(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="/join/slyder/status"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={notifyEmail} onChange={(event) => setNotifyEmail(event.target.checked)} />
            Email
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={notifyWhatsapp} onChange={(event) => setNotifyWhatsapp(event.target.checked)} />
            WhatsApp
          </label>
        </div>

        <button
          type="button"
          onClick={submitUpdate}
          disabled={isPending || title.trim().length < 3 || body.trim().length < 8}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Publish update
        </button>
      </div>

      {message ? <p className="mt-3 text-xs font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
