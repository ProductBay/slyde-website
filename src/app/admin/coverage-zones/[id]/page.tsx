import { notFound } from "next/navigation";
import Link from "next/link";
import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getCoverageZoneDetail } from "@/modules/admin/services/admin-control-tower.service";

export default async function CoverageZoneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getCoverageZoneDetail(id).catch(() => null)]);
  if (!detail) notFound();

  return (
    <AdminShell
      title="Zone Control View"
      description="Review readiness, applicants, approved Slyders, and launch-state controls for this delivery zone."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="surface-panel p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{detail.zone.name}</h2>
              <StatusBadge status={detail.zone.launchStatus} />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{detail.zone.parish} · {detail.zone.metrics.readinessPercentage}% readiness · {detail.zone.estimatedLaunchLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionModal
              triggerLabel="Mark live"
              title="Mark zone live"
              description="Move this zone into live operations and open merchant availability."
              endpoint={`/api/admin/coverage-zones/${detail.zone.id}/launch-status`}
              method="PATCH"
              payload={{ action: "mark_live" }}
              confirmLabel="Mark zone live"
              kind="zone"
            />
            <ActionModal
              triggerLabel={detail.zone.isPaused ? "Resume zone" : "Pause zone"}
              title={detail.zone.isPaused ? "Resume zone" : "Pause zone"}
              description={detail.zone.isPaused ? "Resume this zone and move it back into rollout tracking." : "Pause this zone and remove it from live rollout decisions until resumed."}
              endpoint={`/api/admin/coverage-zones/${detail.zone.id}/launch-status`}
              method="PATCH"
              payload={{ action: detail.zone.isPaused ? "resume" : "pause" }}
              confirmLabel={detail.zone.isPaused ? "Resume zone" : "Pause zone"}
              kind="zone"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiStatCard label="Applicants" value={detail.zone.metrics.applicants} />
        <KpiStatCard label="Approved" value={detail.zone.metrics.approvedSlyders} />
        <KpiStatCard label="Ready" value={detail.zone.metrics.readySlyders} />
        <KpiStatCard label="Remaining Needed" value={detail.zone.metrics.remainingNeeded} />
        <KpiStatCard label="Merchant Availability" value={detail.zone.merchantAvailability === "open" ? 1 : detail.zone.merchantAvailability === "waitlist" ? 0 : 0} subtext={detail.zone.merchantAvailability} />
        <KpiStatCard label="Launch Window" value={detail.zone.metrics.readinessPercentage} subtext={detail.zone.estimatedLaunchLabel} />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-panel p-6">
          <h3 className="text-xl font-semibold text-slate-950">Readiness section</h3>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-600" style={{ width: `${detail.zone.metrics.readinessPercentage}%` }} />
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This zone requires {detail.zone.metrics.requiredReadySlyders} ready Slyders to launch. {detail.zone.metrics.readySlyders} are currently ready.
          </p>
          <p className="mt-4 text-sm leading-7 text-sky-700">{detail.insight}</p>
        </div>
        <div className="surface-panel p-6">
          <h3 className="text-xl font-semibold text-slate-950">Launch timeline and public messaging</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated launch label</p>
              <p className="mt-2 font-semibold text-slate-950">{detail.zone.estimatedLaunchLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Public phase message</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{detail.zone.publicMessage.body}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recruitment message</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{detail.zone.publicMessage.recruitmentMessage}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Slyder benefit message</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{detail.zone.publicMessage.slyderBenefitMessage}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Zone Applicants</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Applicants contributing to this zone</h3>
            </div>
          </div>
          <DataTable>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <TableHeaderCell>Applicant</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Courier</TableHeaderCell>
                  <TableHeaderCell>Review</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {detail.applicants.map((item) => (
                  <tr key={item.id}>
                    <TableCell className="font-medium text-slate-950">{item.fullName}</TableCell>
                    <TableCell><StatusBadge status={item.applicationStatus} /></TableCell>
                    <TableCell>{item.courierType}</TableCell>
                    <TableCell>
                      <Link href={`/admin/slyder-applications/${item.id}`} className="text-sm font-semibold text-sky-700">
                        Open
                      </Link>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Zone Approved Slyders</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Operational profiles in this zone</h3>
          </div>
          <DataTable>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <TableHeaderCell>Slyder</TableHeaderCell>
                  <TableHeaderCell>Readiness</TableHeaderCell>
                  <TableHeaderCell>Operational</TableHeaderCell>
                  <TableHeaderCell>Go Online</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {detail.slyders.map((item) => (
                  <tr key={item.id}>
                    <TableCell className="font-medium text-slate-950">{item.displayName}</TableCell>
                    <TableCell><StatusBadge status={item.readinessStatus} /></TableCell>
                    <TableCell><StatusBadge status={item.operationalStatus} /></TableCell>
                    <TableCell>{item.canGoOnline ? "Yes" : "No"}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        </div>
      </section>
    </AdminShell>
  );
}
