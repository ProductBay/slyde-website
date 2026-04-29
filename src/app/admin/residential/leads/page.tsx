import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getResidentialLeadsForAdmin } from "@/modules/admin/residential-management/residential-admin.repository";
import type { ResidentialIntakeStatus } from "@prisma/client";

const STATUS_BADGE: Record<ResidentialIntakeStatus, string> = {
  submitted:   "bg-sky-100 text-sky-800",
  contacted:   "bg-blue-100 text-blue-800",
  approved:    "bg-green-100 text-green-800",
  rejected:    "bg-red-100 text-red-800",
  handed_off:  "bg-violet-100 text-violet-800",
  failed:      "bg-slate-100 text-slate-600",
};

export default async function ResidentialLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? (params.status as ResidentialIntakeStatus) : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10)) : 1;
  const limit = 20;

  const [{ user, mode }, { leads, total, pages }] = await Promise.all([
    getAdminPageContext(),
    getResidentialLeadsForAdmin(limit, (page - 1) * limit, {
      status: status as ResidentialIntakeStatus | undefined,
      searchQuery: search,
    }),
  ]);

  return (
    <AdminShell
      title="Resident Leads"
      description="Review and manage Home-Slyde residential signup applications."
      adminName={user.fullName}
      mode={mode}
    >
      {/* Filters */}
      <form method="get" className="mb-6">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <input
              className="field-input"
              name="search"
              placeholder="Search name, phone, email, code"
              defaultValue={search || ""}
            />
            <select className="field-input" name="status" defaultValue={status || ""}>
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">
            Apply
          </button>
        </div>
      </form>

      <p className="mb-4 text-sm text-slate-500">{total} resident{total !== 1 ? "s" : ""} found</p>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Dispatch Request</TableHeaderCell>
              <TableHeaderCell>Signed Up</TableHeaderCell>
              <TableHeaderCell> </TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-950">
                    <div>{lead.fullName}</div>
                    <div className="text-xs text-slate-400">{lead.referenceCode}</div>
                  </TableCell>
                  <TableCell>
                    <div>{lead.phone}</div>
                    {lead.email && <div className="text-xs text-slate-400">{lead.email}</div>}
                  </TableCell>
                  <TableCell>
                    <div>{lead.area}</div>
                    <div className="text-xs text-slate-400">{lead.parish}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[lead.status]}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lead.dispatchRequest ? (
                      <Link
                        href={`/admin/residential/requests/${lead.dispatchRequest.id}`}
                        className="text-sky-600 hover:underline text-xs"
                      >
                        {lead.dispatchRequest.status}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(lead.createdAt).toLocaleDateString("en-JM")}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/residential/leads/${lead.id}`}
                      className="text-sm font-medium text-sky-600 hover:text-sky-800"
                    >
                      Review →
                    </Link>
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?search=${search || ""}&status=${status || ""}&page=${page - 1}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`?search=${search || ""}&status=${status || ""}&page=${page + 1}`}
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
