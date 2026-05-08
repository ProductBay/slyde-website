import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";
import { getLeadCountsByParish, normalizeParishKey } from "@/modules/leads/repositories/slyder-lead.repository";

const RANKS = ["#1", "#2", "#3"];

const VALID_PARISHES = new Set([
  "kingston", "st andrew", "st thomas", "portland", "st mary",
  "st ann", "trelawny", "st james", "hanover", "westmoreland",
  "st elizabeth", "manchester", "clarendon", "st catherine",
]);

const CANONICAL_ZONE_IDS = new Set([
  "11111111-1111-4111-8111-111111111111",
  "st-andrew", "morant-bay", "port-antonio", "port-maria",
  "ochos-rios", "falmouth", "montego-bay", "lucea",
  "savanna-la-mar", "black-river", "mandeville", "may-pen", "spanish-town",
]);

const PARISH_TOWNS: Record<string, string[]> = {
  "kingston": ["New Kingston", "Downtown Kingston", "Cross Roads"],
  "st andrew": ["Half Way Tree", "Constant Spring", "Liguanea", "Papine"],
  "st thomas": ["Morant Bay", "Yallahs", "Port Morant"],
  "portland": ["Port Antonio", "Buff Bay", "Manchioneal"],
  "st mary": ["Port Maria", "Annotto Bay", "Oracabessa"],
  "st ann": ["Ocho Rios", "St. Ann's Bay", "Brown's Town", "Runaway Bay"],
  "trelawny": ["Falmouth", "Clark's Town", "Wakefield"],
  "st james": ["Montego Bay", "Ironshore", "Rose Hall"],
  "hanover": ["Lucea", "Green Island", "Sandy Bay"],
  "westmoreland": ["Savanna-la-Mar", "Negril", "Whithorn"],
  "st elizabeth": ["Black River", "Santa Cruz", "Junction"],
  "manchester": ["Mandeville", "Christiana", "Porus"],
  "clarendon": ["May Pen", "Chapelton", "Lionel Town"],
  "st catherine": ["Spanish Town", "Portmore", "Old Harbour", "Linstead"],
};

function deduplicateByParish<T extends { id: string; parish: string; leadCount: number }>(zones: T[]): T[] {
  const byParish = new Map<string, T>();

  for (const zone of zones) {
    const key = normalizeParishKey(zone.parish);
    if (!VALID_PARISHES.has(key)) continue;

    const existing = byParish.get(key);
    if (!existing) {
      byParish.set(key, zone);
      continue;
    }

    const preferNew = CANONICAL_ZONE_IDS.has(zone.id) && !CANONICAL_ZONE_IDS.has(existing.id);
    const keeper = preferNew ? zone : existing;
    const other = preferNew ? existing : zone;
    byParish.set(key, { ...keeper, leadCount: Math.max(keeper.leadCount, other.leadCount) });
  }

  return Array.from(byParish.values());
}

function buildInsight(
  top3: { parish: string; zone: string; count: number }[],
  summary: {
    totalLeads: number;
    activeParishes: number;
    totalParishes: number;
    top3Total: number;
    totalRequiredReadySlyders: number;
    totalReadySlyders: number;
  },
) {
  if (summary.totalLeads === 0) {
    return "No Slyder lead submissions yet. Share the /join/slyder page to start building pipeline by parish.";
  }

  const lines = top3.map(
    (item, index) => `${RANKS[index]} ${item.zone} (${item.parish}) - ${item.count} lead${item.count !== 1 ? "s" : ""}`,
  );
  const top = top3[0];
  const top3Share = Math.round((summary.top3Total / summary.totalLeads) * 100);
  const readyGap = Math.max(summary.totalRequiredReadySlyders - summary.totalReadySlyders, 0);
  const overallReadiness = summary.totalRequiredReadySlyders > 0
    ? Math.round((summary.totalReadySlyders / summary.totalRequiredReadySlyders) * 100)
    : 0;

  return (
    `Overall Slyder lead demand: ${summary.totalLeads} lead${summary.totalLeads !== 1 ? "s" : ""} across ${summary.activeParishes} of ${summary.totalParishes} parishes. ` +
    `The top ${top3.length} parish zone${top3.length !== 1 ? "s" : ""} account for ${summary.top3Total} lead${summary.top3Total !== 1 ? "s" : ""}, or ${top3Share}% of total lead demand.\n\n` +
    `Network readiness summary: ${summary.totalReadySlyders} ready Slyder${summary.totalReadySlyders !== 1 ? "s" : ""} against ${summary.totalRequiredReadySlyders} required across displayed zones (${overallReadiness}% overall readiness), with ${readyGap} more ready Slyder${readyGap !== 1 ? "s" : ""} needed to satisfy all current zone thresholds.\n\n` +
    `Top demand zones by Slyder lead submissions:\n${lines.join("\n")}\n\n` +
    `${top.zone} leads interest with ${top.count} submission${top.count !== 1 ? "s" : ""}. Prioritise recruitment and merchant outreach here to accelerate readiness.`
  );
}

export default async function CoverageZonesPage() {
  const [{ user, mode }, zones, leadsByParish] = await Promise.all([
    getAdminPageContext(),
    listCoverageZones(),
    getLeadCountsByParish(),
  ]);

  const zonesWithLeads = zones.map((zone) => {
    const key = normalizeParishKey(zone.parish);
    return {
      ...zone,
      leadCount: leadsByParish[key] ?? 0,
      majorTowns: PARISH_TOWNS[key] ?? [],
    };
  });

  const dedupedZones = deduplicateByParish(zonesWithLeads);
  const top3 = [...dedupedZones]
    .filter((zone) => zone.leadCount > 0)
    .sort((left, right) => right.leadCount - left.leadCount)
    .slice(0, 3)
    .map((zone) => ({ parish: zone.parish, zone: zone.name, count: zone.leadCount }));

  const totalLeads = Object.values(leadsByParish).reduce((sum, count) => sum + count, 0);
  const activeParishes = dedupedZones.filter((zone) => zone.leadCount > 0).length;
  const top3Total = top3.reduce((sum, zone) => sum + zone.count, 0);
  const totalRequiredReadySlyders = dedupedZones.reduce((sum, zone) => sum + zone.metrics.requiredReadySlyders, 0);
  const totalReadySlyders = dedupedZones.reduce((sum, zone) => sum + zone.metrics.readySlyders, 0);
  const totalRemainingNeeded = Math.max(totalRequiredReadySlyders - totalReadySlyders, 0);
  const insight = buildInsight(top3, {
    totalLeads,
    activeParishes,
    totalParishes: dedupedZones.length,
    top3Total,
    totalRequiredReadySlyders,
    totalReadySlyders,
  });

  return (
    <AdminShell
      title="Coverage Zones"
      description="Manage launch readiness, merchant availability, and live or paused state across the SLYDE rollout footprint."
      adminName={user.fullName}
      mode={mode}
    >
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
              <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {activeParishes}/{dedupedZones.length} parishes with demand
              </span>
              <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {totalRemainingNeeded} ready Slyders still needed
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{insight}</p>

            {top3.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {top3.map((item, index) => (
                  <div
                    key={item.parish}
                    className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-2 shadow-sm"
                  >
                    <span className="text-sm font-bold text-sky-700">{RANKS[index]}</span>
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
              <TableHeaderCell>Major Towns</TableHeaderCell>
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
            {dedupedZones.map((zone) => (
              <tr key={zone.id}>
                <TableCell className="font-medium text-slate-950">{zone.name}</TableCell>
                <TableCell>{zone.parish}</TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500">
                    {zone.majorTowns.length > 0 ? zone.majorTowns.join(", ") : "-"}
                  </span>
                </TableCell>
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
