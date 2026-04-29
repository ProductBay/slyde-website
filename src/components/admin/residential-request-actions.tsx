"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ResidentialDispatchStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<ResidentialDispatchStatus, ResidentialDispatchStatus[]> = {
  submitted:       ["confirmed", "cancelled"],
  payment_pending: ["confirmed", "cancelled"],
  confirmed:       ["rider_assigned", "cancelled"],
  rider_assigned:  ["picked_up", "cancelled"],
  picked_up:       ["in_transit", "failed"],
  in_transit:      ["delivered", "failed"],
  delivered:       [],
  failed:          [],
  cancelled:       [],
};

const TRANSITION_LABELS: Record<ResidentialDispatchStatus, string> = {
  submitted:       "Mark Submitted",
  payment_pending: "Mark Payment Pending",
  confirmed:       "Confirm Request",
  rider_assigned:  "Mark Rider Assigned",
  picked_up:       "Mark Picked Up",
  in_transit:      "Mark In Transit",
  delivered:       "Mark Delivered",
  failed:          "Mark Failed",
  cancelled:       "Cancel Request",
};

const DESTRUCTIVE: ResidentialDispatchStatus[] = ["cancelled", "failed"];

export function ResidentialRequestActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: ResidentialDispatchStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [activeAction, setActiveAction] = useState<ResidentialDispatchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = STATUS_TRANSITIONS[currentStatus] ?? [];

  async function handleAction(status: ResidentialDispatchStatus) {
    setError(null);
    const requiresReason = DESTRUCTIVE.includes(status);
    if (requiresReason && !reason.trim()) {
      setActiveAction(status);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/residential/requests/${requestId}/update-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, failureReason: reason || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to update status.");
        } else {
          setActiveAction(null);
          setReason("");
          router.refresh();
        }
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  if (nextStatuses.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {nextStatuses.map((status) => {
          const isDestructive = DESTRUCTIVE.includes(status);
          return (
            <button
              key={status}
              onClick={() => {
                if (isDestructive) {
                  setActiveAction(status);
                  setReason("");
                  setError(null);
                } else {
                  handleAction(status);
                }
              }}
              disabled={pending}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                isDestructive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-sky-600 text-white hover:bg-sky-700"
              }`}
            >
              {TRANSITION_LABELS[status]}
            </button>
          );
        })}
      </div>

      {/* Reason form for destructive actions */}
      {activeAction && DESTRUCTIVE.includes(activeAction) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
          <p className="text-sm font-medium text-red-800">
            {activeAction === "cancelled" ? "Cancellation reason" : "Failure reason"} (required)
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Explain why..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(activeAction)}
              disabled={pending || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              Confirm
            </button>
            <button
              onClick={() => { setActiveAction(null); setReason(""); setError(null); }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
