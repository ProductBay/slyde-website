import { cn } from "@/lib/utils";
import type { MerchantDeliveryStatus } from "@/types/backend/onboarding";

const classes: Record<MerchantDeliveryStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-700",
  quoted: "bg-indigo-100 text-indigo-700",
  accepted: "bg-cyan-100 text-cyan-800",
  rider_assigned: "bg-amber-100 text-amber-800",
  picked_up: "bg-orange-100 text-orange-800",
  in_transit: "bg-violet-100 text-violet-800",
  arrived: "bg-fuchsia-100 text-fuchsia-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export function MerchantDeliveryStatusBadge({ status }: { status: MerchantDeliveryStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", classes[status])}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
