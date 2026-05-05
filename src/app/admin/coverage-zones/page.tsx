import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";
import { getLeadCountsByParish, normalizeParishKey } from "@/modules/leads/repositories/slyder-lead.repository";

// Medals for top-3
const MEDALS = ["🥇", "🥈", "🥉"];

// Kingston and St. Andrew form the same Corporate Area — roll St. Andrew leads into Kingston zone
const ST_ANDREW_KEY = normalizeParishKey("St. Andrew");
const KINGSTON_KEY = normalizeParishKey("Kingston");

function buildInsight(
  top3: { parish: string; zone: string; count: number }[],
): string {
  if (top3.length === 0) return "No Slyder lead submissions yet. Share the /join/slyder page to start building pipeline by parish.";

  const lines = top3.map(
    (item, i) =>
      `${MEDALS[i]} ${item.zone} (${item.parish}) — ${item.count} lead${item.count !== 1 ? "s" : ""}`,
  );

  const top = top3[0];
  const totalTop3 = top3.reduce((s, t) => s + t.count, 0);

  return (
    `Top demand zones by Slyder lead submissions:\n${lines.join("\n")}\n\n` +
    `${top.zone} leads interest with ${top.count} submission${top.count !== 1 ? "s" : ""}. ` +
    `These 3 zones account for ${totalTop3} leads combined — prioritise recruitment and merchant outreach here to accelerate readiness.`
  );
}

export default async function CoverageZonesPage() {
  const [{ user, mode }, zones, leadsByParish] = await Promise.all([
    getAdminPageContext(),
    listCoverageZones(),
    getLeadCountsByParish(),
  ]);

  // Attach lead count — normalise parish keys (strip dots) so "St. James" matches "St James" etc.
  // St. Andrew leads roll up to Kingston zone (same Corporate Area).
  const zonesWithLeads = zones.map((zone) => {
    const key = normalizeParishKey(zone.parish);
    const base = leadsByParish[key] ?? 0;
    const stAndrew = key === KINGSTON_KEY ? (leadsByParish[ST_ANDREW_KEY] ?? 0) : 0;
    return { ...zone, leadCount: base + stAndrew };
  });

  // Top-3 zones by lead count (only those with at least 1)
  const top3 = [...zonesWithLeads]
    .filter((z) => z.leadCount > 0)
    .sort((a, b) => b.leadCount - a.leadCount)
    .slice(0, 3)
    .map((z) => ({ parish: z.parish, zone: z.name, count: z.leadCount }));

  const insight = buildInsight(top3);
  const totalLeads = Object.values(leadsByParish).reduce((s, n) => s + n, 0);

  return (
    <AdminShell
      title="Coverage Zones"
      description="Manage launch readiness, merchant availability, and live or paused state across the SLYDE rollout footprint."
      adminName={user.fullName}
      mode={mode}
    >
      {/* AI Insight: Top 3 lead zones */}
      <div className="mb-6 rounded-[1.75rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold text-sky-900">Lead Demand Intelligence</h2>
              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-semibold text-sky-700">
                {totalLeads} total lead{totalLeads !== 1 ? "s" : ""} across all parishes
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{insight}</p>

            {top3.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {top3.map((item, i) => (
                  <div
                    key={item.parish}
                    className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-2 shadow-sm"
                  >
                    <span className="text-lg leading-none">{MEDALS[i]}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.zone}</p>
                      <p className="text-xs text-slate-500">{item.count} lead{item.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Zone</TableHeaderCell>
              <TableHeaderCell>Parish</TableHeaderCell>
              <TableHeaderCell>Launch Status</TableHeaderCell>
              <TableHeaderCell>Slyder Leads</TableHeaderCell>
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
            {zonesWithLeads.map((zone) => (
              <tr key={zone.id}>
                <TableCell className="font-medium text-slate-950">{zone.name}</TableCell>
                <TableCell>{zone.parish}</TableCell>
                <TableCell><StatusBadge status={zone.launchStatus} /></TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${zone.leadCount > 0 ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-400"}`}>
                    {zone.leadCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                    {zone.leadCount}
                  </span>
                </TableCell>
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

