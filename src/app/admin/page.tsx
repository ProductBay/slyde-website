import Link from "next/link";
import { BadgeCheck, MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { LaunchStatusBoard } from "@/components/admin/launch-status-board";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { ZoneReadinessCard } from "@/components/admin/zone-readiness-card";
import { getAdminDashboardData } from "@/modules/admin/services/admin-control-tower.service";
import { listVehicleBrandingLeads } from "@/modules/vehicle-branding/services/vehicle-branding.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminDashboardPage() {
  const [{ user, mode }, dashboard, vehicleBrandingLeads] = await Promise.all([
    getAdminPageContext(),
    getAdminDashboardData(),
    listVehicleBrandingLeads({}),
  ]);
  const openBrandingLeads = vehicleBrandingLeads.filter((lead) => !["COMPLETED", "ARCHIVED"].includes(lead.status)).length;
  const newestBrandingLead = vehicleBrandingLeads[0];

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

      <section className="mt-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-panel">
          <div className="grid gap-0 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                  <BadgeCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Vehicle Branding Submissions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">SLYDE Verified Vehicle Branding leads</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                    Review Slyders who requested branding info, update lead status, add notes, and open a WhatsApp follow-up with the default program message.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total leads</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">{vehicleBrandingLeads.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Open leads</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">{openBrandingLeads}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Newest</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                        {newestBrandingLead ? newestBrandingLead.fullName : "No submissions yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 sm:p-7 lg:border-l lg:border-t-0">
              <Link
                href="/admin/vehicle-branding-leads"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <MessageCircle className="h-4 w-4" />
                Open branding leads
              </Link>
            </div>
          </div>
        </div>
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

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Home-Slyde Residential</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Residential pickup & dispatch management</h2>
          </div>
          <Link href="/admin/residential" className="text-sm font-semibold text-sky-700">
            Open residential console
          </Link>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-4">
            Complete admin control center for Home-Slyde residential dispatch. Manage resident signups, approve applications, and monitor dispatch requests through delivery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/residential"
              className="p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition"
            >
              <p className="font-semibold text-slate-900 mb-1">Dashboard</p>
              <p className="text-xs text-slate-600">Key metrics and quick actions</p>
            </Link>
            <Link
              href="/admin/residential/leads"
              className="p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition"
            >
              <p className="font-semibold text-slate-900 mb-1">Resident Leads</p>
              <p className="text-xs text-slate-600">Manage signups and approvals</p>
            </Link>
            <Link
              href="/admin/residential/requests"
              className="p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition"
            >
              <p className="font-semibold text-slate-900 mb-1">Dispatch Requests</p>
              <p className="text-xs text-slate-600">Monitor and control requests</p>
            </Link>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
