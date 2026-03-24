import { AdminShell } from "@/components/admin/admin-shell";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { ZoneReadinessCard } from "@/components/admin/zone-readiness-card";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";

export default async function NetworkReadinessPage() {
  const [{ user, mode }, zones] = await Promise.all([getAdminPageContext(), listCoverageZones()]);
  const strongest = zones.slice(0, 5);
  const recruitmentPush = zones.filter((zone) => zone.metrics.remainingNeeded >= 5).slice(0, 5);
  const soon = zones.filter((zone) => zone.launchStatus === "near_ready" || zone.launchStatus === "ready");
  const live = zones.filter((zone) => zone.launchStatus === "live");

  return (
    <AdminShell
      title="Network Readiness"
      description="Strategic readiness analytics showing where SLYDE is strongest, where recruitment should intensify, and which zones are closest to launch."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard label="Top 5 Strongest Zones" value={strongest.length} subtext="Highest readiness scores" />
        <KpiStatCard label="Recruitment Push Zones" value={recruitmentPush.length} subtext="Need more ready Slyders" />
        <KpiStatCard label="Merchant Soon" value={soon.length} subtext="Candidate zones for merchant onboarding" />
        <KpiStatCard label="Live Zones" value={live.length} subtext="Already active" />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <div>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Readiness Leaderboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Top 5 strongest zones</h2>
          </div>
          <div className="grid gap-4">
            {strongest.map((zone) => (
              <ZoneReadinessCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Recruitment Push</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Zones needing network growth</h2>
            </div>
            <div className="grid gap-4">
              {recruitmentPush.map((zone) => (
                <ZoneReadinessCard key={zone.id} zone={zone} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
