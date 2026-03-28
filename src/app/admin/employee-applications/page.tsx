import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { listAdminEmployeeApplications } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminEmployeeApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, data] = await Promise.all([
    getAdminPageContext(),
    listAdminEmployeeApplications({
      search: typeof params.search === "string" ? params.search : undefined,
      status: typeof params.status === "string" ? params.status : undefined,
      department: typeof params.department === "string" ? params.department : undefined,
      sort: typeof params.sort === "string" ? (params.sort as "newest" | "oldest") : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Employee Applications"
      description="Review internal staff applicants, send first-time employee invites, and track who has entered the onboarding flow."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input className="field-input" name="search" placeholder="Search applicant, role, or location" defaultValue={typeof params.search === "string" ? params.search : ""} />
            <select className="field-input" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under review</option>
              <option value="interview">Interview</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="field-input" name="department" defaultValue={typeof params.department === "string" ? params.department : ""}>
              <option value="">All departments</option>
              {data.departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <select className="field-input" name="sort" defaultValue={typeof params.sort === "string" ? params.sort : "newest"}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
            <Link href="/admin/employee-applications" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Reset
            </Link>
          </div>
        </FilterBar>
      </form>

      {data.items.length ? (
        <DataTable>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/90">
              <tr>
                <TableHeaderCell>Applicant</TableHeaderCell>
                <TableHeaderCell>Role / Department</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Submitted</TableHeaderCell>
                <TableHeaderCell>Application</TableHeaderCell>
                <TableHeaderCell>Invite Email</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <TableCell>
                    <p className="font-medium text-slate-950">{item.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                  </TableCell>
                  <TableCell>{item.roleInterest} / {item.departmentInterest}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{new Date(item.submittedAt).toLocaleString("en-JM")}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell><StatusBadge status={item.inviteEmailStatus} /></TableCell>
                  <TableCell>
                    <Link href={`/admin/employee-applications/${item.id}`} className="text-sm font-semibold text-sky-700">
                      Review application
                    </Link>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      ) : (
        <EmptyState title="No employee applications match the current filters" description="Adjust the filters to bring internal applicant records back into view." />
      )}
    </AdminShell>
  );
}
