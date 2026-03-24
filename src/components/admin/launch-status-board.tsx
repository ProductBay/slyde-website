import Link from "next/link";
import type { AdminZoneView } from "@/types/admin";
import { StatusBadge } from "@/components/admin/status-badge";

export function LaunchStatusBoard({ groups }: { groups: Record<string, AdminZoneView[]> }) {
  const ordered = [
    ["not_ready", "Not Ready"],
    ["building", "Building"],
    ["near_ready", "Near Ready"],
    ["ready", "Ready"],
    ["live", "Live"],
    ["paused", "Paused"],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1 3xl:grid-cols-2">
      {ordered.map(([key, label]) => (
        <div key={key} className="surface-card min-w-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{label}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{groups[key]?.length || 0}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {groups[key]?.length ? (
              groups[key].slice(0, 4).map((zone) => (
                <div key={zone.id} className="min-w-0 rounded-2xl border border-slate-200 bg-surface-1 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-slate-950">{zone.name}</p>
                    <StatusBadge status={zone.launchStatus} className="shrink-0" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {zone.metrics.readySlyders}/{zone.metrics.requiredReadySlyders} ready
                  </p>
                  <Link href={`/admin/coverage-zones/${zone.id}`} className="mt-3 inline-flex text-sm font-semibold text-sky-700">
                    View zone
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-500">No zones in this state right now.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
