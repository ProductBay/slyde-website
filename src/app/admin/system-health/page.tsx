import { AdminShell } from "@/components/admin/admin-shell";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getSystemHealthSummary } from "@/server/ops/system-health.service";

export default async function AdminSystemHealthPage() {
  const [{ user, mode }, health] = await Promise.all([getAdminPageContext(), getSystemHealthSummary()]);

  return (
    <AdminShell
      title="System Health"
      description="Track production-readiness signals for hosting lock, persistence, storage, notification delivery, bot protection, and integration configuration."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiStatCard label="Overall" value={health.overallStatus === "healthy" ? 1 : 0} subtext={health.overallStatus} />
        <KpiStatCard label="Hosting Lock" value={health.hosting.productionLocked ? 1 : 0} subtext={health.hosting.productionLocked ? "locked" : "not locked"} />
        <KpiStatCard label="Persistence" value={health.persistence.status === "healthy" ? 1 : 0} subtext={health.persistence.status} />
        <KpiStatCard label="Storage" value={health.storage.status === "healthy" ? 1 : 0} subtext={health.storage.status} />
        <KpiStatCard label="Email Provider" value={health.notifications.email.configured ? 1 : 0} subtext={health.notifications.email.provider} />
        <KpiStatCard label="Bot Protection" value={health.botProtection.mode === "off" ? 0 : 1} subtext={health.botProtection.mode} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="surface-panel p-6">
          <h2 className="text-2xl font-semibold text-slate-950">Infrastructure</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Persistence</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {health.persistence.driver} | {health.persistence.status}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{health.persistence.message}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Upload storage</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{health.storage.status}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{health.storage.message}</p>
              <p className="mt-2 break-all text-xs text-slate-500">{health.storage.uploadsDirectory}</p>
            </div>
          </div>
        </div>

        <div className="surface-panel p-6">
          <h2 className="text-2xl font-semibold text-slate-950">Runtime Configuration</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Production hosting lock</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Node env: {health.hosting.nodeEnv}</p>
              <p className="text-sm leading-7 text-slate-600">Website URL: {health.hosting.websiteBaseUrl || "Missing"}</p>
              <p className="text-sm leading-7 text-slate-600">App sync URL: {health.hosting.slydeAppSyncBaseUrl || "Missing"}</p>
              {health.hosting.warnings.length ? (
                <div className="mt-3 grid gap-2">
                  {health.hosting.warnings.map((warning) => (
                    <p key={warning} className="text-sm text-amber-600">
                      {warning}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-emerald-600">Production hosting and env lock look clean.</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notifications</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Email: {health.notifications.email.provider}</p>
              <p className="text-sm leading-7 text-slate-600">WhatsApp: {health.notifications.whatsapp.provider}</p>
              <p className="text-sm leading-7 text-slate-600">SMS: {health.notifications.sms.provider}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bot protection</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Mode: {health.botProtection.mode}</p>
              <p className="text-sm leading-7 text-slate-600">Configured: {health.botProtection.configured ? "Yes" : "No"}</p>
              <p className="text-sm leading-7 text-slate-600">
                Keys present: {health.botProtection.siteKeyPresent ? "site" : "no site"} / {health.botProtection.secretKeyPresent ? "secret" : "no secret"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Critical environment checks</p>
              <div className="mt-3 grid gap-2">
                {health.env.checks.map((check) => (
                  <p key={check.key} className="text-sm text-slate-600">
                    {check.key}: {check.ok ? "OK" : "Missing"}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
