import { StatusBadge } from "@/components/admin/status-badge";

export function ZoneStatusPanel({
  zoneName,
  zoneStatus,
}: {
  zoneName?: string;
  zoneStatus?: string;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Zone status</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-lg font-semibold text-slate-950">{zoneName || "Zone not assigned yet"}</p>
        {zoneStatus ? <StatusBadge status={zoneStatus} /> : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Your zone status affects whether SLYDE can enable you for live deliveries even after setup and readiness are complete.
      </p>
    </div>
  );
}
