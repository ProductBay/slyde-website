import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listAdminSlyders, listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";

export default async function AdminSlydersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const [{ user, mode }, zones, slyders] = await Promise.all([
    getAdminPageContext(),
    listCoverageZones(),
    listAdminSlyders({
      zone: typeof params.zone === "string" ? params.zone : undefined,
      readinessStatus: typeof params.readinessStatus === "string" ? params.readinessStatus : undefined,
      setupStatus: typeof params.setupStatus === "string" ? params.setupStatus : undefined,
      accountStatus: typeof params.accountStatus === "string" ? params.accountStatus : undefined,
    }),
  ]);

  return (
    <AdminShell
      title="Approved Slyders"
      description="Monitor approved courier accounts, setup progress, readiness state, and operational eligibility after application approval."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select className="field-input" name="zone" defaultValue={typeof params.zone === "string" ? params.zone : ""}>
              <option value="">All zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
            <select className="field-input" name="readinessStatus" defaultValue={typeof params.readinessStatus === "string" ? params.readinessStatus : ""}>
              <option value="">All readiness states</option>
              <option value="not_started">Not started</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="passed">Passed</option>
            </select>
            <select className="field-input" name="setupStatus" defaultValue={typeof params.setupStatus === "string" ? params.setupStatus : ""}>
              <option value="">All setup states</option>
              <option value="invited">Invited</option>
              <option value="activation_pending">Activation pending</option>
              <option value="contract_pending">Contract pending</option>
              <option value="setup_incomplete">Setup incomplete</option>
              <option value="readiness_pending">Readiness pending</option>
              <option value="eligible_offline">Eligible offline</option>
              <option value="eligible_online">Eligible online</option>
              <option value="blocked">Blocked</option>
            </select>
            <select className="field-input" name="accountStatus" defaultValue={typeof params.accountStatus === "string" ? params.accountStatus : ""}>
              <option value="">All account states</option>
              <option value="activation_pending">Activation pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Slyder</TableHeaderCell>
              <TableHeaderCell>Zone</TableHeaderCell>
              <TableHeaderCell>Courier</TableHeaderCell>
              <TableHeaderCell>Account</TableHeaderCell>
              <TableHeaderCell>Contract</TableHeaderCell>
              <TableHeaderCell>Setup</TableHeaderCell>
              <TableHeaderCell>Readiness</TableHeaderCell>
              <TableHeaderCell>Operational</TableHeaderCell>
              <TableHeaderCell>Approved At</TableHeaderCell>
              <TableHeaderCell>Can Go Online</TableHeaderCell>
              <TableHeaderCell>Can Receive Orders</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {slyders.map((item) => (
              <tr key={item.id}>
                <TableCell className="font-medium text-slate-950">{item.displayName}</TableCell>
                <TableCell>{item.zoneName}</TableCell>
                <TableCell>{item.courierType}</TableCell>
                <TableCell><StatusBadge status={item.accountStatus} /></TableCell>
                <TableCell>{item.contractAccepted ? "Accepted" : "Pending"}</TableCell>
                <TableCell><StatusBadge status={item.onboardingStatus} /></TableCell>
                <TableCell><StatusBadge status={item.readinessStatus === "failed" ? "failed_readiness" : item.readinessStatus} /></TableCell>
                <TableCell><StatusBadge status={item.operationalStatus} /></TableCell>
                <TableCell>{new Date(item.approvedAt).toLocaleString("en-JM")}</TableCell>
                <TableCell>{item.canGoOnline ? "Yes" : "No"}</TableCell>
                <TableCell>{item.canReceiveOrders ? "Yes" : "No"}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
