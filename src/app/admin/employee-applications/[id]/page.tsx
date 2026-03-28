import { notFound } from "next/navigation";
import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminEmployeeApplicationDetail } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminEmployeeApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([
    getAdminPageContext(),
    getAdminEmployeeApplicationDetail(id).catch(() => null),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <AdminShell
      title="Employee Applicant Review"
      description="Review the applicant, send the onboarding invite email, or close the application."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="surface-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Employee applicant</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{detail.application.fullName}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {detail.application.roleInterest} in {detail.application.departmentInterest} based in {detail.application.location}.
              </p>
            </div>
            <StatusBadge status={detail.application.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Contact</p>
              <p className="mt-3 text-sm text-slate-700">{detail.application.email}</p>
              <p className="mt-1 text-sm text-slate-700">{detail.application.phone}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Employment</p>
              <p className="mt-3 text-sm text-slate-700">{detail.application.employmentType.replace("_", " ")}</p>
              <p className="mt-1 text-sm text-slate-700">
                {detail.application.managerTrackInterest ? "Open to supervisor/manager track" : "Individual contributor track"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Experience summary</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{detail.application.experienceSummary}</p>
          </div>

          {detail.application.notes ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Internal note</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{detail.application.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Admin actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Trigger onboarding</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Approving here sends the employee activation email. The employee then creates a password, signs in, and completes onboarding.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionModal
                triggerLabel={detail.application.status === "approved" ? "Resend invite" : "Send invite"}
                title={detail.application.status === "approved" ? "Resend employee invite" : "Send employee invite"}
                description="This will create or refresh the employee activation invite and send the onboarding email."
                endpoint={`/api/admin/employee-applications/${detail.application.id}/invite`}
                payload={{}}
                confirmLabel={detail.application.status === "approved" ? "Resend invite email" : "Send invite email"}
                kind="employee-invite"
              />
              {detail.application.status !== "approved" ? (
                <ActionModal
                  triggerLabel="Reject application"
                  title="Reject employee application"
                  description="This closes the employee application and emails the applicant with the review outcome."
                  endpoint={`/api/admin/employee-applications/${detail.application.id}/reject`}
                  payload={{}}
                  confirmLabel="Reject employee application"
                  kind="reject"
                />
              ) : null}
            </div>
          </div>

          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Linked account</p>
            {detail.linkedUser ? (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{detail.linkedUser.fullName}</p>
                <p>{detail.linkedUser.email}</p>
                <div className="pt-2">
                  <StatusBadge status={detail.linkedUser.accountStatus} />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-600">No employee account has been linked yet.</p>
            )}
          </div>

          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Employee profile</p>
            {detail.linkedEmployeeProfile ? (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{detail.linkedEmployeeProfile.employeeCode}</p>
                <p>{detail.linkedEmployeeProfile.title}</p>
                <p>{detail.linkedEmployeeProfile.department}</p>
                <div className="pt-2">
                  <StatusBadge status={detail.linkedEmployeeProfile.isOnboarded ? "active" : "setup_incomplete"} />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-600">No employee profile exists yet. Sending the invite will create one.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Notification history</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Invite and review messages</h2>
        </div>
        <NotificationStatusList items={detail.notificationHistory} allowResend />
      </section>
    </AdminShell>
  );
}
