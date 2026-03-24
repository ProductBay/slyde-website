import Link from "next/link";
import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { listAdminNotifications } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getNotificationHealthSummary } from "@/server/notifications/notification.service";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, items, health] = await Promise.all([
    getAdminPageContext(),
    listAdminNotifications({
      channel: typeof params.channel === "string" ? params.channel : undefined,
      status: typeof params.status === "string" ? params.status : undefined,
      template: typeof params.template === "string" ? params.template : undefined,
      actorType: typeof params.actorType === "string" ? params.actorType : undefined,
      search: typeof params.search === "string" ? params.search : undefined,
    }),
    getNotificationHealthSummary(),
  ]);

  return (
    <AdminShell
      title="Notifications Center"
      description="Monitor WhatsApp and email delivery health, inspect recent sends, and control resends and retries from one operational workspace."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiStatCard label="Successful Sends" value={health.totals.sent} />
        <KpiStatCard label="WhatsApp Sent" value={health.channelBreakdown.find((item) => item.channel === "whatsapp")?.success ?? 0} />
        <KpiStatCard label="Email Sent" value={health.channelBreakdown.find((item) => item.channel === "email")?.success ?? 0} />
        <KpiStatCard label="Failed Notifications" value={health.totals.failed} />
        <KpiStatCard label="Pending Queue" value={health.totals.queued} />
        <KpiStatCard label="Recent Retries" value={health.totals.recentRetries} />
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/notifications/templates" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Manage templates
        </Link>
        <Link href="/admin/notifications/health" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
          View health
        </Link>
      </div>

      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input className="field-input" name="search" placeholder="Search recipient or template" defaultValue={typeof params.search === "string" ? params.search : ""} />
            <select className="field-input" name="channel" defaultValue={typeof params.channel === "string" ? params.channel : ""}>
              <option value="">All channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="internal">Internal</option>
            </select>
            <select className="field-input" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
              <option value="">All statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
              <option value="confirmed">Confirmed</option>
            </select>
            <select className="field-input" name="actorType" defaultValue={typeof params.actorType === "string" ? params.actorType : ""}>
              <option value="">All actors</option>
              <option value="slyder_applicant">Slyder applicant</option>
              <option value="slyder_user">Slyder user</option>
              <option value="merchant_interest">Merchant interest</option>
              <option value="merchant_user">Merchant user</option>
              <option value="admin_user">Admin user</option>
              <option value="system_internal">System internal</option>
            </select>
            <input className="field-input" name="template" placeholder="Template key" defaultValue={typeof params.template === "string" ? params.template : ""} />
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Recipient</TableHeaderCell>
              <TableHeaderCell>Channel</TableHeaderCell>
              <TableHeaderCell>Actor</TableHeaderCell>
              <TableHeaderCell>Template</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Failure Reason</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.id}>
                <TableCell>
                  <p className="font-medium text-slate-950">{item.applicantName}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.recipient}</p>
                </TableCell>
                <TableCell>{item.channel}</TableCell>
                <TableCell>{item.actorType || "Unknown"}</TableCell>
                <TableCell>{item.template}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString("en-JM")}</TableCell>
                <TableCell>{item.failureReason || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/notifications/logs/${item.id}`} className="text-sm font-semibold text-sky-700">
                      Inspect
                    </Link>
                    <ActionModal
                      triggerLabel="Resend"
                      title="Resend notification"
                      description="Create a new notification attempt using the same channel, recipient, and template."
                      endpoint={`/api/admin/notifications/${item.id}/resend`}
                      payload={{}}
                      confirmLabel="Resend notification"
                      kind="resend"
                    />
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}

