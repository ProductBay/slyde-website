import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-100",
  CONTACTED: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  QUALIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  PRICING_SENT: "bg-amber-50 text-amber-700 ring-amber-100",
  APPROVED: "bg-green-50 text-green-700 ring-green-100",
  SCHEDULED: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  COMPLETED: "bg-slate-950 text-white ring-slate-950",
  NOT_READY: "bg-orange-50 text-orange-700 ring-orange-100",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function VehicleBrandingStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", styles[status] ?? styles.NEW)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
