import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { NotificationTemplateEditor } from "@/components/admin/notification-template-editor";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getNotificationTemplateById } from "@/server/notifications/notification.service";

export default async function NotificationTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getNotificationTemplateById(id)]);
  if (!detail) notFound();

  return (
    <AdminShell
      title="Notification Template"
      description="Edit reusable template content, inspect preview output, and review recent delivery history."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="mb-6 surface-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-950">{detail.template.name}</h2>
          <StatusBadge status={detail.template.channel} />
          <StatusBadge status={detail.template.isActive ? "active" : "disabled"} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Key: {detail.template.key}</span>
          <span>Actor: {detail.template.actorType}</span>
          <span>Event: {detail.template.eventType}</span>
          <span>Version: {detail.template.version}</span>
        </div>
      </div>

      <NotificationTemplateEditor
        template={{
          id: detail.template.id,
          key: detail.template.key,
          name: detail.template.name,
          subject: detail.template.subject,
          bodyTemplate: detail.template.bodyTemplate,
          plainTextTemplate: detail.template.plainTextTemplate,
          isActive: detail.template.isActive,
          description: detail.template.description,
        }}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Rendered Preview</p>
          {detail.preview.subject ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{detail.preview.subject}</p>
            </div>
          ) : null}
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Body</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-3xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
              {detail.preview.body}
            </pre>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Recent Activity</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Latest notification attempts</h3>
          </div>
          <NotificationStatusList items={detail.recentLogs.map((item) => ({
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
        </div>
      </section>
    </AdminShell>
  );
}

