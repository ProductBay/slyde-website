type FunnelMetrics = {
  totalLeads: number;
  qualified: number;
  nurturing: number;
  startedApplication: number;
  submitted: number;
  underReview: number;
  approved: number;
  activated: number;
  live: number;
  rejected: number;
  conversionRates: {
    leadToQualified: number;
    qualifiedToStarted: number;
    startedToSubmitted: number;
    submittedToApproved: number;
    approvedToActivated: number;
  };
};

function MetricTile({ label, value, pct }: { label: string; value: number; pct?: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-soft backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{value.toLocaleString()}</p>
      {pct !== undefined && (
        <p className="mt-1 text-sm text-slate-500">
          <span className="font-medium text-sky-700">{pct}%</span> conversion
        </p>
      )}
    </div>
  );
}

function ConversionRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-800">{pct}%</span>
      </div>
    </div>
  );
}

export function SlyderFunnelMetrics({ metrics }: { metrics: FunnelMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Total Leads" value={metrics.totalLeads} />
        <MetricTile label="Qualified" value={metrics.qualified} pct={metrics.conversionRates.leadToQualified} />
        <MetricTile label="Started Application" value={metrics.startedApplication} />
        <MetricTile label="Submitted" value={metrics.submitted} />
        <MetricTile label="Under Review" value={metrics.underReview} />
        <MetricTile label="Approved" value={metrics.approved} />
        <MetricTile label="Activated" value={metrics.activated} />
        <MetricTile label="Live" value={metrics.live} />
      </div>

      <div className="surface-panel p-6">
        <p className="text-sm font-semibold text-slate-800 mb-5">Conversion Rates</p>
        <div className="space-y-4">
          <ConversionRow label="Lead → Qualified" pct={metrics.conversionRates.leadToQualified} />
          <ConversionRow label="Qualified → Started Application" pct={metrics.conversionRates.qualifiedToStarted} />
          <ConversionRow label="Started → Submitted" pct={metrics.conversionRates.startedToSubmitted} />
          <ConversionRow label="Submitted → Approved" pct={metrics.conversionRates.submittedToApproved} />
          <ConversionRow label="Approved → Activated" pct={metrics.conversionRates.approvedToActivated} />
        </div>
      </div>
    </div>
  );
}
