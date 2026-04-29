import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listResidentialKycProfilesForAdmin } from "@/modules/residential-intake/repositories/residential-kyc.repository";
import type { ResidentKycStatus } from "@prisma/client";

const STATUS_BADGE: Record<ResidentKycStatus, string> = {
  not_submitted: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  resubmission_required: "bg-orange-100 text-orange-800",
};

export default async function ResidentialKycPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const status = typeof params.status === "string" ? (params.status as ResidentKycStatus) : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10)) : 1;
  const limit = 20;

  const [{ user, mode }, { profiles, total, pages }] = await Promise.all([
    getAdminPageContext(),
    listResidentialKycProfilesForAdmin(limit, (page - 1) * limit, { status }),
  ]);

  return (
    <AdminShell
      title="Resident Verification"
      description="Review TRN and ID documents before approving residential dispatch access."
      adminName={user.fullName}
      mode={mode}
    >
      <form method="get" className="mb-6">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-2">
            <select className="field-input" name="status" defaultValue={status || ""}>
              <option value="">All statuses</option>
              <option value="pending_review">Pending review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resubmission_required">Resubmission required</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">
            Apply
          </button>
        </div>
      </form>

      <p className="mb-4 text-sm text-slate-500">{total} verification profile{total !== 1 ? "s" : ""} found</p>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Resident</TableHeaderCell>
              <TableHeaderCell>TRN</TableHeaderCell>
              <TableHeaderCell>ID Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Submitted</TableHeaderCell>
              <TableHeaderCell> </TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No verification profiles found.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-950">
                    <div>{profile.user.fullName}</div>
                    <div className="text-xs text-slate-400">{profile.user.email}</div>
                  </TableCell>
                  <TableCell>{profile.trn}</TableCell>
                  <TableCell>{profile.idType.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[profile.kycStatus]}`}>
                      {profile.kycStatus}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(profile.submittedAt).toLocaleDateString("en-JM")}</TableCell>
                  <TableCell>
                    <Link href={`/admin/residential/kyc/${profile.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-800">
                      Review -&gt;
                    </Link>
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?status=${status || ""}&page=${page - 1}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`?status=${status || ""}&page=${page + 1}`}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
