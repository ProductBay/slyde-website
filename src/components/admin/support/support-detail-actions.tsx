"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SupportConversation } from "@/types/backend/onboarding";
import { Button } from "@/components/ui/button";

const QUICK_REPLY_TEMPLATES = [
  {
    id: "acknowledge",
    label: "Acknowledge receipt",
    body:
      "Thanks for contacting SLYDE support. We have received your request and a support specialist is now reviewing the details. We will follow up with the next action shortly.",
  },
  {
    id: "need-reference",
    label: "Request reference",
    body:
      "To help us move this forward quickly, please reply with the main reference involved, such as the order number, delivery reference, or application email tied to the request.",
  },
  {
    id: "need-docs",
    label: "Request documents",
    body:
      "Please reply with the requested supporting details or documents so SLYDE can complete the review. Once we receive them, we will continue with the next step and update you through this thread.",
  },
  {
    id: "ops-review",
    label: "Ops review in progress",
    body:
      "This request is currently under operational review. SLYDE is checking the relevant delivery and support records now, and we will share the next update as soon as the review is complete.",
  },
  {
    id: "resolved",
    label: "Resolution confirmation",
    body:
      "SLYDE has now completed the requested update on this case. Please review and let us know if anything is still outstanding, otherwise this conversation can be treated as resolved.",
  },
];

const TEAM_OPTIONS = [
  { value: "general_support", label: "General support" },
  { value: "merchant_onboarding", label: "Merchant onboarding" },
  { value: "merchant_ops", label: "Merchant ops" },
  { value: "slyder_support", label: "Slyder support" },
  { value: "employee_support", label: "Employee support" },
  { value: "referrals", label: "Referrals" },
  { value: "billing", label: "Billing" },
];

export function SupportDetailActions({
  conversation,
  devAdminKey,
}: {
  conversation: SupportConversation;
  devAdminKey?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignedTeam, setAssignedTeam] = useState(conversation.assignedTeam ?? "general_support");
  const [assignedAgentId, setAssignedAgentId] = useState(conversation.assignedAgentId ?? "");
  const [handoffTeam, setHandoffTeam] = useState(conversation.assignedTeam ?? "general_support");
  const [handoffReason, setHandoffReason] = useState("Needs human review and queue ownership.");
  const [handoffSummary, setHandoffSummary] = useState(
    "Route this conversation to the next available support specialist with the current message and context attached.",
  );
  const [replyBody, setReplyBody] = useState("");

  async function runAction(
    endpoint: string,
    body?: Record<string, unknown>,
    successMessage = "Action completed.",
  ) {
    setError(null);
    setSuccess(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(typeof payload?.error === "string" ? payload.error : "Action failed.");
      return false;
    }

    setSuccess(successMessage);
    router.refresh();
    return true;
  }

  return (
    <section className="surface-panel p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Operator actions</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Assign, resolve, and hand off from one surface</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Keep queue ownership, escalation, and resolution decisions close to the conversation timeline so support ops can move quickly.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {conversation.status.replaceAll("_", " ")}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.35rem] border border-sky-200 bg-sky-50 p-4 xl:col-span-2">
          <p className="text-sm font-semibold text-slate-950">Inline reply</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Reply to the conversation directly from the detail page so the support timeline keeps moving without leaving the control tower.
          </p>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reply message</span>
            <textarea
              className="field-input mt-2 min-h-32 bg-white"
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              placeholder="Share the next action, request details, or confirm resolution for the merchant, applicant, or public contact."
            />
          </label>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick reply templates</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_REPLY_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  onClick={() => setReplyBody(template.body)}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Choose a macro to insert a structured response, then edit it before sending if this case needs a more specific reply.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-600">
              Replies use the shared support thread and appear in the timeline immediately.
            </div>
            <Button
              type="button"
              className="bg-sky-700 hover:bg-sky-600"
              disabled={pending || !replyBody.trim()}
              onClick={() =>
                startTransition(async () => {
                  const ok = await runAction(
                    `/api/support/conversations/${conversation.id}/reply`,
                    { body: replyBody },
                    "Reply sent to the support conversation.",
                  );
                  if (ok) {
                    setReplyBody("");
                  }
                })
              }
            >
              {pending ? "Working..." : "Send reply"}
            </Button>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Assignment</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">Set the working queue and optionally attach a specific agent owner.</p>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Queue</span>
            <select
              className="field-input mt-2 bg-white"
              value={assignedTeam}
              onChange={(event) => setAssignedTeam(event.target.value)}
            >
              {TEAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned agent id</span>
            <input
              className="field-input mt-2 bg-white"
              value={assignedAgentId}
              onChange={(event) => setAssignedAgentId(event.target.value)}
              placeholder="Optional internal agent id"
            />
          </label>
          <Button
            type="button"
            className="mt-4 w-full"
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                void runAction(
                  `/api/admin/support/conversations/${conversation.id}/assign`,
                  {
                    assignedTeam,
                    assignedAgentId: assignedAgentId || undefined,
                  },
                  "Support conversation assignment updated.",
                ),
              )
            }
          >
            {pending ? "Working..." : "Update assignment"}
          </Button>
        </div>

        <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Human handoff</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">Escalate the conversation to the right support queue with a concise operator summary.</p>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended team</span>
            <select
              className="field-input mt-2 bg-white"
              value={handoffTeam}
              onChange={(event) => setHandoffTeam(event.target.value)}
            >
              {TEAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Handoff reason</span>
            <input
              className="field-input mt-2 bg-white"
              value={handoffReason}
              onChange={(event) => setHandoffReason(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Operator summary</span>
            <textarea
              className="field-input mt-2 min-h-28 bg-white"
              value={handoffSummary}
              onChange={(event) => setHandoffSummary(event.target.value)}
            />
          </label>
          <Button
            type="button"
            className="mt-4 w-full bg-amber-600 hover:bg-amber-500"
            disabled={pending || !handoffReason.trim() || !handoffSummary.trim()}
            onClick={() =>
              startTransition(() =>
                void runAction(
                  `/api/support/conversations/${conversation.id}/handoff`,
                  {
                    reason: handoffReason,
                    summary: handoffSummary,
                    recommendedTeam: handoffTeam,
                  },
                  "Support handoff recorded and queued for review.",
                ),
              )
            }
          >
            {pending ? "Working..." : "Create handoff"}
          </Button>
        </div>

        <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Resolution</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Mark the conversation resolved when the current issue is complete and no immediate follow-up is required.
          </p>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
            Current owner: <span className="font-semibold text-slate-950">{conversation.assignedTeam ?? "Unassigned"}</span>
          </div>
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
            Last message: <span className="font-semibold text-slate-950">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString("en-JM") : "Not yet recorded"}</span>
          </div>
          <Button
            type="button"
            className="mt-4 w-full bg-emerald-700 hover:bg-emerald-600"
            disabled={pending || conversation.status === "resolved" || conversation.status === "closed"}
            onClick={() =>
              startTransition(() =>
                void runAction(
                  `/api/admin/support/conversations/${conversation.id}/resolve`,
                  undefined,
                  "Support conversation marked as resolved.",
                ),
              )
            }
          >
            {pending ? "Working..." : "Mark resolved"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      ) : null}
    </section>
  );
}
