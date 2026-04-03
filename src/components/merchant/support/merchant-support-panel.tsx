"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SupportConversation } from "@/types/backend/onboarding";

const ISSUE_TOPICS = [
  "Delivery delayed",
  "Driver could not locate customer",
  "Payment or COD issue",
  "Out-of-parish transfer update",
  "Address or dispatch correction",
  "General operations question",
];

export function MerchantSupportPanel({
  whatsappUrl,
  phoneNumber,
  conversations,
}: {
  whatsappUrl: string;
  phoneNumber: string;
  conversations: SupportConversation[];
}) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setStatus(null);
    startTransition(async () => {
      const response = await fetch("/api/merchant/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, priority: "normal", message }),
      });
      setPending(false);
      setStatus(response.ok ? "Support request submitted." : "Unable to submit support request.");
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Contact support</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use these channels when a delivery issue needs immediate clarification or your team needs live guidance.
        </p>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 px-4 py-4 font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50">
            WhatsApp support
          </a>
          <a href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`} className="block rounded-2xl border border-slate-200 px-4 py-4 font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50">
            Call support: {phoneNumber}
          </a>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Report an issue</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Send a structured issue note when the problem is not urgent enough for a live call or when you need a written record in the support flow.
        </p>
        <div className="mt-5 space-y-4">
          <select className="field-input" value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="">Select issue topic</option>
            {ISSUE_TOPICS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea className="field-input min-h-32" placeholder="Tell us what happened, what order or delivery is affected, and what help you need next." value={message} onChange={(event) => setMessage(event.target.value)} />
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? "Sending..." : "Submit support request"}
          </Button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft xl:col-span-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Support requests</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track the support conversations already created for this merchant workspace and open the full thread when you need more detail.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {conversations.length} active records
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {conversations.length ? (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/support/track/${conversation.id}`}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{conversation.subject}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {conversation.status.replaceAll("_", " ")} | {conversation.priority}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(conversation.updatedAt).toLocaleString("en-JM")}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-[1.35rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
              No support conversations recorded yet for this merchant workspace.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
