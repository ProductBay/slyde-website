import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  reviewing: "bg-amber-100 text-amber-800",
  qualified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  pending: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-800",
  activated: "bg-sky-100 text-sky-800",
  live: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
};

export function MerchantStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize", toneMap[status] || "bg-slate-100 text-slate-700")}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
