import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listAllSupportConversations } from "@/modules/support/services/support-conversation.service";

export default async function AdminSupportPage() {
  const [{ user, mode }, conversations] = await Promise.all([getAdminPageContext(), listAllSupportConversations()]);

  return (
    <AdminShell
      title="Support Inbox"
      description="Monitor support conversations across merchant, public, and future SLYDE product domains."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="surface-panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Support operations</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Support conversations</h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {conversations.length} conversations
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {conversations.length ? (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/admin/support/${conversation.id}`}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{conversation.subject}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {conversation.domain} | {conversation.channel} | {conversation.status.replaceAll("_", " ")} | {conversation.priority}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(conversation.updatedAt).toLocaleString("en-JM")}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-[1.35rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
              No support conversations recorded yet.
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
