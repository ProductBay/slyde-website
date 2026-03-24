import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";

export default async function LaunchControlPage() {
  const [{ user, mode }, zones] = await Promise.all([getAdminPageContext(), listCoverageZones()]);
  const ordered = ["not_ready", "building", "near_ready", "ready", "live", "paused"] as const;

  return (
    <AdminShell
      title="Launch Control"
      description="Make rollout decisions area by area, mark zones live, pause risky zones, and keep merchant access aligned with operational readiness."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        {ordered.map((status) => {
          const items = zones.filter((zone) => zone.launchStatus === status);
          return (
            <section key={status} className="surface-panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">{status.replace(/_/g, " ")}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length}</span>
              </div>
              <div className="mt-5 grid gap-4">
                {items.map((zone) => (
                  <div key={zone.id} className="rounded-[1.5rem] border border-slate-200 bg-surface-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{zone.name}</p>
                        <p className="mt-2 text-sm text-slate-600">{zone.metrics.readinessPercentage}% ready · {zone.metrics.readySlyders}/{zone.metrics.requiredReadySlyders} ready</p>
                      </div>
                      <StatusBadge status={zone.launchStatus} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{zone.estimatedLaunchLabel} · Merchant {zone.merchantAvailability}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <ActionModal
                        triggerLabel="Mark live"
                        title="Mark zone live"
                        description="Enable live rollout for this zone."
                        endpoint={`/api/admin/coverage-zones/${zone.id}/launch-status`}
                        method="PATCH"
                        payload={{ action: "mark_live" }}
                        confirmLabel="Mark zone live"
                        kind="zone"
                      />
                      <ActionModal
                        triggerLabel={zone.isPaused ? "Resume" : "Pause"}
                        title={zone.isPaused ? "Resume zone" : "Pause zone"}
                        description={zone.isPaused ? "Resume rollout for this zone." : "Pause rollout for this zone."}
                        endpoint={`/api/admin/coverage-zones/${zone.id}/launch-status`}
                        method="PATCH"
                        payload={{ action: zone.isPaused ? "resume" : "pause" }}
                        confirmLabel={zone.isPaused ? "Resume zone" : "Pause zone"}
                        kind="zone"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
