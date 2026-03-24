import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getNotificationHealthSummary } from "@/server/notifications/notification.service";

export default async function NotificationHealthPage() {
  const [{ user, mode }, health] = await Promise.all([getAdminPageContext(), getNotificationHealthSummary()]);

  return (
    <AdminShell
      title="Notification Health"
      description="Track delivery performance, channel success rates, failure patterns, and recent retry activity across the SLYDE platform."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiStatCard label="Total Logs" value={health.totals.total} />
        <KpiStatCard label="Successful Sends" value={health.totals.sent} />
        <KpiStatCard label="Failures" value={health.totals.failed} />
        <KpiStatCard label="Pending Queue" value={health.totals.queued} />
        <KpiStatCard label="Recent Retries" value={health.totals.recentRetries} />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Channel Breakdown</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delivery performance by channel</h2>
          </div>
          <DataTable>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <TableHeaderCell>Channel</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Success</TableHeaderCell>
                  <TableHeaderCell>Failed</TableHeaderCell>
                  <TableHeaderCell>Success Rate</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {health.channelBreakdown.map((item) => (
                  <tr key={item.channel}>
                    <TableCell className="font-medium text-slate-950">{item.channel}</TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell>{item.success}</TableCell>
                    <TableCell>{item.failed}</TableCell>
                    <TableCell>{item.successRate}%</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        </div>

        <div>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Failure Summary</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Most common issues</h2>
          </div>
          <div className="grid gap-4">
            {health.failureReasons.length ? health.failureReasons.map((item) => (
              <div key={item.reason} className="surface-card p-5">
                <p className="text-sm font-semibold text-slate-950">{item.reason}</p>
                <p className="mt-2 text-sm text-slate-600">{item.count} failure{item.count === 1 ? "" : "s"}</p>
              </div>
            )) : (
              <div className="surface-card p-5">
                <p className="text-sm font-semibold text-slate-950">No recent failures</p>
                <p className="mt-2 text-sm text-slate-600">Delivery logs have not recorded a failure in the current dataset.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Recent Failures</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Latest failed notifications</h2>
        </div>
        <NotificationStatusList items={health.recentFailures.map((item) => ({
          id: item.id,
          applicantName: item.recipientName || item.recipient || "Unknown recipient",
          applicationId: item.applicationId,
          slyderProfileId: item.slyderProfileId,
          channel: item.channel,
          recipient: item.recipient || "Unknown recipient",
          template: item.templateKey || item.template,
          actorType: item.actorType,
          relatedEntityType: item.relatedEntityType,
          relatedEntityId: item.relatedEntityId,
          providerName: item.providerName,
          providerMessageId: item.providerMessageId,
          retryCount: item.retryCount,
          subjectSnapshot: item.subjectSnapshot,
          bodySnapshot: item.bodySnapshot,
          variablesSnapshot: item.variablesSnapshot,
          status: item.status || "pending",
          failureReason: item.failureReason,
          createdAt: item.createdAt,
          lastAttemptAt: item.lastAttemptAt,
          sentAt: item.sentAt,
          deliveredAt: item.deliveredAt,
          resentFromId: item.resentFromId,
        }))} />
      </section>
    </AdminShell>
  );
}

