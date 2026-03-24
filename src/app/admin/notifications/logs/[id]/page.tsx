import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminNotificationDetail } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function NotificationLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getAdminNotificationDetail(id).catch(() => null)]);
  if (!detail) notFound();

  return (
    <AdminShell
      title="Notification Log"
      description="Inspect a single notification attempt, including rendered content, provider metadata, retry history, and related entity linkage."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-950">{detail.notification.template}</h2>
            <StatusBadge status={detail.notification.status} />
            <StatusBadge status={detail.notification.channel} />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-950">Recipient:</span> {detail.notification.recipient}</p>
            <p><span className="font-semibold text-slate-950">Actor:</span> {detail.notification.actorType || "Unknown"}</p>
            <p><span className="font-semibold text-slate-950">Related entity:</span> {detail.notification.relatedEntityType || "None"} / {detail.notification.relatedEntityId || "N/A"}</p>
            <p><span className="font-semibold text-slate-950">Provider:</span> {detail.notification.providerName || "Not recorded"}</p>
            <p><span className="font-semibold text-slate-950">Provider message ID:</span> {detail.notification.providerMessageId || "Not recorded"}</p>
            <p><span className="font-semibold text-slate-950">Retry count:</span> {detail.notification.retryCount || 0}</p>
            <p><span className="font-semibold text-slate-950">Created:</span> {new Date(detail.notification.createdAt).toLocaleString("en-JM")}</p>
            <p><span className="font-semibold text-slate-950">Last attempt:</span> {detail.notification.lastAttemptAt ? new Date(detail.notification.lastAttemptAt).toLocaleString("en-JM") : "Not attempted"}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionModal
              triggerLabel="Resend"
              title="Resend notification"
              description="Create a new notification attempt using the current stored template, recipient, and payload."
              endpoint={`/api/admin/notifications/${detail.notification.id}/resend`}
              payload={{}}
              confirmLabel="Resend notification"
              kind="resend"
            />
            <ActionModal
              triggerLabel="Retry failed send"
              title="Retry failed notification"
              description="Retry the failed delivery attempt without creating a new notification history entry."
              endpoint={`/api/admin/notifications/${detail.notification.id}/retry`}
              payload={{}}
              confirmLabel="Retry notification"
              kind="resend"
            />
            {detail.notification.relatedEntityType && detail.notification.relatedEntityId ? (
              <Link href={detail.notification.relatedEntityType === "slyder_application" ? `/admin/slyder-applications/${detail.notification.relatedEntityId}` : "/admin/notifications"} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
                View related entity
              </Link>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {detail.notification.subjectSnapshot ? (
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Rendered Subject</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{detail.notification.subjectSnapshot}</p>
            </div>
          ) : null}

          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Rendered Body</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-3xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
              {detail.notification.bodySnapshot || "No body snapshot recorded."}
            </pre>
          </div>

          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Variable Snapshot</p>
            <pre className="mt-3 overflow-x-auto rounded-3xl bg-slate-100 p-4 text-xs leading-6 text-slate-700">
              {JSON.stringify(detail.notification.variablesSnapshot || {}, null, 2)}
            </pre>
          </div>

          {detail.trigger ? (
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Trigger Event</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-950">Event key:</span> {detail.trigger.eventKey}</p>
                <p><span className="font-semibold text-slate-950">Status:</span> {detail.trigger.status}</p>
                <p><span className="font-semibold text-slate-950">Created:</span> {new Date(detail.trigger.createdAt).toLocaleString("en-JM")}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

