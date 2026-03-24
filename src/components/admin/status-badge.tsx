import type { LaunchStatus, NotificationStatus } from "@/types/backend/onboarding";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "submitted"
  | "under_review"
  | "documents_pending"
  | "approved"
  | "rejected"
  | "not_ready"
  | "building"
  | "near_ready"
  | "ready"
  | "live"
  | "paused"
  | "queued"
  | "sent"
  | "failed"
  | "skipped"
  | "confirmed"
  | "active"
  | "invited"
  | "activation_pending"
  | "contract_pending"
  | "suspended"
  | "disabled"
  | "pending"
  | "passed"
  | "failed_readiness"
  | "setup_incomplete"
  | "setup_completed"
  | "ready_for_dispatch"
  | "application_received"
  | "readiness_pending"
  | "training_pending"
  | "inactive"
  | "eligible"
  | "waiting_for_zone"
  | "live_enabled"
  | "eligible_offline"
  | "eligible_online"
  | "blocked"
  | "email"
  | "whatsapp"
  | "sms"
  | "internal";

const toneClasses: Record<BadgeTone, string> = {
  submitted: "bg-slate-100 text-slate-700 border-slate-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  documents_pending: "bg-orange-50 text-orange-700 border-orange-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  not_ready: "bg-slate-100 text-slate-700 border-slate-200",
  building: "bg-sky-50 text-sky-700 border-sky-200",
  near_ready: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  live: "bg-emerald-100 text-emerald-800 border-emerald-300",
  paused: "bg-rose-50 text-rose-700 border-rose-200",
  queued: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  skipped: "bg-slate-100 text-slate-600 border-slate-200",
  confirmed: "bg-cyan-50 text-cyan-700 border-cyan-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  invited: "bg-slate-100 text-slate-700 border-slate-200",
  activation_pending: "bg-amber-50 text-amber-700 border-amber-200",
  contract_pending: "bg-indigo-50 text-indigo-700 border-indigo-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
  disabled: "bg-slate-200 text-slate-700 border-slate-300",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  passed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed_readiness: "bg-rose-50 text-rose-700 border-rose-200",
  setup_incomplete: "bg-slate-100 text-slate-700 border-slate-200",
  setup_completed: "bg-sky-50 text-sky-700 border-sky-200",
  ready_for_dispatch: "bg-emerald-50 text-emerald-700 border-emerald-200",
  application_received: "bg-slate-100 text-slate-700 border-slate-200",
  readiness_pending: "bg-amber-50 text-amber-700 border-amber-200",
  training_pending: "bg-indigo-50 text-indigo-700 border-indigo-200",
  inactive: "bg-slate-100 text-slate-700 border-slate-200",
  eligible: "bg-sky-50 text-sky-700 border-sky-200",
  waiting_for_zone: "bg-cyan-50 text-cyan-700 border-cyan-200",
  live_enabled: "bg-emerald-100 text-emerald-800 border-emerald-300",
  eligible_offline: "bg-sky-50 text-sky-700 border-sky-200",
  eligible_online: "bg-emerald-100 text-emerald-800 border-emerald-300",
  blocked: "bg-rose-50 text-rose-700 border-rose-200",
  email: "bg-sky-50 text-sky-700 border-sky-200",
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sms: "bg-indigo-50 text-indigo-700 border-indigo-200",
  internal: "bg-slate-100 text-slate-700 border-slate-200",
};

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

export function StatusBadge({
  status,
  className,
}: {
  status: string | LaunchStatus | NotificationStatus | "not_sent";
  className?: string;
}) {
  const tone = (status === "not_sent" ? "skipped" : status === "failed" ? "failed" : status) as BadgeTone;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", toneClasses[tone] || toneClasses.submitted, className)}>
      {labelize(status)}
    </span>
  );
}
