import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listAdminApplications } from "@/modules/admin/services/admin-control-tower.service";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, data] = await Promise.all([
    getAdminPageContext(),
    listAdminApplications({
      search: typeof params.search === "string" ? params.search : undefined,
      status: typeof params.status === "string" ? params.status : undefined,
      parish: typeof params.parish === "string" ? params.parish : undefined,
      zone: typeof params.zone === "string" ? params.zone : undefined,
      courierType: typeof params.courierType === "string" ? params.courierType : undefined,
      notificationStatus: typeof params.notificationStatus === "string" ? params.notificationStatus : undefined,
      sort: typeof params.sort === "string" ? (params.sort as "newest" | "oldest" | "zone" | "readiness") : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Slyder Applications"
      description="Search, filter, and triage applicant intake across the review queue with notification visibility and zone context."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input className="field-input" name="search" placeholder="Search applicant or code" defaultValue={typeof params.search === "string" ? params.search : ""} />
            <select className="field-input" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under review</option>
              <option value="documents_pending">Documents pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="field-input" name="parish" defaultValue={typeof params.parish === "string" ? params.parish : ""}>
              <option value="">All parishes</option>
              {data.parishes.map((parish) => (
                <option key={parish} value={parish}>{parish}</option>
              ))}
            </select>
            <select className="field-input" name="zone" defaultValue={typeof params.zone === "string" ? params.zone : ""}>
              <option value="">All zones</option>
              {data.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
            <select className="field-input" name="courierType" defaultValue={typeof params.courierType === "string" ? params.courierType : ""}>
              <option value="">All courier types</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="walker">Walker</option>
              <option value="other">Other</option>
            </select>
            <select className="field-input" name="sort" defaultValue={typeof params.sort === "string" ? params.sort : "newest"}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="zone">Sort by zone</option>
              <option value="readiness">Sort by readiness</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
            <Link href="/admin/slyder-applications" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
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
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Parish / Zone</TableHeaderCell>
                <TableHeaderCell>Courier</TableHeaderCell>
                <TableHeaderCell>Submitted</TableHeaderCell>
                <TableHeaderCell>Application</TableHeaderCell>
                <TableHeaderCell>WhatsApp</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Account</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <TableCell className="font-medium text-slate-950">{item.fullName}</TableCell>
                  <TableCell>{item.applicationCode}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.parish} / {item.zoneName}</TableCell>
                  <TableCell>{item.courierType}</TableCell>
                  <TableCell>{new Date(item.submittedAt).toLocaleString("en-JM")}</TableCell>
                  <TableCell><StatusBadge status={item.applicationStatus} /></TableCell>
                  <TableCell><StatusBadge status={item.whatsappStatus} /></TableCell>
                  <TableCell><StatusBadge status={item.emailStatus} /></TableCell>
                  <TableCell><StatusBadge status={item.accountStatus} /></TableCell>
                  <TableCell>
                    <Link href={`/admin/slyder-applications/${item.id}`} className="text-sm font-semibold text-sky-700">
                      View application
                    </Link>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      ) : (
        <EmptyState title="No applications match the current filters" description="Adjust the search or filters to bring applicants back into view." />
      )}
    </AdminShell>
  );
}
