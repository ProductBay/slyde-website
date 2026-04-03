import { cn } from "@/lib/utils";
import type { OutOfParishOverallStatus } from "@/types/backend/onboarding";

const classes: Record<OutOfParishOverallStatus, string> = {
  submitted: "bg-slate-100 text-slate-700",
  pickup_scheduled: "bg-sky-100 text-sky-700",
  picked_up_by_slyde: "bg-cyan-100 text-cyan-800",
  dropped_at_partner: "bg-indigo-100 text-indigo-800",
  accepted_by_partner: "bg-violet-100 text-violet-800",
  in_interparish_transit: "bg-amber-100 text-amber-800",
  arrived_at_destination_hub: "bg-fuchsia-100 text-fuchsia-800",
  ready_for_collection: "bg-emerald-100 text-emerald-800",
  out_for_final_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export function OutOfParishStatusBadge({ status }: { status: OutOfParishOverallStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", classes[status])}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
