import { notFound } from "next/navigation";
import { getSupportConversationDetail } from "@/modules/support/services/support-conversation.service";

export default async function SupportTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSupportConversationDetail(id);
  if (!detail) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Support tracking</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{detail.conversation.subject}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Status: {detail.conversation.status.replaceAll("_", " ")} | Priority: {detail.conversation.priority}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Conversation</h2>
          <div className="mt-5 grid gap-4">
            {detail.messages.length ? (
              detail.messages.map((message) => (
                <div key={message.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold capitalize text-slate-950">{message.senderType.replaceAll("_", " ")}</p>
                    <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("en-JM")}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{message.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No messages recorded yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Timeline</h2>
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
      </div>
    </div>
  );
}
