import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { listNotificationTemplates } from "@/server/notifications/notification.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function NotificationTemplatesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, templates] = await Promise.all([
    getAdminPageContext(),
    listNotificationTemplates({
      channel: typeof params.channel === "string" ? params.channel : undefined,
      actorType: typeof params.actorType === "string" ? params.actorType : undefined,
      eventType: typeof params.eventType === "string" ? params.eventType : undefined,
      active: typeof params.active === "string" ? params.active : undefined,
      search: typeof params.search === "string" ? params.search : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Notification Templates"
      description="Manage reusable WhatsApp and email templates used across onboarding, launch readiness, and operational communication."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input className="field-input" name="search" placeholder="Search template key or event" defaultValue={typeof params.search === "string" ? params.search : ""} />
            <select className="field-input" name="channel" defaultValue={typeof params.channel === "string" ? params.channel : ""}>
              <option value="">All channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="internal">Internal</option>
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
            <input className="field-input" name="eventType" placeholder="Event type" defaultValue={typeof params.eventType === "string" ? params.eventType : ""} />
            <select className="field-input" name="active" defaultValue={typeof params.active === "string" ? params.active : ""}>
              <option value="">Any state</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Template</TableHeaderCell>
              <TableHeaderCell>Channel</TableHeaderCell>
              <TableHeaderCell>Actor</TableHeaderCell>
              <TableHeaderCell>Event</TableHeaderCell>
              <TableHeaderCell>Version</TableHeaderCell>
              <TableHeaderCell>Active</TableHeaderCell>
              <TableHeaderCell>Usage</TableHeaderCell>
              <TableHeaderCell>Failures</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {templates.map((template) => (
              <tr key={template.id}>
                <TableCell>
                  <p className="font-medium text-slate-950">{template.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{template.key}</p>
                </TableCell>
                <TableCell>{template.channel}</TableCell>
                <TableCell>{template.actorType}</TableCell>
                <TableCell>{template.eventType}</TableCell>
                <TableCell>{template.version}</TableCell>
                <TableCell><StatusBadge status={template.isActive ? "active" : "disabled"} /></TableCell>
                <TableCell>{template.usageCount}</TableCell>
                <TableCell>{template.failureCount}</TableCell>
                <TableCell>
                  <Link href={`/admin/notifications/templates/${template.id}`} className="text-sm font-semibold text-sky-700">
                    Open editor
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}

