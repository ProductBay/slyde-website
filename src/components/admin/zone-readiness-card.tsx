import Link from "next/link";
import type { AdminZoneView } from "@/types/admin";
import { StatusBadge } from "@/components/admin/status-badge";

export function ZoneReadinessCard({ zone }: { zone: AdminZoneView }) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{zone.parish}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{zone.name}</h3>
        </div>
        <StatusBadge status={zone.launchStatus} />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${zone.metrics.readinessPercentage}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>{zone.metrics.readinessPercentage}% ready</span>
        <span>{zone.metrics.remainingNeeded} more needed</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Applicants</p>
          <p className="mt-1 font-semibold text-slate-950">{zone.metrics.applicants}</p>
        </div>
        <div>
          <p className="text-slate-400">Approved</p>
          <p className="mt-1 font-semibold text-slate-950">{zone.metrics.approvedSlyders}</p>
        </div>
        <div>
          <p className="text-slate-400">Ready</p>
          <p className="mt-1 font-semibold text-slate-950">{zone.metrics.readySlyders}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{zone.publicMessage.body}</p>
      <Link href={`/admin/coverage-zones/${zone.id}`} className="mt-5 inline-flex text-sm font-semibold text-sky-700">
        Open zone detail
      </Link>
    </div>
  );
}
