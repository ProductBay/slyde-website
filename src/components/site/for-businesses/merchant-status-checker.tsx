"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

type MerchantLead = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  parish: string;
  town: string;
  category: string;
  productIntent?: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

type MerchantApplication = {
  id: string;
  onboardingTrack: string;
  approvalStatus: string;
  activationStatus: string;
  documentStatus: string;
  legalStatus: string;
  createdAt: string;
  updatedAt: string;
};

type MerchantEvent = {
  id: string;
  eventType: string;
  notes?: string;
  createdAt: string;
};

type LookupResult = {
  lead: MerchantLead;
  application: MerchantApplication | null;
  events: MerchantEvent[];
  statusUrl?: string;
  applicantStatus: {
    key: string;
    title: string;
    body: string;
  };
};

function buildNextAction(payload: LookupResult) {
  if (payload.applicantStatus.key === "action_required") {
    return {
      title: "Send the requested update",
      body: "SLYDE needs more information before your merchant review can continue. Reply below so the team can keep your application moving.",
      primaryLabel: "Send update below",
      primaryHref: "#merchant-reply-panel",
      secondaryLabel: "Contact SLYDE",
      secondaryHref: "/contact",
    };
  }

  if (payload.application?.activationStatus === "live") {
    return {
      title: "Open your merchant workspace",
      body: "Your merchant dashboard is live. Sign in to begin dispatch, deliveries, addresses, settings, and support.",
      primaryLabel: "Open merchant login",
      primaryHref: "/merchant/login",
      secondaryLabel: "Contact support",
      secondaryHref: "/merchant/support",
    };
  }

  if (payload.application?.activationStatus === "activated") {
    return {
      title: "Create your password, then sign in",
      body: "Your business has been activated. Use the merchant activation email from SLYDE to create your password first, then continue to merchant login.",
      primaryLabel: "Open merchant login",
      primaryHref: "/merchant/login",
      secondaryLabel: "Contact SLYDE",
      secondaryHref: "/contact",
    };
  }

  if (payload.application?.approvalStatus === "approved") {
    return {
      title: "Watch for your activation message",
      body: "Your business is approved. The next step is activation. SLYDE will send the activation instructions you need before merchant login becomes available.",
      primaryLabel: "Contact SLYDE",
      primaryHref: "/contact",
      secondaryLabel: "Check status again later",
      secondaryHref: payload.statusUrl || "/for-businesses/status",
    };
  }

  if (payload.applicantStatus.key === "rejected") {
    return {
      title: "Need clarification?",
      body: "If you want more detail about the current decision or want to discuss a future re-application, reach out to SLYDE directly.",
      primaryLabel: "Contact SLYDE",
      primaryHref: "/contact",
    };
  }

  return {
    title: "Stay close to your review updates",
    body: "Your application is still moving through review. Keep checking this page for the next activation step or any request from SLYDE.",
    primaryLabel: "Refresh status",
    primaryHref: payload.statusUrl || "/for-businesses/status",
    secondaryLabel: "Contact SLYDE",
    secondaryHref: "/contact",
  };
}

function statusTone(status: string) {
  if (["live", "activated", "approved", "qualified"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["rejected", "failed"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "action_required") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-JM");
}

function eventTitle(eventType: string) {
  const titles: Record<string, string> = {
    application_created: "Application submitted",
    information_requested: "SLYDE requested more information",
    merchant_response_submitted: "Merchant sent more information",
    application_approved: "Application approved",
    application_rejected: "Application rejected",
    application_activated: "Activation started",
    application_live: "Merchant workspace is live",
    workspace_activation_invited: "Activation invite prepared",
    workspace_access_provisioned: "Workspace access provisioned",
    activation_notifications_sent: "Activation message sent",
  };
  return titles[eventType] ?? eventType.replaceAll("_", " ");
}

export function MerchantStatusChecker({
  initialToken = "",
}: {
  initialToken?: string;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyPending, setReplyPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyNotice, setReplyNotice] = useState<string | null>(null);
  const [payload, setPayload] = useState<LookupResult | null>(null);
  const [tokenLookupAttempted, setTokenLookupAttempted] = useState(false);

  const latestInfoRequest = useMemo(
    () => payload?.events.find((event) => event.eventType === "information_requested") ?? null,
    [payload],
  );
  const latestMerchantReply = useMemo(
    () => payload?.events.find((event) => event.eventType === "merchant_response_submitted") ?? null,
    [payload],
  );
  const actionRequired = Boolean(
    latestInfoRequest &&
      (!latestMerchantReply || new Date(latestMerchantReply.createdAt) < new Date(latestInfoRequest.createdAt)),
  );
  const nextAction = useMemo(() => (payload ? buildNextAction(payload) : null), [payload]);

  async function runLookup(body: Record<string, string>) {
    setError(null);
    setReplyNotice(null);
    setLoading(true);

    const response = await fetch("/api/public/merchant-status/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json().catch(() => null)) as ({ error?: string } & Partial<LookupResult>) | null;

    if (!response.ok || !json || typeof json.error === "string") {
      setPayload(null);
      setError(typeof json?.error === "string" ? json.error : "We could not find a merchant application with those details.");
      setLoading(false);
      return;
    }

    const nextPayload = json as LookupResult;
    setPayload(nextPayload);
    setEmail(nextPayload.lead.email);
    setPhone(nextPayload.lead.phone);
    setLoading(false);
  }

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runLookup({ email, phone });
  }

  useEffect(() => {
    if (!initialToken || tokenLookupAttempted) return;
    setTokenLookupAttempted(true);
    void runLookup({ token: initialToken });
  }, [initialToken, tokenLookupAttempted]);

  async function submitReply() {
    if (!payload?.application) return;
    setReplyPending(true);
    setReplyNotice(null);
    setError(null);

    const response = await fetch("/api/public/merchant-status/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: payload.application.id,
        email,
        phone,
        message: replyMessage,
      }),
    });
    const json = (await response.json().catch(() => null)) as ({ error?: string } & Partial<LookupResult> & { ok?: boolean }) | null;

    if (!response.ok || !json || typeof json.error === "string") {
      setError(typeof json?.error === "string" ? json.error : "We could not submit your additional information.");
      setReplyPending(false);
      return;
    }

    setPayload({
      lead: json.lead as MerchantLead,
      application: json.application as MerchantApplication,
      events: (json.events as MerchantEvent[]) ?? [],
      statusUrl: json.statusUrl,
      applicantStatus: json.applicantStatus as LookupResult["applicantStatus"],
    });
    setReplyMessage("");
    setReplyNotice("Your update has been sent to SLYDE and added to your review timeline.");
    setReplyPending(false);
  }

  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="surface-panel p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant Application Status</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Check your onboarding review status</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {initialToken
              ? "Your secure SLYDE status link opened this application automatically. You can still use the same email and phone from your merchant submission if you want to check manually later."
              : "Enter the same email and phone used in your merchant submission to see where your application stands and respond if SLYDE requested more information."}
          </p>

          <form className="mt-8 grid gap-4" onSubmit={lookup}>
            <label className="field-shell">
              <span className="field-label">Email</span>
              <input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="field-shell">
              <span className="field-label">Phone</span>
              <input className="field-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            {initialToken ? (
              <p className="text-sm leading-6 text-sky-700">
                Secure link detected. Your application can open automatically on this device, and any reply you send here will still be attached to the same merchant review.
              </p>
            ) : null}
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading} leadingIcon={<Search className="h-4 w-4" />}>
                {loading ? "Checking..." : "Check status"}
              </Button>
              <LinkButton href="/contact" variant="secondary">
                Contact SLYDE
              </LinkButton>
            </div>
          </form>
        </div>

        <div className="surface-panel p-8">
          {payload ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Application status</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{payload.lead.businessName}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {payload.lead.contactName} · {payload.lead.email} · {payload.lead.phone}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${statusTone(payload.applicantStatus.key)}`}>
                  {payload.applicantStatus.title}
                </span>
              </div>

              <div className={`rounded-[1.5rem] border px-5 py-5 text-sm leading-7 ${statusTone(payload.applicantStatus.key)}`}>
                <p className="font-semibold text-slate-950">{payload.applicantStatus.title}</p>
                <p className="mt-2">{payload.applicantStatus.body}</p>
              </div>

              {nextAction ? (
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">Next action</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{nextAction.body}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <LinkButton href={nextAction.primaryHref}>
                      {nextAction.primaryLabel}
                    </LinkButton>
                    {nextAction.secondaryHref && nextAction.secondaryLabel ? (
                      <LinkButton href={nextAction.secondaryHref} variant="secondary">
                        {nextAction.secondaryLabel}
                      </LinkButton>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Onboarding track</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{payload.application?.onboardingTrack?.replaceAll("_", " ") || payload.lead.productIntent?.replaceAll("_", " ") || "Pending"}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last updated</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(payload.application?.updatedAt || payload.lead.updatedAt)}</p>
                </div>
              </div>

              {payload.application ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval</p>
                    <p className="mt-2 text-sm text-slate-700 capitalize">{payload.application.approvalStatus.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Activation</p>
                    <p className="mt-2 text-sm text-slate-700 capitalize">{payload.application.activationStatus.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Document / info review</p>
                    <p className="mt-2 text-sm text-slate-700 capitalize">{payload.application.documentStatus.replaceAll("_", " ")}</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Review timeline</p>
                <div className="mt-4 grid gap-4">
                  {payload.events.length ? payload.events.map((event) => (
                    <div key={event.id} className="border-b border-slate-200 pb-4 text-sm last:border-b-0 last:pb-0">
                      <p className="font-medium text-slate-950">{eventTitle(event.eventType)}</p>
                      <p className="mt-1 text-slate-500">{formatDate(event.createdAt)}</p>
                      {event.notes ? <p className="mt-2 leading-7 text-slate-600">{event.notes}</p> : null}
                    </div>
                  )) : <p className="text-sm text-slate-500">No merchant review updates have been recorded yet.</p>}
                </div>
              </div>

              {actionRequired && payload.application ? (
                <div id="merchant-reply-panel" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">Send the requested information</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    Reply here with the clarification or additional information SLYDE asked for. Your response will be added directly to your merchant review timeline.
                  </p>
                  <textarea
                    className="field-input mt-4 min-h-36"
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    placeholder="Share the missing details, updated business information, or the clarification SLYDE requested."
                  />
                  {replyNotice ? <p className="mt-3 text-sm text-emerald-700">{replyNotice}</p> : null}
                  <div className="mt-4">
                    <Button type="button" disabled={replyPending || replyMessage.trim().length < 10} leadingIcon={<Send className="h-4 w-4" />} onClick={() => void submitReply()}>
                      {replyPending ? "Sending..." : "Send update to SLYDE"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[22rem] flex-col justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Awaiting lookup</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Your merchant review timeline will show here</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Once your details are verified, this page will show your current review state, whether SLYDE needs more information, and the next activation step.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
