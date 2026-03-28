import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { LaunchStatusBoard } from "@/components/admin/launch-status-board";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { ZoneReadinessCard } from "@/components/admin/zone-readiness-card";
import { getAdminDashboardData } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminDashboardPage() {
  const [{ user, mode }, dashboard] = await Promise.all([getAdminPageContext(), getAdminDashboardData()]);

  return (
    <AdminShell
      title="Pre-launch Control Tower"
      description="Monitor recruitment, zone readiness, notification health, and rollout posture from a single logistics operations workspace."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboard.kpis.map((kpi) => (
          <KpiStatCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="mt-8 grid gap-8 2xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <div className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Network Readiness Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Strongest zones moving toward launch</h2>
            </div>
            <Link href="/admin/network-readiness" className="text-sm font-semibold text-sky-700">
              View readiness page
            </Link>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {dashboard.topZones.map((zone) => (
              <ZoneReadinessCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-8">
          <div className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Notification Health</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Communications center</h2>
              </div>
              <Link href="/admin/notifications" className="text-sm font-semibold text-sky-700">
                Open notifications
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiStatCard label="WhatsApp Sent" value={dashboard.notificationSummary.whatsappSent} />
              <KpiStatCard label="Email Sent" value={dashboard.notificationSummary.emailSent} />
              <KpiStatCard label="Failures" value={dashboard.notificationSummary.failed} />
            </div>
          </div>
          <NotificationStatusList items={dashboard.notificationSummary.recentFailures.length ? dashboard.notificationSummary.recentFailures : []} />
        </div>
      </section>

      <section className="mt-8 grid gap-8 2xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <div className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Pending Applications</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Applications needing review</h2>
            </div>
            <Link href="/admin/slyder-applications" className="text-sm font-semibold text-sky-700">
              Open queue
            </Link>
          </div>
          <DataTable>
            <table className="min-w-[62rem] divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <TableHeaderCell>Applicant</TableHeaderCell>
                  <TableHeaderCell>Parish / Town</TableHeaderCell>
                  <TableHeaderCell>Courier</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Application</TableHeaderCell>
                  <TableHeaderCell>WhatsApp</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Quick Action</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dashboard.pendingApplications.map((item) => (
                  <tr key={item.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-950">{item.fullName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.applicationCode}</p>
                    </TableCell>
                    <TableCell className="max-w-[12rem] break-words">{item.parish} / {item.zoneName}</TableCell>
                    <TableCell>{item.courierType}</TableCell>
                    <TableCell>{new Date(item.submittedAt).toLocaleDateString("en-JM")}</TableCell>
                    <TableCell><StatusBadge status={item.applicationStatus} /></TableCell>
                    <TableCell><StatusBadge status={item.whatsappStatus} /></TableCell>
                    <TableCell><StatusBadge status={item.emailStatus} /></TableCell>
                    <TableCell>
                      <Link href={`/admin/slyder-applications/${item.id}`} className="text-sm font-semibold text-sky-700">
                        Review
                      </Link>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        </div>

        <div className="min-w-0">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Launch Control Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Rollout posture by zone state</h2>
          </div>
          <LaunchStatusBoard groups={dashboard.launchGroups} />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Employee Queue</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Internal applicants awaiting onboarding invites</h2>
          </div>
          <Link href="/admin/employee-applications" className="text-sm font-semibold text-sky-700">
            Open employee queue
          </Link>
        </div>

        {dashboard.pendingEmployeeApplications.length ? (
          <DataTable>
            <table className="min-w-[62rem] divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <TableHeaderCell>Applicant</TableHeaderCell>
                  <TableHeaderCell>Role / Department</TableHeaderCell>
                  <TableHeaderCell>Location</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Application</TableHeaderCell>
                  <TableHeaderCell>Invite Email</TableHeaderCell>
                  <TableHeaderCell>Quick Action</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dashboard.pendingEmployeeApplications.map((item) => (
                  <tr key={item.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-950">{item.fullName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.email}</p>
                    </TableCell>
                    <TableCell>{item.roleInterest} / {item.departmentInterest}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{new Date(item.submittedAt).toLocaleDateString("en-JM")}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell><StatusBadge status={item.inviteEmailStatus} /></TableCell>
                    <TableCell>
                      <Link href={`/admin/employee-applications/${item.id}`} className="text-sm font-semibold text-sky-700">
                        Review
                      </Link>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        ) : (
          <div className="surface-panel p-6 text-sm leading-7 text-slate-600">
            No employee applicants are waiting for review right now.
          </div>
        )}
      </section>
    </AdminShell>
  );
}
