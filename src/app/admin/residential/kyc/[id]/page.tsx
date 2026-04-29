import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  adminApproveResidentialKyc,
  adminRejectResidentialKyc,
  adminRequestResidentialKycResubmission,
} from "@/modules/admin/residential-management/residential-admin.actions";
import { getResidentialKycProfileById } from "@/modules/residential-intake/repositories/residential-kyc.repository";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function ResidentialKycReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ user, mode }, profile] = await Promise.all([
    getAdminPageContext(),
    getResidentialKycProfileById(id),
  ]);

  if (!profile) notFound();

  async function approveAction(formData: FormData) {
    "use server";
    const reviewNotes = (formData.get("reviewNotes") as string | null)?.trim();
    await adminApproveResidentialKyc(id, reviewNotes || undefined);
  }

  async function rejectAction(formData: FormData) {
    "use server";
    const reviewNotes = (formData.get("reviewNotes") as string | null)?.trim() || "KYC rejected";
    await adminRejectResidentialKyc(id, reviewNotes);
  }

  async function resubmissionAction(formData: FormData) {
    "use server";
    const reviewNotes = (formData.get("reviewNotes") as string | null)?.trim() || "Please resubmit with clearer documentation.";
    await adminRequestResidentialKycResubmission(id, reviewNotes);
  }

  return (
    <AdminShell
      title="KYC Review"
      description="Review resident identity details before approval."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="space-y-5">
        <Link href="/admin/residential/kyc" className="text-sm text-slate-500 hover:text-slate-900">
          &larr; Back to Verification Queue
        </Link>

        <div className="surface-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-950">Resident Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
              <p className="text-slate-900">{profile.user.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="text-slate-900">{profile.user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">TRN</p>
              <p className="text-slate-900">{profile.trn}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">ID Type</p>
              <p className="text-slate-900">{profile.idType.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
              <p className="text-slate-900">{new Date(profile.submittedAt).toLocaleString("en-JM")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-slate-900">{profile.kycStatus.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Uploaded ID</p>
            <a
              href={profile.idDocumentPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Open ID Document
            </a>
          </div>

          <form className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Review Notes</span>
              <textarea
                name="reviewNotes"
                rows={4}
                defaultValue={profile.reviewNotes || ""}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                placeholder="Add reason for approval/rejection or resubmission instructions"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                formAction={approveAction}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Approve
              </button>
              <button
                formAction={resubmissionAction}
                className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
              >
                Request Resubmission
              </button>
              <button
                formAction={rejectAction}
                className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Reject
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
