import Link from "next/link";
import { ArrowRight, CheckCircle, Package, TrendingUp, Users, AlertCircle, Clock } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getResidentialStats } from "@/modules/admin/residential-management/residential-admin.repository";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default async function ResidentialAdminDashboard() {
  const [{ user, mode }, stats] = await Promise.all([
    getAdminPageContext(),
    getResidentialStats(),
  ]);

  return (
    <AdminShell
      title="Home-Slyde Residential"
      description="Manage resident signups and dispatch request lifecycle."
      adminName={user.fullName}
      mode={mode}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} label="Total Residents" value={stats.totalLeads} color="bg-sky-100 text-sky-600" />
        <StatCard icon={Users} label="New (30 days)" value={stats.activeLeads} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Package} label="Total Requests" value={stats.totalRequests} color="bg-violet-100 text-violet-600" />
        <StatCard icon={Clock} label="Pending Requests" value={stats.pendingRequests} color="bg-amber-100 text-amber-600" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completedRequests} color="bg-green-100 text-green-600" />
        <StatCard icon={TrendingUp} label="Success Rate" value={`${stats.successRate}%`} color="bg-teal-100 text-teal-600" />
      </div>

      {/* Quick Navigation */}
      <div className="mt-8 surface-panel p-6">
        <h2 className="text-lg font-semibold text-slate-950 mb-5">Management</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/admin/residential/leads"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-sky-50 hover:border-sky-200 transition"
          >
            <div>
              <p className="font-semibold text-slate-900">Resident Leads</p>
              <p className="text-sm text-slate-500 mt-1">Review and approve resident signups</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
          </Link>
          <Link
            href="/admin/residential/requests"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-sky-50 hover:border-sky-200 transition"
          >
            <div>
              <p className="font-semibold text-slate-900">Dispatch Requests</p>
              <p className="text-sm text-slate-500 mt-1">Monitor and manage pickup & delivery</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Workflow Guide */}
      <div className="mt-6 surface-panel p-6 border-l-4 border-sky-500">
        <h3 className="font-semibold text-slate-900 mb-4">Admin Workflow</h3>
        <ol className="space-y-3 text-sm text-slate-600">
          <li><span className="font-semibold text-slate-800">1. New signup</span> — Resident applies at /dispatch-from-home. Appears in Leads with status <em>submitted</em>.</li>
          <li><span className="font-semibold text-slate-800">2. Review &amp; approve</span> — Open lead detail, confirm details, click Approve (or Reject with reason).</li>
          <li><span className="font-semibold text-slate-800">3. Request submitted</span> — Approved resident submits pickup request. Appears in Dispatch Requests as <em>pending</em>.</li>
          <li><span className="font-semibold text-slate-800">4. Confirm request</span> — Review request details and confirm to proceed.</li>
          <li><span className="font-semibold text-slate-800">5. Lifecycle updates</span> — Update status through picked up → delivered. Cancel or mark failed if needed.</li>
        </ol>
      </div>
    </AdminShell>
  );
}
