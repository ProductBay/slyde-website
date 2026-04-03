import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SupportDetailActions } from "@/components/admin/support/support-detail-actions";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getSupportConversationDetail } from "@/modules/support/services/support-conversation.service";

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([getAdminPageContext(), getSupportConversationDetail(id)]);
  if (!detail) notFound();

  return (
    <AdminShell
      title="Support Conversation Detail"
      description="Inspect support history, events, and context from one operational surface."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6">
        <SupportDetailActions
          conversation={detail.conversation}
          devAdminKey={mode === "development" ? "dev-admin-key" : undefined}
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Conversation</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{detail.conversation.subject}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {detail.conversation.domain} | {detail.conversation.channel} | {detail.conversation.status.replaceAll("_", " ")} | {detail.conversation.priority}
          </p>
          <div className="mt-6 grid gap-4">
            {detail.messages.map((message) => (
              <div key={message.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold capitalize text-slate-950">{message.senderType.replaceAll("_", " ")}</p>
                  <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("en-JM")}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{message.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          <section className="surface-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Event timeline</h2>
            <div className="mt-5 grid gap-4">
              {detail.events.length ? (
                detail.events.map((event) => (
                  <div key={event.id} className="border-b border-slate-100 pb-4 text-sm">
                    <p className="font-medium text-slate-950">{event.eventType.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-slate-500">{new Date(event.createdAt).toLocaleString("en-JM")}</p>
                    {event.notes ? <p className="mt-2 leading-7 text-slate-600">{event.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No support events recorded yet.</p>
              )}
            </div>
          </section>

          <section className="surface-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Context snapshots</h2>
            <div className="mt-5 grid gap-4">
              {detail.contextSnapshots.length ? (
                detail.contextSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">{snapshot.contextType.replaceAll("_", " ")}</p>
                    <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-600">
                      {JSON.stringify(snapshot.payload, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No context snapshots attached yet.</p>
              )}
            </div>
          </section>
        </div>
        </div>
      </div>
    </AdminShell>
  );
}
