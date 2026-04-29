import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ActionModal } from "@/components/admin/action-modal";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getResidentialLeadDetails } from "@/modules/admin/residential-management/residential-admin.repository";

const STATUS_BADGE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  handed_off: "bg-purple-100 text-purple-800",
  failed: "bg-slate-100 text-slate-600",
};

export default async function ResidentialLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, lead] = await Promise.all([
    getAdminPageContext(),
    getResidentialLeadDetails(id),
  ]);

  if (!lead) notFound();

  const canAct = lead.status === "submitted" || lead.status === "contacted";

  return (
    <AdminShell title="Residential Lead" adminName={user.fullName} mode={mode}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/residential/leads" className="text-sky-600 hover:text-sky-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.fullName}</h1>
            <p className="text-sm text-slate-500">Ref: {lead.referenceCode}</p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[lead.status] ?? "bg-slate-100 text-slate-700"}`}>
                {lead.status.replace(/_/g, " ")}
              </span>
            </div>
            {canAct && (
              <div className="flex gap-3">
                <ActionModal
                  triggerLabel="Approve"
                  title="Approve Residential Lead"
                  description={`Approve ${lead.fullName}'s residential lead. This will allow them to proceed to dispatch.`}
                  endpoint={`/api/admin/residential/leads/${id}/approve`}
                  payload={{}}
                  confirmLabel="Confirm Approval"
                  kind="approve"
                />
                <ActionModal
                  triggerLabel="Reject"
                  title="Reject Residential Lead"
                  description={`Reject ${lead.fullName}'s residential lead. A reason is required.`}
                  endpoint={`/api/admin/residential/leads/${id}/reject`}
                  payload={{}}
                  confirmLabel="Confirm Rejection"
                  kind="reject"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lead Info */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><dt className="font-medium text-slate-500">Full Name</dt><dd className="mt-0.5 text-slate-900">{lead.fullName}</dd></div>
            <div><dt className="font-medium text-slate-500">Phone</dt><dd className="mt-0.5 text-slate-900">{lead.phone}</dd></div>
            <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-0.5 text-slate-900">{lead.email ?? "—"}</dd></div>
            <div><dt className="font-medium text-slate-500">Parish</dt><dd className="mt-0.5 text-slate-900">{lead.parish}</dd></div>
            <div><dt className="font-medium text-slate-500">Area</dt><dd className="mt-0.5 text-slate-900">{lead.area}</dd></div>
            <div><dt className="font-medium text-slate-500">Reference Code</dt><dd className="mt-0.5 font-mono text-slate-900">{lead.referenceCode}</dd></div>
            <div><dt className="font-medium text-slate-500">Submitted</dt><dd className="mt-0.5 text-slate-900">{new Date(lead.createdAt).toLocaleString()}</dd></div>
            <div><dt className="font-medium text-slate-500">Campaign Source</dt><dd className="mt-0.5 text-slate-900">{lead.sourceCampaign ?? "—"}</dd></div>
          </dl>
        </div>

        {/* Dispatch Intent */}
        {lead.dispatchIntent && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Dispatch Intent</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div><dt className="font-medium text-slate-500">Pickup Address</dt><dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.pickupAddress}</dd></div>
              <div><dt className="font-medium text-slate-500">Dropoff</dt><dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.dropoffAddress}, {lead.dispatchIntent.dropoffArea}, {lead.dispatchIntent.dropoffParish}</dd></div>
              <div><dt className="font-medium text-slate-500">Parcel Category</dt><dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.parcelCategory.replace(/_/g, " ")}</dd></div>
              <div><dt className="font-medium text-slate-500">Urgency</dt><dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.urgency}</dd></div>
              <div><dt className="font-medium text-slate-500">Payment Preference</dt><dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.paymentPreference.replace(/_/g, " ")}</dd></div>
              <div>
                <dt className="font-medium text-slate-500">Estimated Fee</dt>
                <dd className="mt-0.5 text-slate-900">
                  {lead.dispatchIntent.estimatedFeeMin != null && lead.dispatchIntent.estimatedFeeMax != null
                    ? `JMD ${lead.dispatchIntent.estimatedFeeMin.toLocaleString()} – ${lead.dispatchIntent.estimatedFeeMax.toLocaleString()}`
                    : "—"}
                </dd>
              </div>
            </dl>
            {lead.dispatchIntent.parcelNotes && (
              <div className="mt-4 text-sm">
                <dt className="font-medium text-slate-500">Parcel Notes</dt>
                <dd className="mt-0.5 text-slate-900">{lead.dispatchIntent.parcelNotes}</dd>
              </div>
            )}
          </div>
        )}

        {/* Dispatch Request */}
        {lead.dispatchRequest && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Dispatch Request</h2>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="text-slate-500">Reference</p>
                <p className="font-mono text-slate-900">{lead.dispatchRequest.referenceCode}</p>
              </div>
              <Link
                href={`/admin/residential/requests/${lead.dispatchRequest.id}`}
                className="text-sky-600 hover:text-sky-700 font-medium text-sm"
              >
                View Full Request →
              </Link>
            </div>
          </div>
        )}

        {/* Handoff Job */}
        {lead.handoffJob && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Handoff Job</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <div><dt className="font-medium text-slate-500">State</dt><dd className="mt-0.5 font-medium text-slate-900">{lead.handoffJob.state}</dd></div>
              <div><dt className="font-medium text-slate-500">Attempts</dt><dd className="mt-0.5 text-slate-900">{lead.handoffJob.attempts}</dd></div>
              <div><dt className="font-medium text-slate-500">Next Retry</dt><dd className="mt-0.5 text-slate-900">{lead.handoffJob.nextRetryAt ? new Date(lead.handoffJob.nextRetryAt).toLocaleString() : "—"}</dd></div>
            </dl>
            {lead.handoffJob.lastError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800">
                {lead.handoffJob.lastError}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
