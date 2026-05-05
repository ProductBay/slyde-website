import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "border-sky-200 bg-sky-50 text-sky-700" },
  QUALIFIED: { label: "Qualified", className: "border-green-200 bg-green-50 text-green-700" },
  NURTURING: { label: "Nurturing", className: "border-amber-200 bg-amber-50 text-amber-700" },
  STARTED_APPLICATION: { label: "Started App", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  ABANDONED: { label: "Abandoned", className: "border-slate-200 bg-slate-100 text-slate-500" },
  SUBMITTED: { label: "Submitted", className: "border-blue-200 bg-blue-50 text-blue-700" },
  UNDER_REVIEW: { label: "Under Review", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  APPROVED: { label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  ACTIVATED: { label: "Activated", className: "border-teal-200 bg-teal-50 text-teal-700" },
  LIVE: { label: "Live", className: "border-green-300 bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700" },
};

export function SlyderLeadStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "border-slate-200 bg-slate-100 text-slate-600" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
