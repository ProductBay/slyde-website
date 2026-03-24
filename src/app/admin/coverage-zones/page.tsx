import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";

export default async function CoverageZonesPage() {
  const [{ user, mode }, zones] = await Promise.all([getAdminPageContext(), listCoverageZones()]);

  return (
    <AdminShell
      title="Coverage Zones"
      description="Manage launch readiness, merchant availability, and live or paused state across the SLYDE rollout footprint."
      adminName={user.fullName}
      mode={mode}
    >
      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Zone</TableHeaderCell>
              <TableHeaderCell>Parish</TableHeaderCell>
              <TableHeaderCell>Launch Status</TableHeaderCell>
              <TableHeaderCell>Total Applicants</TableHeaderCell>
              <TableHeaderCell>Approved</TableHeaderCell>
              <TableHeaderCell>Ready</TableHeaderCell>
              <TableHeaderCell>Required</TableHeaderCell>
              <TableHeaderCell>Readiness</TableHeaderCell>
              <TableHeaderCell>Remaining</TableHeaderCell>
              <TableHeaderCell>Merchant</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <TableCell className="font-medium text-slate-950">{zone.name}</TableCell>
                <TableCell>{zone.parish}</TableCell>
                <TableCell><StatusBadge status={zone.launchStatus} /></TableCell>
                <TableCell>{zone.metrics.applicants}</TableCell>
                <TableCell>{zone.metrics.approvedSlyders}</TableCell>
                <TableCell>{zone.metrics.readySlyders}</TableCell>
                <TableCell>{zone.metrics.requiredReadySlyders}</TableCell>
                <TableCell>{zone.metrics.readinessPercentage}%</TableCell>
                <TableCell>{zone.metrics.remainingNeeded}</TableCell>
                <TableCell>{zone.merchantAvailability}</TableCell>
                <TableCell>
                  <Link href={`/admin/coverage-zones/${zone.id}`} className="text-sm font-semibold text-sky-700">
                    View zone
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
