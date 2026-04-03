"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MerchantDeliveryStatus } from "@/types/backend/onboarding";

const STATUS_PROGRESS: Record<
  MerchantDeliveryStatus,
  {
    percent: number;
    label: string;
    tone: string;
  }
> = {
  draft: { percent: 4, label: "Draft created", tone: "bg-slate-400" },
  submitted: { percent: 14, label: "Dispatch submitted", tone: "bg-sky-500" },
  quoted: { percent: 28, label: "Quote prepared", tone: "bg-indigo-500" },
  accepted: { percent: 42, label: "Accepted into queue", tone: "bg-cyan-500" },
  rider_assigned: { percent: 58, label: "Rider assigned", tone: "bg-amber-500" },
  picked_up: { percent: 72, label: "Picked up", tone: "bg-orange-500" },
  in_transit: { percent: 84, label: "In transit", tone: "bg-violet-500" },
  arrived: { percent: 92, label: "Arrived at destination", tone: "bg-fuchsia-500" },
  delivered: { percent: 100, label: "Delivered", tone: "bg-emerald-500" },
  failed: { percent: 100, label: "Delivery failed", tone: "bg-rose-500" },
  cancelled: { percent: 100, label: "Delivery cancelled", tone: "bg-slate-500" },
};

const JOURNEY_STEPS: Array<{ key: string; label: string; statuses: MerchantDeliveryStatus[] }> = [
  { key: "submitted", label: "Queued", statuses: ["submitted", "quoted", "accepted", "rider_assigned", "picked_up", "in_transit", "arrived", "delivered"] },
  { key: "accepted", label: "Confirmed", statuses: ["accepted", "rider_assigned", "picked_up", "in_transit", "arrived", "delivered"] },
  { key: "rider_assigned", label: "Rider", statuses: ["rider_assigned", "picked_up", "in_transit", "arrived", "delivered"] },
  { key: "in_transit", label: "In motion", statuses: ["picked_up", "in_transit", "arrived", "delivered"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
];

function playProgressChime() {
  try {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(784, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1047, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    window.setTimeout(() => void context.close().catch(() => undefined), 350);
  } catch {
    // Ignore audio failures on browsers that block autoplay or audio contexts.
  }
}

export function MerchantDeliveryProgressTracker({
  deliveryId,
  status,
  updatedAt,
  compact = false,
  className,
}: {
  deliveryId: string;
  status: MerchantDeliveryStatus;
  updatedAt: string;
  compact?: boolean;
  className?: string;
}) {
  const progress = STATUS_PROGRESS[status];

  useEffect(() => {
    const storageKey = `slyde-merchant-progress:${deliveryId}`;
    const nextToken = `${status}|${updatedAt}`;
    const previousToken = window.localStorage.getItem(storageKey);
    const hasStarted = !["draft", "submitted"].includes(status);

    if ((previousToken && previousToken !== nextToken) || (!previousToken && hasStarted)) {
      playProgressChime();
    }

    window.localStorage.setItem(storageKey, nextToken);
  }, [deliveryId, status, updatedAt]);

  const activeSteps = useMemo(
    () => JOURNEY_STEPS.map((step) => ({ ...step, active: step.statuses.includes(status) })),
    [status],
  );

  return (
    <div className={cn("rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-soft", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Delivery progress</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{progress.label}</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          {progress.percent}%
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#2563eb_35%,#22c55e_100%)] transition-all duration-700 ease-out",
            (status === "failed" || status === "cancelled") && "bg-[linear-gradient(90deg,#7f1d1d_0%,#ef4444_100%)]",
          )}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className={cn("mt-4 grid gap-2", compact ? "grid-cols-5 text-[11px]" : "grid-cols-5 text-xs")}>
        {activeSteps.map((step, index) => (
          <div key={step.key} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-2.5 w-2.5 rounded-full transition-all",
                  step.active ? progress.tone : "bg-slate-300",
                  step.active && status === "delivered" && "animate-pulse",
                )}
              />
              {!compact || index < 4 ? (
                <span className={cn("font-medium", step.active ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {!compact ? (
        <p className="mt-3 text-xs text-slate-500">
          Sound alerts chime when the delivery moves into active progress and each time the tracked status changes on this device.
        </p>
      ) : null}
    </div>
  );
}
